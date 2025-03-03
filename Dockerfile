# Build stage
FROM node:18-alpine AS builder

# Create app directory and user
RUN addgroup -S nodejs && adduser -S nodeuser -G nodejs

# Set working directory and permissions
WORKDIR /app
RUN chown -R nodeuser:nodejs /app

# Switch to non-root user
USER nodeuser

# Copy package files
COPY --chown=nodeuser:nodejs package*.json ./
COPY --chown=nodeuser:nodejs tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY --chown=nodeuser:nodejs src/ ./src/

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Create app directory and user
RUN addgroup -S nodejs && adduser -S nodeuser -G nodejs

# Set working directory and permissions
WORKDIR /app
RUN chown -R nodeuser:nodejs /app

# Required environment variables
ENV NODE_ENV=production \
    PORT=8001 \
    DB_HOST=required \
    DB_PORT=required \
    DB_NAME=required \
    DB_USERNAME=required \
    DB_PASS=required \
    JWT_SECRET=required \
    REFRESH_TOKEN_SECRET=required \
    TZ=Asia/Jakarta

# Copy validation script
COPY --chown=nodeuser:nodejs scripts/validate-env.sh ./scripts/
RUN chmod +x ./scripts/validate-env.sh

# Switch to non-root user
USER nodeuser

# Copy package files and install production dependencies
COPY --chown=nodeuser:nodejs package*.json ./
RUN npm ci --only=production

# Copy built application from builder stage
COPY --chown=nodeuser:nodejs --from=builder /app/dist ./dist

# Expose the application port
EXPOSE ${PORT}

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/health || exit 1

# Validate environment variables and start the application
CMD ["sh", "-c", "./scripts/validate-env.sh && npm run start:prod"]
