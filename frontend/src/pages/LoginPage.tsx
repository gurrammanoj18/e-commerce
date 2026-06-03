import React, { useEffect, useRef, useState } from "react";
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

let initializedGoogleClientId: string | null = null;
let activeGoogleLogin: ((credential: string) => Promise<{ error?: string }>) | null = null;
let activeGoogleErrorHandler: ((message: string) => void) | null = null;

const LoginPage: React.FC = () => {
  const { isAuthenticated, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [googleReady, setGoogleReady] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const googleLoginRef = useRef(googleLogin);
  const googleClientId =
    window.__APP_CONFIG__?.REACT_APP_GOOGLE_CLIENT_ID ||
    process.env.REACT_APP_GOOGLE_CLIENT_ID;

  useEffect(() => {
    googleLoginRef.current = googleLogin;
    activeGoogleLogin = googleLogin;
    activeGoogleErrorHandler = setError;
  }, [googleLogin]);

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

      setGoogleReady(true);
      container.innerHTML = "";
      if (initializedGoogleClientId !== googleClientId) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async ({ credential }) => {
            setSigningIn(true);
            setError("");
            const result = activeGoogleLogin
              ? await activeGoogleLogin(credential)
              : await googleLoginRef.current(credential);
            if (result.error) {
              activeGoogleErrorHandler?.(result.error);
              setSigningIn(false);
            }
          },
        });
        initializedGoogleClientId = googleClientId;
      }
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
  }, [googleClientId]);

  return (
    <section className="shell section page-section auth-page">
      <div className="auth-page__product-backdrop" aria-hidden="true">
        <img className="auth-page__product auth-page__product--laptop" src="/catalog/pulse-laptop.webp" alt="" />
        <img className="auth-page__product auth-page__product--headset" src="/catalog/sonic-headset.webp" alt="" />
        <img className="auth-page__product auth-page__product--keyboard" src="/catalog/vector-keyboard.webp" alt="" />
        <img className="auth-page__product auth-page__product--monitor" src="/catalog/lumen-monitor.webp" alt="" />
        <img className="auth-page__product auth-page__product--speaker" src="/catalog/forge-speaker.webp" alt="" />
      </div>
      <div className="auth-card">
        <div className="auth-card__brand">
          <span className="eyebrow">VoltMart account</span>
          <h1>Sign in to continue shopping</h1>
          <p>Access saved carts, order tracking, wallet rewards, and faster checkout with your Google account.</p>
        </div>
        <div className="auth-card__benefits" aria-label="Account benefits">
          <span>Saved cart</span>
          <span>Order tracking</span>
          <span>Quick checkout</span>
        </div>
        <div className="auth-card__google">
          {error ? <p className="form-error">{error}</p> : null}
          {googleClientId ? (
            <>
              {!googleReady ? (
                <div className="auth-card__google-loading" role="status">
                  <span className="auth-card__spinner" aria-hidden="true" />
                  Preparing secure login...
                </div>
              ) : null}
              <div className="auth-card__google-button">
                <div id="google-signin-button" aria-hidden={signingIn} />
                {signingIn ? (
                  <div className="auth-card__signin-overlay" role="status">
                    <span className="auth-card__spinner" aria-hidden="true" />
                    Signing you in...
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <p className="form-error">Google login is not configured.</p>
          )}
        </div>
        <p className="auth-card__note">Use the same Google account whenever you shop on VoltMart.</p>
      </div>
    </section>
  );
};

export default LoginPage;
