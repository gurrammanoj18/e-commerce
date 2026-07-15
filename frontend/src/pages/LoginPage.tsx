import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/pages/LoginPage.css";
import "../styles/shared/LoadingState.css";
import { useAuth } from "../contexts/AuthContext";
import { getGoogleClientId } from "../services/authService";

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
  }
}

const DEFAULT_GOOGLE_CLIENT_ID = "536121505527-9vfs7pm13jjrvsb9np95nubbpji6b01l.apps.googleusercontent.com";

const normalizePhoneNumber = (value: string) => value.replace(/\D/g, "").slice(0, 10);

const LoginPage: React.FC = () => {
  const { googleLogin, requestPhoneOtp, verifyPhoneOtp, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [activeMode, setActiveMode] = useState<"phone" | "google">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null);
  const [otpSecondsRemaining, setOtpSecondsRemaining] = useState(0);
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [signingInWithGoogle, setSigningInWithGoogle] = useState(false);
  const [googleButtonReady, setGoogleButtonReady] = useState(false);
  const [googleClientIdOverride, setGoogleClientIdOverride] = useState("");
  const [googleClientIdLoaded, setGoogleClientIdLoaded] = useState(false);
  const googleInitRef = useRef<string>("");
  const googleClientId = (
    googleClientIdOverride ||
    window.__APP_CONFIG__?.REACT_APP_GOOGLE_CLIENT_ID ||
    process.env.REACT_APP_GOOGLE_CLIENT_ID ||
    (googleClientIdLoaded ? DEFAULT_GOOGLE_CLIENT_ID : "")
  ).trim();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    let cancelled = false;

    void getGoogleClientId()
      .then((clientId) => {
        if (!cancelled && clientId?.trim()) {
          setGoogleClientIdOverride(clientId.trim());
        }
        if (!cancelled) {
          setGoogleClientIdLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setGoogleClientIdOverride("");
          setGoogleClientIdLoaded(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!otpExpiresAt) {
      setOtpSecondsRemaining(0);
      return undefined;
    }

    const updateCountdown = () => {
      const nextRemaining = Math.max(0, Math.ceil((otpExpiresAt - Date.now()) / 1000));
      setOtpSecondsRemaining(nextRemaining);
      if (nextRemaining <= 0) {
        setOtpRequested(false);
      }
    };

    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(intervalId);
  }, [otpExpiresAt]);

  useEffect(() => {
    if (!googleClientId) {
      setGoogleButtonReady(false);
      return;
    }

    if (googleInitRef.current === googleClientId) {
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

      if (googleInitRef.current === googleClientId && container.childElementCount > 0) {
        setGoogleButtonReady(true);
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
      googleInitRef.current = googleClientId;
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
      setError("Unable to load Google sign-in. Please try again later.");
      setGoogleButtonReady(false);
    };
    document.body.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, [googleClientId, googleLogin]);

  const sendOtp = async () => {
    setError("");

    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    if (!/^[6-9]\d{9}$/.test(normalizedPhone)) {
      setError("Enter a valid 10 digit Indian mobile number.");
      return;
    }

    setRequestingOtp(true);
    const result = await requestPhoneOtp(normalizedPhone);
    setRequestingOtp(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setOtpRequested(true);
    setOtp("");
    const expiresInSeconds = result.data?.expiresInSeconds ?? 300;
    setOtpExpiresAt(Date.now() + expiresInSeconds * 1000);
  };

  const handleRequestOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendOtp();
  };

  const handleVerifyOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    if (!/^[6-9]\d{9}$/.test(normalizedPhone)) {
      setError("Enter a valid 10 digit Indian mobile number.");
      return;
    }
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6 digit OTP sent to your mobile.");
      return;
    }

    setVerifyingOtp(true);
    const result = await verifyPhoneOtp(normalizedPhone, otp);
    setVerifyingOtp(false);

    if (result.error) {
      setError(result.error);
      return;
    }
  };

  return (
    <section className="shell section page-section auth-page">
      <div className="store-card auth-card">
        <span className="eyebrow">Login</span>
        <h1>Sign in to Eldoo</h1>
        <p>Use phone OTP or continue with Google to access your account.</p>

        <div className="auth-card__tabs" role="tablist" aria-label="Login methods">
          <button
            type="button"
            className={`auth-card__tab ${activeMode === "phone" ? "auth-card__tab--active" : ""}`}
            onClick={() => setActiveMode("phone")}
          >
            Phone OTP
          </button>
          <button
            type="button"
            className={`auth-card__tab ${activeMode === "google" ? "auth-card__tab--active" : ""}`}
            onClick={() => setActiveMode("google")}
          >
            Google
          </button>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        {activeMode === "phone" ? (
          <form className="auth-card__otp-form" onSubmit={otpRequested ? handleVerifyOtp : handleRequestOtp}>
            <label>
              Mobile number
              <input
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(normalizePhoneNumber(event.target.value))}
                onPaste={(event) => {
                  event.preventDefault();
                  setPhoneNumber(normalizePhoneNumber(event.clipboardData.getData("text")));
                }}
                placeholder="Enter 10 digit mobile number"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={10}
                required
              />
            </label>

            {otpRequested ? (
              <label>
                OTP
                <input
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  onPaste={(event) => {
                    event.preventDefault();
                    setOtp(event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6));
                  }}
                  placeholder="Enter 6 digit OTP"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                />
              </label>
            ) : null}

            {otpRequested ? (
              <div className="auth-card__otp-actions">
              <button
                type="button"
                className="link-button"
                disabled={requestingOtp || verifyingOtp || otpSecondsRemaining > 0}
                onClick={() => {
                  setOtpRequested(false);
                  setOtp("");
                  setOtpExpiresAt(null);
                  void sendOtp();
                }}
              >
                  {otpSecondsRemaining > 0 ? `Resend in ${otpSecondsRemaining}s` : "Resend OTP"}
                </button>
                <span className="auth-card__otp-target">Code sent to +91 {normalizePhoneNumber(phoneNumber)}</span>
              </div>
            ) : null}

            <button className="button" type="submit" disabled={requestingOtp || verifyingOtp}>
              {requestingOtp ? (
                <span className="button-loading">
                  <span className="button-loading__spinner" aria-hidden="true" />
                  Sending OTP...
                </span>
              ) : otpRequested ? (
                verifyingOtp ? (
                  <span className="button-loading">
                    <span className="button-loading__spinner" aria-hidden="true" />
                    Verifying...
                  </span>
                ) : (
                  "Verify OTP"
                )
              ) : (
                "Send OTP"
              )}
            </button>
          </form>
        ) : null}

        {activeMode === "google" ? (
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
        ) : null}
      </div>
    </section>
  );
};

export default LoginPage;
