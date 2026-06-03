import React, { createContext, useContext, useEffect, useState } from "react";
import { AxiosError } from "axios";
import "../styles/shared/DeliveryPreferenceModal.css";
import { setApiAuthToken } from "../services/api";
import {
  adminLogin as adminLoginRequest,
  completeProfile as completeProfileRequest,
  googleLogin as googleLoginRequest,
  updateDeliveryPreference as updateDeliveryPreferenceRequest,
} from "../services/authService";

import { useProcessing } from "./ProcessingContext";
import { AuthUser, DeliveryMode } from "../types/store";
import { optimizeImageFile } from "../utils/imageUpload";

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
  googleLogin: (credential: string) => Promise<AuthActionResult>;
  adminLogin: (email: string, password: string) => Promise<AuthActionResult>;
  completeProfile: (payload: ProfileCompletionPayload) => Promise<AuthActionResult>;
  updateDeliveryPreference: (mode: DeliveryMode) => Promise<AuthActionResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = "voltmart-auth-user";
const TOKEN_STORAGE_KEY = "voltmart-token";
const DELIVERY_PROMPT_SESSION_PREFIX = "voltmart-delivery-prompt-shown";

const decodeJwtPayload = (token: string) => {
  try {
    const [, payload] = token.split(".");
    if (!payload) {
      return null;
    }

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decodedPayload = window.atob(
      normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, "="),
    );
    return JSON.parse(decodedPayload) as { role?: string; exp?: number };
  } catch {
    return null;
  }
};

const isTokenValidForUser = (token: string, user: AuthUser) => {
  const payload = decodeJwtPayload(token);
  if (!payload?.role || payload.role !== user.role) {
    return false;
  }

  return !payload.exp || payload.exp * 1000 > Date.now();
};

const getDisplayName = (user: AuthUser | null) => {
  const fullName = user?.fullName?.trim();
  if (fullName) {
    return fullName;
  }

  return "";
};

const shouldRequireCustomerName = (user: AuthUser | null) =>
  Boolean(user?.role === "ROLE_CUSTOMER" && (!getDisplayName(user) || !user.phoneNumber?.trim()));

const getDeliveryPromptSessionKey = (user: AuthUser) =>
  `${DELIVERY_PROMPT_SESSION_PREFIX}:${user.email || user.phoneNumber || user.id || "customer"}`;

const hasSeenDeliveryPromptThisSession = (user: AuthUser) =>
  window.sessionStorage.getItem(getDeliveryPromptSessionKey(user)) === "true";

const markDeliveryPromptSeenThisSession = (user: AuthUser) => {
  window.sessionStorage.setItem(getDeliveryPromptSessionKey(user), "true");
};

const shouldShowDeliveryPromptThisSession = (user: AuthUser, requireProfile: boolean) =>
  user.role === "ROLE_CUSTOMER" &&
  !requireProfile &&
  !window.location.pathname.startsWith("/admin") &&
  !hasSeenDeliveryPromptThisSession(user);

