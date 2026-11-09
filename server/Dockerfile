# ==============================================================================
# UdaanHer Backend Dockerfile - Multi-stage Production Build
# Giving women wings to fly
# ==============================================================================

# --- Stage 1: Builder ---
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy source files and TypeScript configuration
COPY tsconfig.json ./
COPY src/ ./src/

# Compile TypeScript to JavaScript in /app/dist
RUN npm run build

# --- Stage 2: Production Runtime ---
FROM node:20-alpine AS runner

WORKDIR /app

# Install dumb-init for proper signal handling and curl for container health checks
RUN apk add --no-cache dumb-init curl

ENV NODE_ENV=production
ENV PORT=5001

# Copy package manifests and install production-only dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled JavaScript from builder
COPY --from=builder /app/dist ./dist

# Create receipts storage directory and assign ownership to non-root node user
RUN mkdir -p storage/receipts logs && chown -R node:node /app

# Switch to non-root user
USER node

# Expose internal API port
EXPOSE 5001

# Health check to verify the Express server is responding
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:5001/health || exit 1

# Start the Node.js application via dumb-init for graceful shutdown
CMD ["dumb-init", "node", "dist/server.js"]

