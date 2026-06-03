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
          const result = await googleLogin(credential);
          if (result.error) {
            setError(result.error);
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
          <div id="google-signin-button" />
        ) : (
          <p className="form-error">Google login is not configured yet.</p>
        )}
      </div>
    </section>
  );
};

export default LoginPage;
