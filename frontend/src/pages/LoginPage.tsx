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
  }
}

const digitsOnly = (value: string, maxLength: number) =>
  value.replace(/\D/g, "").slice(0, maxLength);

const LoginPage: React.FC = () => {
  const { googleLogin, isAuthenticated, requestLoginOtp, verifyLoginOtp } = useAuth();
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [verifiedPhoneNumber, setVerifiedPhoneNumber] = useState("");
  const [demoOtp, setDemoOtp] = useState("");
  const [error, setError] = useState("");
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [signingInWithGoogle, setSigningInWithGoogle] = useState(false);
  const [googleButtonReady, setGoogleButtonReady] = useState(false);
  const googleClientId =
    window.__APP_CONFIG__?.REACT_APP_GOOGLE_CLIENT_ID ||
    process.env.REACT_APP_GOOGLE_CLIENT_ID;

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
    document.body.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, [googleClientId, googleLogin]);

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
        <h1>Sign in to VoltMart</h1>
        <p>Continue with Google or use your mobile number to get an OTP.</p>

        {error ? <p className="form-error">{error}</p> : null}

        {googleClientId ? (
          <div className="auth-card__google-button" aria-busy={signingInWithGoogle || !googleButtonReady}>
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
          </div>
        ) : null}

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
      </div>
    </section>
  );
};

export default LoginPage;
