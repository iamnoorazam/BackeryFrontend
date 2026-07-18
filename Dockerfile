# Frontend (Vite SPA) — multi-stage: build with Node, serve with nginx.
FROM node:22-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# API base URL baked into the build. Defaults to "/api" so nginx can reverse-
# proxy to the backend on the same origin (no CORS). Override at build time:
#   docker build --build-arg VITE_API_URL=https://api.example.com/api .
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
