const getApiBaseUrl = () =>
  window.__APP_CONFIG__?.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_API_BASE_URL ||
  "http://localhost:8080/api";

export const resolveMediaUrl = (value?: string | null) => {
  if (!value) {
    return "";
  }

  if (/^(data:|https?:\/\/|\/\/)/i.test(value)) {
    return value;
  }

  const apiBaseUrl = getApiBaseUrl();
  const mediaBaseUrl = apiBaseUrl.replace(/\/api\/?$/, "");
  return new URL(value.startsWith("/") ? value : `/${value}`, mediaBaseUrl).toString();
};
