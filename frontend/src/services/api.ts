import axios from "axios";

declare global {
  interface Window {
    __APP_CONFIG__?: {
      REACT_APP_API_BASE_URL?: string;
      REACT_APP_GOOGLE_CLIENT_ID?: string;
      REACT_APP_MSG91_WIDGET_ID?: string;
      REACT_APP_MSG91_TOKEN_AUTH?: string;
    };
  }
}

const DEFAULT_PRODUCTION_API_BASE_URL = "https://voltmart-backend-xuho.onrender.com/api";

const getDefaultApiBaseUrl = () => {
  const hostname = window.location.hostname;
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";

  return isLocalhost ? "http://localhost:8080/api" : DEFAULT_PRODUCTION_API_BASE_URL;
};

const api = axios.create({
  baseURL:
    window.__APP_CONFIG__?.REACT_APP_API_BASE_URL ||
    process.env.REACT_APP_API_BASE_URL ||
    getDefaultApiBaseUrl(),
});

api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem("voltmart-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const setApiAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete api.defaults.headers.common.Authorization;
};

export default api;
