#!/bin/sh
set -eu

cat <<EOF >/usr/share/nginx/html/env-config.js
window.__APP_CONFIG__ = {
  REACT_APP_API_BASE_URL: "${REACT_APP_API_BASE_URL:-http://localhost:8080/api}",
  REACT_APP_GOOGLE_CLIENT_ID: "${REACT_APP_GOOGLE_CLIENT_ID:-}",
  REACT_APP_GOOGLE_MAPS_API_KEY: "${REACT_APP_GOOGLE_MAPS_API_KEY:-}"
};
EOF

for asset_dir in /usr/share/nginx/html/catalog /usr/share/nginx/html/brand-logos; do
  if [ -d "$asset_dir" ]; then
    chmod -R a+rX "$asset_dir"
  fi
done
