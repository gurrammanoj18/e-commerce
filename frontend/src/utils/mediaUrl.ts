const DEFAULT_PRODUCTION_API_BASE_URL = "https://voltmart-backend-xuho.onrender.com/api";

const getDefaultApiBaseUrl = () => {
  const hostname = window.location.hostname;
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";

  return isLocalhost ? "http://localhost:8080/api" : DEFAULT_PRODUCTION_API_BASE_URL;
};

const getApiBaseUrl = () =>
  window.__APP_CONFIG__?.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_API_BASE_URL ||
  getDefaultApiBaseUrl();

export const resolveMediaUrl = (value?: string | null) => {
  if (!value) {
    return "";
  }

  if (/^(data:|https?:\/\/|\/\/)/i.test(value)) {
    return value;
  }

  if (value.startsWith("/")) {
    return value;
  }

  const apiBaseUrl = getApiBaseUrl();
  const mediaBaseUrl = apiBaseUrl.replace(/\/api\/?$/, "");
  return new URL(`/${value}`, mediaBaseUrl).toString();
};
