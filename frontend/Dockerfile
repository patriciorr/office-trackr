# Build stage for the Vite application
FROM node:25-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ARG VITE_DISABLE_REGISTRATION
RUN npm run build

# Production web server stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
ENV BACKEND_HOST=backend \
    BACKEND_PORT=5000 \
    NGINX_ENTRYPOINT_LOCAL_RESOLVERS=1 \
    NGINX_ENVSUBST_FILTER="^(BACKEND_HOST|BACKEND_PORT|NGINX_LOCAL_RESOLVERS)$"

COPY nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]