const restrictLettersOnly = (value: string) => value.replace(/[^A-Za-z\s.'-]/g, "");
const restrictDigitsOnly = (value: string, maxLength = 10) =>
  value.replace(/\D/g, "").slice(0, maxLength);

interface ProfileCompletionPayload {
  fullName: string;
  phoneNumber: string;
  email?: string;
  profileImageUrl?: string;
}

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

const isAuthorizationError = (error: unknown) =>
  error instanceof AxiosError &&
  (error.response?.status === 401 || error.response?.status === 403);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeliveryPreferenceModal, setShowDeliveryPreferenceModal] = useState(false);
  const [showProfileCompletionModal, setShowProfileCompletionModal] = useState(false);
  const [pendingDeliveryPreferencePrompt, setPendingDeliveryPreferencePrompt] = useState(false);
  const [deliveryPreferenceError, setDeliveryPreferenceError] = useState("");
  const { startProcessing, stopProcessing } = useProcessing();
  const isAdminSession = user?.role === "ROLE_ADMIN";
  const isCustomerOnboardingBlocked = Boolean(
    user?.role === "ROLE_CUSTOMER" &&
      (showProfileCompletionModal || showDeliveryPreferenceModal),
  );

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
      if (!isTokenValidForUser(storedToken, parsedUser)) {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        setApiAuthToken(null);
        setUser(null);
        setToken(null);
        setLoading(false);
        return;
      }

      const isAdminArea = window.location.pathname.startsWith("/admin");
      if (parsedUser.role === "ROLE_ADMIN" && !isAdminArea) {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        setApiAuthToken(null);
        setUser(null);
        setToken(null);
        setLoading(false);
        return;
      }

      const requireProfile = shouldRequireCustomerName(parsedUser);
      const shouldPromptDelivery = shouldShowDeliveryPromptThisSession(parsedUser, requireProfile);
      if (shouldPromptDelivery) {
        markDeliveryPromptSeenThisSession(parsedUser);
      }
      setUser(parsedUser);
      setToken(storedToken);
      setApiAuthToken(storedToken);
      setShowProfileCompletionModal(requireProfile);
      setShowDeliveryPreferenceModal(shouldPromptDelivery && !isAdminArea);
    } catch {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      setApiAuthToken(null);
      setUser(null);
      setToken(null);
    }

    setLoading(false);
  }, []);

  const persistAuth = (
    nextUser: AuthUser | null,
    nextToken: string | null,
    options?: {
      promptDeliveryPreference?: boolean;
      requireProfileCompletion?: boolean;
    },
  ) => {
    if (nextUser && nextToken && !isTokenValidForUser(nextToken, nextUser)) {
      nextUser = null;
      nextToken = null;
    }

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
        !window.location.pathname.startsWith("/admin") &&
        !hasSeenDeliveryPromptThisSession(nextUser),
    );
    const shouldDelayDeliveryPreference = false;

    setShowProfileCompletionModal(shouldRequireProfileCompletion);
    setShowDeliveryPreferenceModal(shouldPromptDeliveryPreference && !shouldDelayDeliveryPreference);
    if (shouldPromptDeliveryPreference && nextUser) {
      markDeliveryPromptSeenThisSession(nextUser);
    }
    setPendingDeliveryPreferencePrompt(shouldDelayDeliveryPreference);
    setDeliveryPreferenceError("");
    setApiAuthToken(nextToken);

    if (nextUser && nextToken) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
      window.localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);

      return;
    }

    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    setApiAuthToken(null);
  };

  useEffect(() => {
    if (!pendingDeliveryPreferencePrompt || isAdminSession || !user) {
      return;
    }

    if (hasSeenDeliveryPromptThisSession(user)) {
      setPendingDeliveryPreferencePrompt(false);
      return;
    }

    markDeliveryPromptSeenThisSession(user);
    setShowDeliveryPreferenceModal(true);
    setPendingDeliveryPreferencePrompt(false);
    setDeliveryPreferenceError("");
  }, [isAdminSession, pendingDeliveryPreferencePrompt, user]);

  useEffect(() => {
    if (!isAdminSession) {
      return;
    }

    setShowDeliveryPreferenceModal(false);
    setPendingDeliveryPreferencePrompt(false);
    setDeliveryPreferenceError("");
  }, [isAdminSession]);

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

  const completeProfile = async (payload: ProfileCompletionPayload) => {
    const processingId = startProcessing({
      title: "Saving profile",
      message: "Updating your account details...",
    });
    try {
      const response = await completeProfileRequest(payload);
      persistAuth(response.user, response.token, {
        promptDeliveryPreference: false,
        requireProfileCompletion: response.requiresProfileCompletion,
      });
      setShowProfileCompletionModal(false);
      const shouldPromptDelivery = shouldShowDeliveryPromptThisSession(
        response.user,
        response.requiresProfileCompletion,
      );
      if (shouldPromptDelivery) {
        markDeliveryPromptSeenThisSession(response.user);
      }
      setShowDeliveryPreferenceModal(shouldPromptDelivery);
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
    setDeliveryPreferenceError("");

    if (user?.role !== "ROLE_CUSTOMER") {
      return {
        error: "Delivery preference is only available for customer accounts.",
      };
    }

    const processingId = startProcessing({
      title: "Saving preference",
      message: "Updating your default fulfilment option...",
    });
    try {
      const response = await updateDeliveryPreferenceRequest({
        preferredDeliveryMode: mode,
      });
      persistAuth(response.user, response.token);
      markDeliveryPromptSeenThisSession(response.user);
      setShowDeliveryPreferenceModal(false);
      setPendingDeliveryPreferencePrompt(false);
      return {};
    } catch (error) {
      if (isAuthorizationError(error)) {
        const message = "Your session expired. Please log in again to choose delivery.";
        setDeliveryPreferenceError(message);
        window.setTimeout(() => {
          persistAuth(null, null);
          setShowDeliveryPreferenceModal(false);
          setPendingDeliveryPreferencePrompt(false);
        }, 900);
        return { error: message };
      }

      const message = extractErrorMessage(error, "Unable to save delivery preference right now.");
      setDeliveryPreferenceError(message);
      return {
        error: message,
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
    setDeliveryPreferenceError("");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        isAdmin: user?.role === "ROLE_ADMIN",
        loading,
        googleLogin,
        adminLogin,
        completeProfile,
        updateDeliveryPreference,
        logout,
      }}
    >
      <div
        className={isCustomerOnboardingBlocked ? "auth-onboarding-page-blocked" : undefined}
        aria-hidden={isCustomerOnboardingBlocked}
      >
        {children}
      </div>
      {showProfileCompletionModal && user?.role === "ROLE_CUSTOMER" ? (
        <ProfileCompletionModal onSubmit={completeProfile} />
      ) : null}
      {showDeliveryPreferenceModal && !showProfileCompletionModal && user?.role === "ROLE_CUSTOMER" ? (
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
            {deliveryPreferenceError ? (
              <p className="form-error">{deliveryPreferenceError}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </AuthContext.Provider>
  );
};

const ProfileCompletionModal: React.FC<{
  onSubmit: (payload: ProfileCompletionPayload) => Promise<AuthActionResult>;
}> = ({ onSubmit }) => {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [email, setEmail] = useState(user?.email || "");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleProfileImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setError("");
    setUploadingImage(true);
    try {
      setProfileImageUrl(await optimizeImageFile(file));
    } catch {
      setError("Unable to process selected profile photo.");
    } finally {
      setUploadingImage(false);
    }
  };

  const submitProfile = async (skipOptional = false) => {
    setError("");
    if (!fullName.trim() || !phoneNumber.trim()) {
      setError("Please enter your full name and mobile number to continue.");
      return;
    }

    setSaving(true);
    const result = await onSubmit({
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      email: skipOptional ? undefined : email.trim() || undefined,
      profileImageUrl: skipOptional ? undefined : profileImageUrl.trim() || undefined,
    });
    setSaving(false);
    if (result.error) {
      setError(result.error);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitProfile(false);
  };

  return (
    <div className="delivery-preference-modal" role="dialog" aria-modal="true">
      <div className="delivery-preference-modal__card">
        <span className="eyebrow">Account details</span>
        <h2>Complete your profile</h2>
        <p>These details will be used automatically for orders and support requests.</p>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Full name
          <input
              value={fullName}
              onChange={(event) => setFullName(restrictLettersOnly(event.target.value))}
              placeholder="Enter your full name"
              autoFocus
            />
          </label>
          <label>
            Mobile number
          <input
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(restrictDigitsOnly(event.target.value))}
              placeholder="Enter mobile number"
            />
          </label>
          <label>
            Email optional
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <label>
            Profile photo optional
            <input
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
              disabled={saving || uploadingImage}
            />
          </label>
          {profileImageUrl ? (
            <div className="profile-photo-preview form-grid__wide">
              <img src={profileImageUrl} alt="Selected profile" />
              <button type="button" className="link-button" onClick={() => setProfileImageUrl("")}>
                Remove photo
              </button>
            </div>
          ) : null}
          {error ? <p className="form-error">{error}</p> : null}
          <div className="delivery-preference-modal__actions">
            <button
              type="button"
              className="delivery-preference-modal__button delivery-preference-modal__button--icon"
              disabled={saving || uploadingImage}
              onClick={() => void submitProfile(true)}
            >
              <span>Skip optional</span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
            <button
              type="submit"
              className="delivery-preference-modal__button delivery-preference-modal__button--primary"
              disabled={saving || uploadingImage}
            >
              {saving ? "Saving..." : uploadingImage ? "Preparing photo..." : "Continue"}
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
