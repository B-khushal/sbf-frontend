# ============================================
# SBF Florist Frontend — Production Dockerfile
# ============================================
# Multi-stage build: Build with Node → Serve with Nginx
# React + Vite + TypeScript + Tailwind CSS
# ============================================

# ── Stage 1: Install Dependencies ────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copy only package files for optimal Docker layer caching
COPY package.json package-lock.json ./

# Install all dependencies (need devDeps for build)
RUN npm ci

# ── Stage 2: Build the Vite App ──────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for Vite environment variables
# These are baked into the static files at build time
ARG VITE_API_URL=https://api.sbflorist.in/api
ARG VITE_UPLOADS_URL=https://api.sbflorist.in
ARG VITE_APP_MODE=production
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_RAZORPAY_KEY_ID
ARG VITE_RAZORPAY_KEY_SECRET

# Set env vars for Vite build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_UPLOADS_URL=$VITE_UPLOADS_URL
ENV VITE_APP_MODE=$VITE_APP_MODE
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_RAZORPAY_KEY_ID=$VITE_RAZORPAY_KEY_ID
ENV VITE_RAZORPAY_KEY_SECRET=$VITE_RAZORPAY_KEY_SECRET
ENV NODE_ENV=production

# Build the production bundle
RUN npm run build

# ── Stage 3: Serve with Nginx ────────────────
FROM nginx:1.27-alpine AS production

# Add labels for image metadata
LABEL maintainer="B-khushal"
LABEL description="SBF Florist Frontend"
LABEL version="1.0.0"

# Remove default nginx config
RUN rm -rf /etc/nginx/conf.d/*

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Ensure proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html

# Expose ports 80 and 3000 (Dokploy reverse proxy supports both)
EXPOSE 80 3000

# Healthcheck — ensure nginx is serving content (uses built-in busybox wget)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q -O - http://127.0.0.1/health > /dev/null || exit 1

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
