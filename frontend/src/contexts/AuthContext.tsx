import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AxiosError } from "axios";
import "../styles/shared/DeliveryPreferenceModal.css";
import "../styles/shared/LoadingState.css";
import { setApiAuthToken } from "../services/api";
import {
  adminLogin as adminLoginRequest,
  completeProfile as completeProfileRequest,
  googleLogin as googleLoginRequest,
  requestPhoneOtp as requestPhoneOtpRequest,
  verifyPhoneOtp as verifyPhoneOtpRequest,
  updateDeliveryPreference as updateDeliveryPreferenceRequest,
} from "../services/authService";
import PincodeServiceChecker from "../components/shared/PincodeServiceChecker";
import { readSelectedAddress } from "../utils/selectedAddress";
import { setStoredGuestDeliveryMode } from "../utils/deliveryModePreference";

import { useProcessing } from "./ProcessingContext";
import { AuthUser, DeliveryMode } from "../types/store";

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
  requestPhoneOtp: (phoneNumber: string) => Promise<AuthActionResult<{
    phoneNumber: string;
    expiresInSeconds: number;
    sent: boolean;
  }>>;
  verifyPhoneOtp: (phoneNumber: string, otp: string) => Promise<AuthActionResult>;
  adminLogin: (email: string, password: string) => Promise<AuthActionResult>;
  completeProfile: (payload: ProfileCompletionPayload) => Promise<AuthActionResult>;
  updateDeliveryPreference: (mode: DeliveryMode) => Promise<AuthActionResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = "voltmart-auth-user";
const TOKEN_STORAGE_KEY = "voltmart-token";
const AUTH_CLEARED_EVENT = "voltmart-auth-cleared";
const PROFILE_COMPLETION_SKIP_STORAGE_PREFIX = "voltmart-profile-completion-skipped";
const DELIVERY_PROMPT_COMPLETED_SESSION_PREFIX = "voltmart-delivery-preference-completed";
const PINCODE_CHECKER_LOGIN_KEY = "voltmart-login-pincode-checker-shown";
const GUEST_DELIVERY_PROMPT_SESSION_KEY = "voltmart-delivery-prompt-shown:guest";

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

const getProfileCompletionSkipSessionKey = (user: AuthUser) =>
  `${PROFILE_COMPLETION_SKIP_STORAGE_PREFIX}:${user.email || user.phoneNumber || user.id || "customer"}`;

const hasSkippedProfileCompletionThisSession = (user: AuthUser) =>
  window.sessionStorage.getItem(getProfileCompletionSkipSessionKey(user)) === "true";

const markProfileCompletionSkippedThisSession = (user: AuthUser) => {
  window.sessionStorage.setItem(getProfileCompletionSkipSessionKey(user), "true");
};

const getDeliveryPromptCompletedSessionKey = (user: AuthUser) =>
  `${DELIVERY_PROMPT_COMPLETED_SESSION_PREFIX}:${user.email || user.phoneNumber || user.id || "customer"}`;

const hasCompletedDeliveryPromptThisSession = (user: AuthUser) =>
  window.sessionStorage.getItem(getDeliveryPromptCompletedSessionKey(user)) === "true";

const markDeliveryPromptCompletedThisSession = (user: AuthUser) => {
  window.sessionStorage.setItem(getDeliveryPromptCompletedSessionKey(user), "true");
};

const shouldShowDeliveryPrompt = (user: AuthUser, requireProfile: boolean) =>
  user.role === "ROLE_CUSTOMER" &&
  !requireProfile &&
  !hasCompletedDeliveryPromptThisSession(user) &&
  !window.location.pathname.startsWith("/admin");

