# Build Stage
FROM node:18-alpine AS builder

# Enable corepack and install necessary dependencies
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN apk add --no-cache python3 make g++ bash

WORKDIR /app

# Copy package files and install dependencies
COPY package.json pnpm-lock.yaml ./
ENV HUSKY=0

# Install dependencies without running scripts
RUN pnpm install --frozen-lockfile --ignore-scripts

# Manually compile bcrypt (to avoid recompilation in production)
RUN cd node_modules/bcrypt && npx node-pre-gyp install --fallback-to-build

# Copy application source code and build
COPY . .
RUN pnpm run build

# Production Stage
FROM node:18-alpine AS production

# Enable corepack and install necessary dependencies
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN apk add --no-cache bash

# Install curl for healthcheck
RUN apk add --no-cache curl

WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy only production dependencies (avoid reinstallation)
COPY --from=builder /app/node_modules ./node_modules

# Copy only necessary package files (without reinstalling dependencies)
COPY package.json pnpm-lock.yaml ./

# Copy and set up entrypoint script
# COPY docker-entrypoint.sh /usr/local/bin/
# RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Set environment variables
ENV NODE_ENV=production \
    PORT=8001 \
    TZ=Asia/Jakarta

# Expose application port
EXPOSE ${PORT}

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:${PORT}/api/health || exit 1

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Set entrypoint
# ENTRYPOINT ["docker-entrypoint.sh"]

# Default command
CMD ["node", "dist/main.js"]
