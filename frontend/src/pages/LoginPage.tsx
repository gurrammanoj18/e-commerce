import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/pages/LoginPage.css";
import "../styles/shared/LoadingState.css";
import { useAuth } from "../contexts/AuthContext";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, string>,
          ) => void;
        };
      };
    };
    initSendOTP?: (config: {
      widgetId: string;
      tokenAuth: string;
      exposeMethods?: boolean;
      success: (data: Record<string, unknown>) => void;
      failure: (error: unknown) => void;
    }) => void;
  }
}

const digitsOnly = (value: string, maxLength: number) =>
  value.replace(/\D/g, "").slice(0, maxLength);

const LoginPage: React.FC = () => {
  const { googleLogin, isAuthenticated, msg91WidgetLogin, requestLoginOtp, verifyLoginOtp } = useAuth();
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [verifiedPhoneNumber, setVerifiedPhoneNumber] = useState("");
  const [demoOtp, setDemoOtp] = useState("");
  const [error, setError] = useState("");
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [signingInWithGoogle, setSigningInWithGoogle] = useState(false);
  const [signingInWithMsg91, setSigningInWithMsg91] = useState(false);
  const [googleButtonReady, setGoogleButtonReady] = useState(false);
  const [msg91WidgetReady, setMsg91WidgetReady] = useState(false);
  const googleClientId = (
    window.__APP_CONFIG__?.REACT_APP_GOOGLE_CLIENT_ID ||
    process.env.REACT_APP_GOOGLE_CLIENT_ID ||
    ""
  ).trim();
  const msg91WidgetId = (
    window.__APP_CONFIG__?.REACT_APP_MSG91_WIDGET_ID ||
    process.env.REACT_APP_MSG91_WIDGET_ID ||
    ""
  ).trim();
  const msg91TokenAuth = (
    window.__APP_CONFIG__?.REACT_APP_MSG91_TOKEN_AUTH ||
    process.env.REACT_APP_MSG91_TOKEN_AUTH ||
    ""
  ).trim();
  const msg91WidgetConfigured = Boolean(msg91WidgetId && msg91TokenAuth);

  const otpRequested = Boolean(verifiedPhoneNumber);
  const canRequestOtp = phoneNumber.length === 10 && !requestingOtp;
  const canVerifyOtp = otp.length === 6 && !verifyingOtp;
  const maskedPhoneNumber = useMemo(
    () =>
      verifiedPhoneNumber
        ? `${verifiedPhoneNumber.slice(0, 2)}******${verifiedPhoneNumber.slice(-2)}`
        : "",
    [verifiedPhoneNumber],
  );

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!googleClientId) {
      setGoogleButtonReady(false);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]',
    ) as HTMLScriptElement | null;

    const renderGoogleButton = () => {
      const container = document.getElementById("google-signin-button");
      if (!container || !window.google) {
        return;
      }

      const isMobile = window.innerWidth <= 520;
      container.innerHTML = "";
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async ({ credential }) => {
          if (!credential) {
            setError("Google did not return a sign-in credential. Please try again.");
            return;
          }
          setError("");
          setSigningInWithGoogle(true);
          const result = await googleLogin(credential);
          if (result.error) {
            setError(result.error);
            setSigningInWithGoogle(false);
          }
        },
      });
      window.google.accounts.id.renderButton(container, {
        theme: "outline",
        size: isMobile ? "medium" : "large",
        shape: "pill",
        text: "continue_with",
        width: isMobile ? "240" : "320",
      });
      setGoogleButtonReady(true);
    };

    if (existingScript) {
      if (window.google) {
        renderGoogleButton();
      } else {
        existingScript.addEventListener("load", renderGoogleButton, { once: true });
      }
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = renderGoogleButton;
    script.onerror = () => {
      setError("Unable to load Google sign-in. Please use OTP login or try again later.");
      setGoogleButtonReady(false);
    };
    document.body.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, [googleClientId, googleLogin]);

  useEffect(() => {
    if (!msg91WidgetConfigured) {
      setMsg91WidgetReady(false);
      return;
    }

    const scriptUrls = [
      "https://verify.msg91.com/otp-provider.js",
      "https://verify.phone91.com/otp-provider.js",
    ];

    let cancelled = false;
    let scriptIndex = 0;

    const loadScript = () => {
      const existingScript = document.querySelector(
        `script[src="${scriptUrls[scriptIndex]}"]`,
      ) as HTMLScriptElement | null;

      const markReady = () => {
        if (!cancelled && typeof window.initSendOTP === "function") {
          setMsg91WidgetReady(true);
        }
      };

      if (existingScript) {
        if (typeof window.initSendOTP === "function") {
          markReady();
        } else {
          existingScript.addEventListener("load", markReady, { once: true });
        }
        return;
      }

      const script = document.createElement("script");
      script.src = scriptUrls[scriptIndex];
      script.async = true;
      script.onload = markReady;
      script.onerror = () => {
        scriptIndex += 1;
        if (!cancelled && scriptIndex < scriptUrls.length) {
          loadScript();
          return;
        }
        if (!cancelled) {
          setError("Unable to load mobile OTP login. Please use manual OTP or try again later.");
          setMsg91WidgetReady(false);
        }
      };
      document.body.appendChild(script);
    };

    loadScript();

    return () => {
      cancelled = true;
    };
  }, [msg91WidgetConfigured]);

  const extractMsg91AccessToken = (data: unknown): string => {
    if (typeof data === "string") {
      return data.trim();
    }

    if (!data || typeof data !== "object") {
      return "";
    }

    const tokenKeys = new Set([
      "token",
      "accesstoken",
      "access_token",
      "access-token",
      "jwttoken",
      "jwt_token",
      "jwt-token",
    ]);

    const findToken = (value: unknown): string => {
      if (!value || typeof value !== "object") {
        return "";
      }

      if (Array.isArray(value)) {
        for (const item of value) {
          const token = findToken(item);
          if (token) {
            return token;
          }
        }
        return "";
      }

      for (const [key, childValue] of Object.entries(value)) {
        const normalizedKey = key.toLowerCase().replace(/[\s_]+/g, "");
        if (tokenKeys.has(key.toLowerCase()) || tokenKeys.has(normalizedKey)) {
          if (typeof childValue === "string" && childValue.trim()) {
            return childValue.trim();
          }
        }

        const nestedToken = findToken(childValue);
        if (nestedToken) {
          return nestedToken;
        }
      }

      return "";
    };

    return findToken(data);
  };

  const openMsg91Widget = () => {
    if (!msg91WidgetConfigured || typeof window.initSendOTP !== "function") {
      setError("Mobile OTP login is not ready. Please use manual OTP or try again later.");
      return;
    }

    setError("");
    setSigningInWithMsg91(true);
    window.initSendOTP({
      widgetId: msg91WidgetId,
      tokenAuth: msg91TokenAuth,
      success: async (data) => {
        const accessToken = extractMsg91AccessToken(data);
        if (!accessToken) {
          setError("MSG91 did not return an access token. Please try again.");
          setSigningInWithMsg91(false);
          return;
        }

        const result = await msg91WidgetLogin(accessToken);
        if (result.error) {
          setError(result.error);
          setSigningInWithMsg91(false);
        }
      },
      failure: () => {
        setError("Mobile OTP verification failed. Please try again.");
        setSigningInWithMsg91(false);
      },
    });
  };

  const submitOtpRequest = async () => {
    setError("");
    setDemoOtp("");

    if (phoneNumber.length !== 10) {
      setError("Enter a valid 10 digit mobile number.");
      return;
    }

    setRequestingOtp(true);
    const result = await requestLoginOtp(phoneNumber);
    setRequestingOtp(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setVerifiedPhoneNumber(result.data?.phoneNumber || phoneNumber);
    setDemoOtp(result.data?.demoOtp || "");
    setOtp("");
  };

  const handleRequestOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitOtpRequest();
  };

  const handleVerifyOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!verifiedPhoneNumber || otp.length !== 6) {
      setError("Enter the 6 digit OTP.");
      return;
    }

    setVerifyingOtp(true);
    const result = await verifyLoginOtp(verifiedPhoneNumber, otp);
    setVerifyingOtp(false);

    if (result.error) {
      setError(result.error);
    }
  };

  const editPhoneNumber = () => {
    setVerifiedPhoneNumber("");
    setOtp("");
    setDemoOtp("");
    setError("");
  };

  return (
    <section className="shell section page-section auth-page">
      <div className="store-card auth-card">
        <span className="eyebrow">Login</span>
        <h1>Sign in to Eldoo</h1>
        <p>Continue with Google or use your mobile number to get an OTP.</p>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="auth-card__google-button" aria-busy={signingInWithGoogle || Boolean(googleClientId && !googleButtonReady)}>
          {googleClientId ? (
            <>
              <div id="google-signin-button" />
              {!googleButtonReady && !signingInWithGoogle ? (
                <div className="auth-card__signin-overlay">
                  <span className="auth-card__spinner" aria-hidden="true" />
                  Preparing Google...
                </div>
              ) : null}
              {signingInWithGoogle ? (
                <div className="auth-card__signin-overlay">
                  <span className="auth-card__spinner" aria-hidden="true" />
                  Signing in...
                </div>
              ) : null}
            </>
          ) : (
            <button
              className="auth-card__google-fallback"
              type="button"
              disabled
            >
              Google login not configured
            </button>
          )}
        </div>

        <div className="auth-card__divider">
          <span>or login with OTP</span>
        </div>

        {!otpRequested ? (
          <form className="auth-card__otp-form" onSubmit={handleRequestOtp}>
            <label>
              Mobile number
              <input
                inputMode="numeric"
                autoComplete="tel"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(digitsOnly(event.target.value, 10))}
                placeholder="Enter 10 digit mobile number"
              />
            </label>
            <button className="button" type="submit" disabled={!canRequestOtp}>
              {requestingOtp ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form className="auth-card__otp-form" onSubmit={handleVerifyOtp}>
            <div className="auth-card__otp-target">
              <span>OTP sent to {maskedPhoneNumber}</span>
              <button type="button" className="link-button" onClick={editPhoneNumber}>
                Edit
              </button>
            </div>
            <label>
              OTP
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(event) => setOtp(digitsOnly(event.target.value, 6))}
                placeholder="Enter 6 digit OTP"
              />
            </label>
            {demoOtp ? <p className="auth-card__note">Demo OTP: {demoOtp}</p> : null}
            <div className="auth-card__otp-actions">
              <button className="button" type="submit" disabled={!canVerifyOtp}>
                {verifyingOtp ? "Verifying..." : "Verify OTP"}
              </button>
              <button
                type="button"
                className="link-button"
                disabled={requestingOtp}
                onClick={() => void submitOtpRequest()}
              >
                {requestingOtp ? "Sending..." : "Resend"}
              </button>
            </div>
          </form>
        )}

        {msg91WidgetConfigured ? (
          <>
            <div className="auth-card__divider">
              <span>or</span>
            </div>
            <button
              className="button auth-card__msg91-button"
              type="button"
              disabled={!msg91WidgetReady || signingInWithMsg91}
              onClick={openMsg91Widget}
            >
              {signingInWithMsg91
                ? "Verifying..."
                : msg91WidgetReady
                  ? "Use MSG91 secure popup"
                  : "Preparing mobile OTP..."}
            </button>
          </>
        ) : null}
      </div>
    </section>
  );
};

export default LoginPage;
