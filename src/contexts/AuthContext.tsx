import React, { createContext, useContext, useEffect, useState } from "react";
import { AxiosError } from "axios";
import {
  adminLogin as adminLoginRequest,
  completeProfile as completeProfileRequest,
  googleLogin as googleLoginRequest,
  requestOtp as requestOtpRequest,
  updateDeliveryPreference as updateDeliveryPreferenceRequest,
  verifyOtp as verifyOtpRequest,
} from "../services/authService";

import { useProcessing } from "./ProcessingContext";
import { AuthUser, DeliveryMode, OtpChallengeResponse } from "../types/store";

interface AuthActionResult<T = void> {
  data?: T;
  error?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  requestOtp: (email: string) => Promise<AuthActionResult<OtpChallengeResponse>>;
  verifyOtp: (email: string, otpCode: string) => Promise<AuthActionResult>;
  googleLogin: (credential: string) => Promise<AuthActionResult>;
  adminLogin: (email: string, password: string) => Promise<AuthActionResult>;
  completeProfile: (fullName: string) => Promise<AuthActionResult>;
  updateDeliveryPreference: (mode: DeliveryMode) => Promise<AuthActionResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = "voltmart-auth-user";
const TOKEN_STORAGE_KEY = "voltmart-token";

const getDisplayName = (user: AuthUser | null) => {
  const fullName = user?.fullName?.trim();
  if (fullName) {
    return fullName;
  }

  return "";
};

const shouldRequireCustomerName = (user: AuthUser | null) =>
  Boolean(user?.role === "ROLE_CUSTOMER" && !getDisplayName(user));

const extractErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    const responseMessage = error.response?.data?.message;
    if (typeof responseMessage === "string" && responseMessage.trim()) {
      return responseMessage;
    }

