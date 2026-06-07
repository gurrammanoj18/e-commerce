#!/bin/sh
set -eu

cat <<EOF >/usr/share/nginx/html/env-config.js
window.__APP_CONFIG__ = {
  REACT_APP_API_BASE_URL: "${REACT_APP_API_BASE_URL:-http://localhost:8080/api}",
  REACT_APP_GOOGLE_CLIENT_ID: "${REACT_APP_GOOGLE_CLIENT_ID:-}",
  REACT_APP_MSG91_WIDGET_ID: "${REACT_APP_MSG91_WIDGET_ID:-}",
  REACT_APP_MSG91_TOKEN_AUTH: "${REACT_APP_MSG91_TOKEN_AUTH:-}"
};
EOF
