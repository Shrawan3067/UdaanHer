# ==============================================================================
# UdaanHer Frontend Dockerfile - Multi-stage Production Build
# Giving women wings to fly
# ==============================================================================

# --- Stage 1: Build Frontend Assets ---
FROM node:20-alpine AS builder

WORKDIR /app

# Accept build argument for API URL (defaults to relative /api/v1 for Nginx reverse-proxy)
ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=$VITE_API_URL

# Copy package manifests and install all dependencies
COPY package*.json ./
RUN npm install

# Copy source and config files
COPY tsconfig*.json ./
COPY vite.config.* ./
COPY tailwind.config.* ./
COPY postcss.config.* ./
COPY index.html ./
COPY public/ ./public/
COPY src/ ./src/

# Compile React Vite project to static assets in /app/dist
RUN npm run build

# --- Stage 2: Serve with High-Performance Nginx ---
FROM nginx:1.27-alpine AS runner

# Remove default nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy built static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Health check to ensure Nginx is serving the index page
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Launch Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]

