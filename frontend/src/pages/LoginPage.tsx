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

      container.innerHTML = "";
      if (initializedGoogleClientId !== googleClientId) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async ({ credential }) => {
            const result = activeGoogleLogin
              ? await activeGoogleLogin(credential)
              : await googleLoginRef.current(credential);
            if (result.error) {
              activeGoogleErrorHandler?.(result.error);
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
      <div className="store-card auth-card">
        <span className="eyebrow">Login</span>
        <h1>Google login</h1>
        <p>Use your Google account to access saved carts, checkout faster, and track orders.</p>
        {error ? <p className="form-error">{error}</p> : null}
        {googleClientId ? (
          <div id="google-signin-button" />
        ) : (
          <p className="form-error">Google login is not configured.</p>
        )}
      </div>
    </section>
  );
};

export default LoginPage;
