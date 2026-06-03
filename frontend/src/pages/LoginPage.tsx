import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/pages/LoginPage.css";
import "../styles/shared/LoadingState.css";
import { toast } from "react-toastify";
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

const LoginPage: React.FC = () => {
  const { isAuthenticated, requestOtp, verifyOtp, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const googleClientId =
    window.__APP_CONFIG__?.REACT_APP_GOOGLE_CLIENT_ID ||
    process.env.REACT_APP_GOOGLE_CLIENT_ID;

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

      container.innerHTML = "";
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async ({ credential }) => {
          const result = await googleLogin(credential);
          if (result.error) {
            setError(result.error);
          }
        },
      });
      window.google.accounts.id.renderButton(container, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "continue_with",
        width: "320",
      });
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
  }, [googleClientId, googleLogin, navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) {
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      if (!otpSent) {
        if (!email.trim()) {
          setError("Enter your email address to receive an OTP.");
          return;
        }
        const result = await requestOtp(email);
        if (result.error || !result.data) {
          setError(result.error || "Unable to send OTP right now.");
          return;
        }

        setEmail(result.data.email);
        setOtpSent(true);
        toast.success(result.data.message);
        return;
      }

      const result = await verifyOtp(email, otpCode);
      if (result.error) {
        setError(result.error);
        return;
      }

      toast.success("Logged in successfully");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="shell section page-section auth-page">
      <form className="store-card auth-card" onSubmit={handleSubmit}>
        <span className="eyebrow">Login</span>
        <h1>Email OTP login</h1>
        <p>Use your email to access saved carts, checkout faster, and track orders.</p>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={otpSent}
            placeholder="you@example.com"
          />
        </label>
        {otpSent ? (
          <label>
            OTP
            <input
              inputMode="numeric"
              maxLength={6}
              value={otpCode}
              onChange={(event) => setOtpCode(event.target.value)}
            />
          </label>
        ) : null}
        {error ? <p className="form-error">{error}</p> : null}
        <button className="button" type="submit" disabled={submitting}>
          {submitting ? (
            <span className="button-loading">
              <span className="button-loading__spinner" aria-hidden="true" />
              {otpSent ? "Verifying..." : "Sending..."}
            </span>
          ) : otpSent ? "Verify OTP" : "Send OTP"}
        </button>
        {otpSent ? <p>Check your email inbox for the OTP code.</p> : null}
        {googleClientId ? (
          <>
            <p style={{ textAlign: "center", margin: "0.75rem 0" }}>or</p>
            <div id="google-signin-button" />
          </>
        ) : null}
      </form>
    </section>
  );
};

export default LoginPage;
