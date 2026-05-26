#!/bin/sh
set -eu

cat <<EOF >/usr/share/nginx/html/env-config.js
window.__APP_CONFIG__ = {
  REACT_APP_API_BASE_URL: "${REACT_APP_API_BASE_URL:-http://localhost:8080/api}",
  REACT_APP_GOOGLE_CLIENT_ID: "${REACT_APP_GOOGLE_CLIENT_ID:-302745292687-8pkf6i6gfdqvohe9jr45q5q77qb585bi.apps.googleusercontent.com}"
};
EOF