const restrictLettersOnly = (value: string) => value.replace(/[^A-Za-z\s.'-]/g, "");
const restrictDigitsOnly = (value: string, maxLength = 10) =>
  value.replace(/\D/g, "").slice(0, maxLength);

interface ProfileCompletionPayload {
  fullName: string;
  phoneNumber: string;
  email?: string;
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
  const [showPincodeCheckerModal, setShowPincodeCheckerModal] = useState(false);
  const [deliveryPincodePreview, setDeliveryPincodePreview] = useState<string | null>(null);
  const [showGuestDeliveryPreferenceModal, setShowGuestDeliveryPreferenceModal] = useState(false);
  const [showGuestPincodeCheckerModal, setShowGuestPincodeCheckerModal] = useState(false);
  const [guestDeliveryPincodePreview, setGuestDeliveryPincodePreview] = useState<string | null>(null);
  const [showProfileCompletionModal, setShowProfileCompletionModal] = useState(false);
  const [pendingDeliveryPreferencePrompt, setPendingDeliveryPreferencePrompt] = useState(false);
  const [deliveryPreferenceError, setDeliveryPreferenceError] = useState("");
  const [savingDeliveryPreference, setSavingDeliveryPreference] = useState<DeliveryMode | null>(null);
  const { startProcessing, stopProcessing } = useProcessing();
  const isAdminSession = user?.role === "ROLE_ADMIN";
  const isCustomerOnboardingBlocked = Boolean(
    (user?.role === "ROLE_CUSTOMER" &&
      (showProfileCompletionModal || showDeliveryPreferenceModal || showPincodeCheckerModal)) ||
      showGuestDeliveryPreferenceModal ||
      showGuestPincodeCheckerModal ||
      Boolean(guestDeliveryPincodePreview),
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
      setUser(parsedUser);
      setToken(storedToken);
      setApiAuthToken(storedToken);
      setShowProfileCompletionModal(requireProfile && !hasSkippedProfileCompletionThisSession(parsedUser));
      setShowPincodeCheckerModal(false);
      setDeliveryPincodePreview(null);
      setShowGuestDeliveryPreferenceModal(false);
      setShowGuestPincodeCheckerModal(false);
      setGuestDeliveryPincodePreview(null);
      setShowDeliveryPreferenceModal(
        shouldShowDeliveryPrompt(parsedUser, requireProfile) && !isAdminArea,
      );
    } catch {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      setApiAuthToken(null);
      setUser(null);
      setToken(null);
    }

    setLoading(false);
  }, []);

  const persistAuth = useCallback((
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
    const profileCompletionSkipped =
      nextUser && hasSkippedProfileCompletionThisSession(nextUser) && shouldRequireProfileCompletion;
    const shouldPromptDeliveryPreference = Boolean(
      options?.promptDeliveryPreference &&
        !shouldRequireProfileCompletion &&
        nextUser &&
        nextToken &&
        nextUser.role === "ROLE_CUSTOMER" &&
        !window.location.pathname.startsWith("/admin"),
    );
    const shouldDelayDeliveryPreference = false;

    setShowProfileCompletionModal(shouldRequireProfileCompletion && !profileCompletionSkipped);
    setShowDeliveryPreferenceModal(
      shouldPromptDeliveryPreference && !shouldDelayDeliveryPreference,
    );
    setShowPincodeCheckerModal(false);
    setDeliveryPincodePreview(null);
    setShowGuestDeliveryPreferenceModal(false);
    setShowGuestPincodeCheckerModal(false);
    setGuestDeliveryPincodePreview(null);
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
  }, []);

  useEffect(() => {
    if (!pendingDeliveryPreferencePrompt || isAdminSession || !user) {
      return;
    }

    setShowDeliveryPreferenceModal(true);
    setShowPincodeCheckerModal(false);
    setDeliveryPincodePreview(null);
    setPendingDeliveryPreferencePrompt(false);
    setDeliveryPreferenceError("");
  }, [isAdminSession, pendingDeliveryPreferencePrompt, user]);

  useEffect(() => {
    if (loading || isAdminSession || user || window.location.pathname.startsWith("/admin")) {
      setShowGuestDeliveryPreferenceModal(false);
      setShowGuestPincodeCheckerModal(false);
      setGuestDeliveryPincodePreview(null);
      return;
    }

    if (window.sessionStorage.getItem(GUEST_DELIVERY_PROMPT_SESSION_KEY) === "true") {
      setShowGuestDeliveryPreferenceModal(false);
      return;
    }

    setShowGuestDeliveryPreferenceModal(true);
  }, [isAdminSession, loading, user]);

  useEffect(() => {
    if (!isAdminSession) {
      return;
    }

    setShowDeliveryPreferenceModal(false);
    setShowPincodeCheckerModal(false);
    setDeliveryPincodePreview(null);
    setPendingDeliveryPreferencePrompt(false);
    setDeliveryPreferenceError("");
  }, [isAdminSession]);

  useEffect(() => {
    if (!deliveryPincodePreview) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setDeliveryPincodePreview(null);
    }, 1200);

    return () => window.clearTimeout(timeoutId);
  }, [deliveryPincodePreview]);

  useEffect(() => {
    if (!guestDeliveryPincodePreview) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      window.sessionStorage.setItem(GUEST_DELIVERY_PROMPT_SESSION_KEY, "true");
      setGuestDeliveryPincodePreview(null);
      setShowGuestDeliveryPreferenceModal(false);
      setShowGuestPincodeCheckerModal(false);
    }, 1200);

    return () => window.clearTimeout(timeoutId);
  }, [guestDeliveryPincodePreview]);

  useEffect(() => {
    if (!isCustomerOnboardingBlocked) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isCustomerOnboardingBlocked]);

  const googleLogin = async (credential: string) => {
    const processingId = startProcessing({
      title: "Signing you in",
      message: "Verifying your Google account and preparing your session...",
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

  const requestPhoneOtp = async (phoneNumber: string) => {
    try {
      const response = await requestPhoneOtpRequest({ phoneNumber });
      return { data: response };
    } catch (error) {
      return {
        error: extractErrorMessage(error, "Unable to send OTP right now."),
      };
    }
  };

  const verifyPhoneOtp = async (phoneNumber: string, otp: string) => {
    const processingId = startProcessing({
      title: "Verifying OTP",
      message: "Checking your code and opening your account...",
    });
    try {
      const response = await verifyPhoneOtpRequest({ phoneNumber, otp });
      persistAuth(response.user, response.token, {
        promptDeliveryPreference: true,
        requireProfileCompletion: response.requiresProfileCompletion,
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

  const adminLogin = async (email: string, password: string) => {
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
      setShowDeliveryPreferenceModal(shouldShowDeliveryPrompt(response.user, response.requiresProfileCompletion));
      setShowPincodeCheckerModal(false);
      setDeliveryPincodePreview(null);
      return {};
    } catch (error) {
      return {
        error: extractErrorMessage(error, "Unable to save your name right now."),
      };
    } finally {
      stopProcessing(processingId);
    }
  };

  const skipProfileCompletion = useCallback(() => {
    if (!user) {
      return;
    }

    markProfileCompletionSkippedThisSession(user);
    setShowProfileCompletionModal(false);
    setPendingDeliveryPreferencePrompt(false);
    setShowDeliveryPreferenceModal(shouldShowDeliveryPrompt(user, false));
  }, [user]);

  const updateDeliveryPreference = async (mode: DeliveryMode) => {
    setDeliveryPreferenceError("");

    if (user?.role !== "ROLE_CUSTOMER") {
      return {
        error: "Delivery preference is only available for customer accounts.",
      };
    }

    setSavingDeliveryPreference(mode);
    const processingId = startProcessing({
      title: "Saving preference",
      message: "Updating your default fulfilment option...",
    });
    try {
      const response = await updateDeliveryPreferenceRequest({
        preferredDeliveryMode: mode,
      });
      markDeliveryPromptCompletedThisSession(user);
      persistAuth(response.user, response.token);
      setShowDeliveryPreferenceModal(false);
      setPendingDeliveryPreferencePrompt(false);
      setShowPincodeCheckerModal(false);
      if (mode === "HOME_DELIVERY") {
        const selectedAddress = readSelectedAddress(user);
        const postalCode = selectedAddress?.postalCode?.trim();
        if (/^\d{6}$/.test(postalCode || "")) {
          window.sessionStorage.removeItem(PINCODE_CHECKER_LOGIN_KEY);
          setDeliveryPincodePreview(postalCode || null);
          setShowPincodeCheckerModal(false);
        } else {
          setDeliveryPincodePreview(null);
          setShowPincodeCheckerModal(true);
        }
      } else {
        setShowPincodeCheckerModal(false);
        setDeliveryPincodePreview(null);
      }
      return {};
    } catch (error) {
        if (isAuthorizationError(error)) {
          const message = "Your session expired. Please log in again to choose delivery.";
          setDeliveryPreferenceError(message);
          window.setTimeout(() => {
            persistAuth(null, null);
            setShowDeliveryPreferenceModal(false);
            setShowPincodeCheckerModal(false);
            setDeliveryPincodePreview(null);
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
      setSavingDeliveryPreference(null);
      stopProcessing(processingId);
    }
  };

  const logout = useCallback(() => {
    if (user?.role === "ROLE_CUSTOMER") {
      window.sessionStorage.removeItem(getDeliveryPromptCompletedSessionKey(user));
    }
    window.sessionStorage.setItem(GUEST_DELIVERY_PROMPT_SESSION_KEY, "true");
    window.sessionStorage.removeItem(PINCODE_CHECKER_LOGIN_KEY);
    persistAuth(null, null);
    setShowDeliveryPreferenceModal(false);
    setShowPincodeCheckerModal(false);
    setDeliveryPincodePreview(null);
    setShowProfileCompletionModal(false);
    setPendingDeliveryPreferencePrompt(false);
    setDeliveryPreferenceError("");
    setShowGuestDeliveryPreferenceModal(false);
    setShowGuestPincodeCheckerModal(false);
    setGuestDeliveryPincodePreview(null);
  }, [persistAuth, user]);

  useEffect(() => {
    const handleAuthCleared = () => {
      logout();
    };

    window.addEventListener(AUTH_CLEARED_EVENT, handleAuthCleared);
    return () => window.removeEventListener(AUTH_CLEARED_EVENT, handleAuthCleared);
  }, [logout]);

  const completeGuestDeliveryPrompt = useCallback(() => {
    window.sessionStorage.setItem(GUEST_DELIVERY_PROMPT_SESSION_KEY, "true");
    setShowGuestDeliveryPreferenceModal(false);
    setShowGuestPincodeCheckerModal(false);
    setGuestDeliveryPincodePreview(null);
  }, []);

  const chooseGuestDeliveryMode = useCallback((mode: DeliveryMode) => {
    setStoredGuestDeliveryMode(mode);

    if (mode === "HOME_DELIVERY") {
      const selectedAddress = readSelectedAddress(null);
      const postalCode = selectedAddress?.postalCode?.trim();
      if (/^\d{6}$/.test(postalCode || "")) {
        setGuestDeliveryPincodePreview(postalCode);
        return;
      }

      setShowGuestPincodeCheckerModal(true);
      return;
    }

    completeGuestDeliveryPrompt();
  }, [completeGuestDeliveryPrompt]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        isAdmin: user?.role === "ROLE_ADMIN",
        loading,
        googleLogin,
        requestPhoneOtp,
        verifyPhoneOtp,
        adminLogin,
        completeProfile,
        skipProfileCompletion,
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
      {showGuestDeliveryPreferenceModal && !showProfileCompletionModal && !isAdminSession && !user ? (
        <div className="delivery-preference-modal" role="dialog" aria-modal="true">
          <div className="delivery-preference-modal__card">
            <span className="eyebrow">Delivery preference</span>
            <h2>How should we handle your orders?</h2>
            <p>
              Choose your default fulfilment option so shipping charges and order
              management stay accurate.
            </p>
            {guestDeliveryPincodePreview ? (
              <div className="delivery-preference-modal__preview" role="status" aria-live="polite">
                <strong>{guestDeliveryPincodePreview}</strong>
                <span>Saving your home delivery preference...</span>
                <span className="button-loading">
                  <span className="button-loading__spinner" aria-hidden="true" />
                </span>
              </div>
            ) : (
              <div className="delivery-preference-modal__actions">
                <button
                  type="button"
                  className="delivery-preference-modal__button"
                  onClick={() => chooseGuestDeliveryMode("STORE_PICKUP")}
                >
                  Store pickup
                </button>
                <button
                  type="button"
                  className="delivery-preference-modal__button delivery-preference-modal__button--primary"
                  onClick={() => chooseGuestDeliveryMode("HOME_DELIVERY")}
                >
                  Home delivery
                </button>
              </div>
            )}
            <button
              type="button"
              className="delivery-preference-modal__skip"
              onClick={completeGuestDeliveryPrompt}
            >
              Skip
            </button>
          </div>
        </div>
      ) : null}
      {showProfileCompletionModal && user?.role === "ROLE_CUSTOMER" ? (
        <ProfileCompletionModal onSubmit={completeProfile} onSkip={skipProfileCompletion} />
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
                disabled={Boolean(savingDeliveryPreference)}
                aria-busy={savingDeliveryPreference === "STORE_PICKUP"}
                onClick={() => void updateDeliveryPreference("STORE_PICKUP")}
              >
                {savingDeliveryPreference === "STORE_PICKUP" ? (
                  <span className="button-loading">
                    <span className="button-loading__spinner" aria-hidden="true" />
                    Applying...
                  </span>
                ) : (
                  "Store pickup"
                )}
              </button>
              <button
                type="button"
                className="delivery-preference-modal__button delivery-preference-modal__button--primary"
                disabled={Boolean(savingDeliveryPreference)}
                aria-busy={savingDeliveryPreference === "HOME_DELIVERY"}
                onClick={() => void updateDeliveryPreference("HOME_DELIVERY")}
              >
                {savingDeliveryPreference === "HOME_DELIVERY" ? (
                  <span className="button-loading">
                    <span className="button-loading__spinner" aria-hidden="true" />
                    Applying...
                  </span>
                ) : (
                  "Home delivery"
                )}
              </button>
            </div>
            {deliveryPreferenceError ? (
              <p className="form-error">{deliveryPreferenceError}</p>
            ) : null}
            <button
              type="button"
              className="delivery-preference-modal__skip"
              disabled={Boolean(savingDeliveryPreference)}
              onClick={() => {
                markDeliveryPromptCompletedThisSession(user);
                setShowDeliveryPreferenceModal(false);
                setPendingDeliveryPreferencePrompt(false);
                setDeliveryPreferenceError("");
              }}
            >
              Skip
            </button>
          </div>
        </div>
      ) : null}
      {showPincodeCheckerModal &&
      !showProfileCompletionModal &&
      !showDeliveryPreferenceModal &&
      user?.role === "ROLE_CUSTOMER" ? (
        <PincodeServiceChecker
          open
          storageKey={PINCODE_CHECKER_LOGIN_KEY}
          onClose={() => setShowPincodeCheckerModal(false)}
          showFooterActions={false}
        />
      ) : null}
      {showGuestPincodeCheckerModal && !showProfileCompletionModal && !user ? (
        <PincodeServiceChecker
          open
          onClose={completeGuestDeliveryPrompt}
          showFooterActions={false}
        />
      ) : null}
      {deliveryPincodePreview ? (
        <div className="delivery-preference-modal" role="dialog" aria-modal="true" aria-live="polite">
          <div className="delivery-preference-modal__card">
            <span className="eyebrow">Delivery check</span>
            <h2>Using your default address pincode</h2>
            <p>
              {deliveryPincodePreview} is saved with your address.
            </p>
          </div>
        </div>
      ) : null}
    </AuthContext.Provider>
  );
};

const ProfileCompletionModal: React.FC<{
  onSubmit: (payload: ProfileCompletionPayload) => Promise<AuthActionResult>;
  onSkip: () => void;
}> = ({ onSubmit, onSkip }) => {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [email, setEmail] = useState(user?.email || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

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
                onPaste={(event) => {
                  event.preventDefault();
                  setFullName(restrictLettersOnly(event.clipboardData.getData("text")));
                }}
                placeholder="Enter your full name"
                autoFocus
                inputMode="text"
                pattern={"[A-Za-z\\s.'\\-]+"}
                required
              />
            </label>
            <label>
              Mobile number
            <input
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(restrictDigitsOnly(event.target.value))}
                onPaste={(event) => {
                  event.preventDefault();
                  setPhoneNumber(restrictDigitsOnly(event.clipboardData.getData("text")));
                }}
                placeholder="Enter mobile number"
                inputMode="numeric"
                pattern={"\\d{10}"}
                maxLength={10}
                required
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
          {error ? <p className="form-error">{error}</p> : null}
          <div className="delivery-preference-modal__actions">
            <button
              type="button"
              className="delivery-preference-modal__button delivery-preference-modal__button--icon"
              disabled={saving}
              onClick={onSkip}
            >
              <span>Skip for now</span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
            <button
              type="submit"
              className="delivery-preference-modal__button delivery-preference-modal__button--primary"
              disabled={saving}
              aria-busy={saving}
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
