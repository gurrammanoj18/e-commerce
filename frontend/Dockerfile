FROM node:20-alpine AS build
WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci

COPY frontend .
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
COPY frontend/public/env-config.js /usr/share/nginx/html/env-config.js
COPY frontend/docker-entrypoint.sh /docker-entrypoint.d/40-env-config.sh

RUN chmod +x /docker-entrypoint.d/40-env-config.sh

EXPOSE 80
