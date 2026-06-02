FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
COPY public/env-config.js /usr/share/nginx/html/env-config.js
COPY docker-entrypoint.sh /docker-entrypoint.d/40-env-config.sh

RUN chmod +x /docker-entrypoint.d/40-env-config.sh

EXPOSE 80
