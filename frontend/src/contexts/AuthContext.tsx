import React, { createContext, useContext, useEffect, useState } from "react";
import { login as loginRequest, signup as signupRequest } from "../services/authService";
import { AuthUser } from "../types/store";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = "voltmart-auth-user";
const TOKEN_STORAGE_KEY = "voltmart-token";

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

  const login = async (email: string, password: string) => {
    try {
      const response = await loginRequest({ email, password });
      persistAuth(response.user, response.token);
      return true;
    } catch {
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const response = await signupRequest({
        fullName: name,
        email,
        password,
      });
      persistAuth(response.user, response.token);
      return true;
    } catch {
      return false;
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
        login,
        signup,
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
