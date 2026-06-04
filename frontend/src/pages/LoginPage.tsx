import React, { useEffect, useState } from "react";
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

const LoginPage: React.FC = () => {
  const { isAuthenticated, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [googleButtonReady, setGoogleButtonReady] = useState(false);
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

      const isMobile = window.innerWidth <= 520;
      container.innerHTML = "";
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async ({ credential }) => {
          setError("");
          setSigningIn(true);
          const result = await googleLogin(credential);
          if (result.error) {
            setError(result.error);
            setSigningIn(false);
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
  }, [googleClientId, googleLogin, navigate]);

  return (
    <section className="shell section page-section auth-page">
      <div className="store-card auth-card">
        <span className="eyebrow">Login</span>
        <h1>Continue with Google</h1>
        <p>Sign in to access saved carts, checkout faster, and track orders.</p>
        {error ? <p className="form-error">{error}</p> : null}
        {googleClientId ? (
          <div className="auth-card__google-button" aria-busy={signingIn || !googleButtonReady}>
            <div id="google-signin-button" />
            {!googleButtonReady && !signingIn ? (
              <div className="auth-card__signin-overlay">
                <span className="auth-card__spinner" aria-hidden="true" />
                Preparing Google...
              </div>
            ) : null}
            {signingIn ? (
              <div className="auth-card__signin-overlay">
                <span className="auth-card__spinner" aria-hidden="true" />
                Signing in...
              </div>
            ) : null}
          </div>
        ) : (
          <p className="form-error">Google login is not configured yet.</p>
        )}
      </div>
    </section>
  );
};

export default LoginPage;
