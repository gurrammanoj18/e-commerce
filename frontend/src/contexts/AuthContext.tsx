import React, { createContext, useContext, useEffect, useState } from "react";
import { AxiosError } from "axios";
import {
  adminLogin as adminLoginRequest,
  googleLogin as googleLoginRequest,
  requestOtp as requestOtpRequest,
  verifyOtp as verifyOtpRequest,
} from "../services/authService";
import { AuthUser, OtpChallengeResponse } from "../types/store";

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
  requestOtp: (email: string) => Promise<AuthActionResult<OtpChallengeResponse>>;
  verifyOtp: (email: string, otpCode: string) => Promise<AuthActionResult>;
  googleLogin: (credential: string) => Promise<AuthActionResult>;
  adminLogin: (email: string, password: string) => Promise<AuthActionResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = "voltmart-auth-user";
const TOKEN_STORAGE_KEY = "voltmart-token";

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = window.localStorage.getItem(AUTH_STORAGE_KEY);
    const storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const persistAuth = (nextUser: AuthUser | null, nextToken: string | null) => {
    setUser(nextUser);
    setToken(nextToken);

    if (nextUser && nextToken) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
      window.localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
      return;
    }

    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  };

  const requestOtp = async (email: string) => {
    try {
      return { data: await requestOtpRequest({ email }) };
    } catch (error) {
      return {
        error: extractErrorMessage(error, "Unable to send OTP right now."),
      };
    }
  };

  const verifyOtp = async (email: string, otpCode: string) => {
    try {
      const response = await verifyOtpRequest({ email, otpCode });
      persistAuth(response.user, response.token);
      return {};
    } catch (error) {
      return {
        error: extractErrorMessage(error, "Unable to verify OTP right now."),
      };
    }
  };

  const googleLogin = async (credential: string) => {
    try {
      const response = await googleLoginRequest({ credential });
      persistAuth(response.user, response.token);
      return {};
    } catch (error) {
      return {
        error: extractErrorMessage(error, "Unable to log in with Google right now."),
      };
    }
  };

  const adminLogin = async (email: string, password: string) => {
    try {
      const response = await adminLoginRequest({ email, password });
      persistAuth(response.user, response.token);
      return {};
    } catch (error) {
      return {
        error: extractErrorMessage(error, "Unable to log in right now."),
      };
    }
  };

  const logout = () => {
    persistAuth(null, null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        isAdmin: user?.role === "ROLE_ADMIN",
        loading,
        requestOtp,
        verifyOtp,
        googleLogin,
        adminLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
