import axios from "axios";

declare global {
  interface Window {
    __APP_CONFIG__?: {
      REACT_APP_API_BASE_URL?: string;
    };
  }
}

const api = axios.create({
  baseURL:
    window.__APP_CONFIG__?.REACT_APP_API_BASE_URL ||
    process.env.REACT_APP_API_BASE_URL ||
    "http://localhost:8080/api",
});

api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem("voltmart-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