    const fieldErrors = error.response?.data?.errors;
    if (fieldErrors && typeof fieldErrors === "object") {
      const firstFieldMessage = Object.values(fieldErrors).find(
        (value) => typeof value === "string" && value.trim(),
      );
      if (typeof firstFieldMessage === "string") {
        return firstFieldMessage;
      }
    }
  }

  return fallback;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeliveryPreferenceModal, setShowDeliveryPreferenceModal] = useState(false);
  const [showProfileCompletionModal, setShowProfileCompletionModal] = useState(false);
  const [pendingDeliveryPreferencePrompt, setPendingDeliveryPreferencePrompt] = useState(false);
  const [welcomeUser, setWelcomeUser] = useState<string | null>(null);
  const { startProcessing, stopProcessing } = useProcessing();

  useEffect(() => {
    const storedUser = window.localStorage.getItem(AUTH_STORAGE_KEY);
    const storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);

    if (!storedUser || !storedToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser) as AuthUser;
      setUser(parsedUser);
      setToken(storedToken);
    } catch {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      setUser(null);
      setToken(null);
    }

    setWelcomeUser(null);
    setLoading(false);
  }, []);

  const persistAuth = (
    nextUser: AuthUser | null,
    nextToken: string | null,
    options?: {
      promptDeliveryPreference?: boolean;
      requireProfileCompletion?: boolean;
      showWelcomeGreeting?: boolean;
    },
  ) => {
    setUser(nextUser);
    setToken(nextToken);
    const shouldRequireProfileCompletion = Boolean(
      nextUser &&
        nextToken &&
        (options?.requireProfileCompletion || shouldRequireCustomerName(nextUser)),
    );
    const shouldPromptDeliveryPreference = Boolean(
      options?.promptDeliveryPreference &&
        !shouldRequireProfileCompletion &&
        nextUser &&
        nextToken &&
        nextUser.role === "ROLE_CUSTOMER" &&
        !nextUser.preferredDeliveryMode,
    );
    const shouldDelayDeliveryPreference = Boolean(
      shouldPromptDeliveryPreference && options?.showWelcomeGreeting,
    );

    setShowProfileCompletionModal(shouldRequireProfileCompletion);
    setShowDeliveryPreferenceModal(shouldPromptDeliveryPreference && !shouldDelayDeliveryPreference);
    setPendingDeliveryPreferencePrompt(shouldDelayDeliveryPreference);

    if (nextUser && nextToken) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
      window.localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);

      const displayName = getDisplayName(nextUser);
      if (options?.showWelcomeGreeting && displayName) {
        setWelcomeUser(displayName);
      }
      return;
    }

    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    setWelcomeUser(null);
  };

  useEffect(() => {
    if (!pendingDeliveryPreferencePrompt) {
      return;
    }

    setShowDeliveryPreferenceModal(true);
    setPendingDeliveryPreferencePrompt(false);
  }, [pendingDeliveryPreferencePrompt]);

  useEffect(() => {
    if (!welcomeUser) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setWelcomeUser(null);
    }, 5000);

    return () => window.clearTimeout(timeoutId);
  }, [welcomeUser]);

  const requestOtp = async (email: string) => {
    const processingId = startProcessing({
      title: "Sending OTP",
      message: "We are preparing your sign-in code now...",
    });
    try {
      return { data: await requestOtpRequest({ email }) };
    } catch (error) {
      return {
        error: extractErrorMessage(error, "Unable to send OTP right now."),
      };
    } finally {
      stopProcessing(processingId);
    }
  };

  const verifyOtp = async (email: string, otpCode: string) => {
    const processingId = startProcessing({
      title: "Signing you in",
      message: "Checking your OTP and preparing your account...",
    });
    try {
      const response = await verifyOtpRequest({ email, otpCode });
      persistAuth(response.user, response.token, {
        promptDeliveryPreference: true,
        requireProfileCompletion: response.requiresProfileCompletion,
        showWelcomeGreeting: !response.requiresProfileCompletion,
      });

      return {};
    } catch (error) {
      return {
        error: extractErrorMessage(error, "Unable to verify OTP right now."),
      };
    } finally {
      stopProcessing(processingId);
    }
  };

  const googleLogin = async (credential: string) => {
    const processingId = startProcessing({
      title: "Signing you in",
      message: "Verifying your account and preparing your session...",
    });
    try {
      const response = await googleLoginRequest({ credential });
      persistAuth(response.user, response.token, {
        promptDeliveryPreference: true,
        requireProfileCompletion: response.requiresProfileCompletion,
        showWelcomeGreeting: !response.requiresProfileCompletion,
      });

      return {};
    } catch (error) {
      return {
        error: extractErrorMessage(error, "Unable to log in with Google right now."),
      };
    } finally {
      stopProcessing(processingId);
    }
  };

  const adminLogin = async (email: string, password: string) => {
    const processingId = startProcessing({
      title: "Opening admin portal",
      message: "Authenticating your credentials and loading admin access...",
    });
    try {
      const response = await adminLoginRequest({ email, password });
      persistAuth(response.user, response.token, {
        requireProfileCompletion: response.requiresProfileCompletion,
        showWelcomeGreeting: true,
      });

      return {};
    } catch (error) {
      return {
        error: extractErrorMessage(error, "Unable to log in right now."),
      };
    } finally {
      stopProcessing(processingId);
    }
  };

  const completeProfile = async (fullName: string) => {
    const processingId = startProcessing({
      title: "Saving profile",
      message: "Updating your account details...",
    });
    try {
      const response = await completeProfileRequest({ fullName });
      persistAuth(response.user, response.token, {
        promptDeliveryPreference: true,
        requireProfileCompletion: response.requiresProfileCompletion,
        showWelcomeGreeting: true,
      });
      setShowProfileCompletionModal(false);
      return {};
    } catch (error) {
      return {
        error: extractErrorMessage(error, "Unable to save your name right now."),
      };
    } finally {
      stopProcessing(processingId);
    }
  };

  const updateDeliveryPreference = async (mode: DeliveryMode) => {
    const processingId = startProcessing({
      title: "Saving preference",
      message: "Updating your default fulfilment option...",
    });
    try {
      const response = await updateDeliveryPreferenceRequest({
        preferredDeliveryMode: mode,
      });
      persistAuth(response.user, response.token);
      setShowDeliveryPreferenceModal(false);
      setPendingDeliveryPreferencePrompt(false);
      return {};
    } catch (error) {
      return {
        error: extractErrorMessage(error, "Unable to save delivery preference right now."),
      };
    } finally {
      stopProcessing(processingId);
    }
  };

  const logout = () => {
    persistAuth(null, null);
    setShowDeliveryPreferenceModal(false);
    setShowProfileCompletionModal(false);
    setPendingDeliveryPreferencePrompt(false);
    setWelcomeUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        isAdmin: user?.role === "ROLE_ADMIN",
        loading,
        requestOtp,
        verifyOtp,
        googleLogin,
        adminLogin,
        completeProfile,
        updateDeliveryPreference,
        logout,
      }}
    >
      {children}
      {showProfileCompletionModal && user?.role === "ROLE_CUSTOMER" ? (
        <ProfileCompletionModal onSubmit={completeProfile} />
      ) : null}
      {showDeliveryPreferenceModal && user?.role === "ROLE_CUSTOMER" ? (
        <div className="delivery-preference-modal" role="dialog" aria-modal="true">
          <div className="delivery-preference-modal__card">
            <span className="eyebrow">Delivery preference</span>
            <h2>How should we handle your orders?</h2>
            <p>
              Choose your default fulfilment option so shipping charges and order
              management stay accurate.
            </p>
            <div className="delivery-preference-modal__actions">
              <button
                type="button"
                className="delivery-preference-modal__button"
                onClick={() => void updateDeliveryPreference("STORE_PICKUP")}
              >
                Pick up at store
              </button>
              <button
                type="button"
                className="delivery-preference-modal__button delivery-preference-modal__button--primary"
                onClick={() => void updateDeliveryPreference("HOME_DELIVERY")}
              >
                Home delivery
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {welcomeUser ? (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "radial-gradient(circle at center, #ffffff 0%, #fdfdfd 40%, #f0f4f8 100%)",
          color: "#1a1a1a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          animation: "fadeOutWelcome 5s forwards"
        }}>
          <style>
            {`
              @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
              
              @keyframes fadeOutWelcome {
                0% { opacity: 1; }
                80% { opacity: 1; }
                100% { opacity: 0; visibility: hidden; }
              }
              
              @keyframes writeText {
                0% { clip-path: inset(0 100% 0 0); opacity: 0.4; transform: scale(0.95); }
                30% { opacity: 1; }
                100% { clip-path: inset(0 -10% 0 0); opacity: 1; transform: scale(1); }
              }
              
              @keyframes gentleFloat {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-8px); }
              }
              
              .welcome-float-wrapper {
                animation: gentleFloat 4s ease-in-out infinite;
                padding: 20px 40px;
              }

              .pen-writing {
                font-family: 'Great Vibes', cursive;
                font-size: 7.5rem;
                display: inline-block;
                white-space: nowrap;
                text-shadow: 2px 8px 16px rgba(0,0,0,0.12);
                animation: writeText 2.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
              }
            `}
          </style>
          <div className="welcome-float-wrapper">
            <span className="pen-writing">Welcome {welcomeUser}</span>
          </div>
        </div>
      ) : null}
    </AuthContext.Provider>
  );
};

const ProfileCompletionModal: React.FC<{
  onSubmit: (fullName: string) => Promise<AuthActionResult>;
}> = ({ onSubmit }) => {
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!fullName.trim()) {
      setError("Please enter your name to continue.");
      return;
    }

    setSaving(true);
    const result = await onSubmit(fullName.trim());
    setSaving(false);
    if (result.error) {
      setError(result.error);
    }
  };

  return (
    <div className="delivery-preference-modal" role="dialog" aria-modal="true">
      <div className="delivery-preference-modal__card">
        <span className="eyebrow">Welcome to VoltMart</span>
        <h2>Tell us your name</h2>
        <p>We only need this once so your account and future orders feel personal.</p>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="form-grid__wide">
            Full name
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Enter your full name"
              autoFocus
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <div className="delivery-preference-modal__actions">
            <button
              type="submit"
              className="delivery-preference-modal__button delivery-preference-modal__button--primary"
              disabled={saving}
            >
              {saving ? "Saving..." : "Continue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
