# Build stage
FROM node:18-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Create app directory and user
RUN addgroup -S nodejs && adduser -S nodeuser -G nodejs

# Set working directory and permissions
WORKDIR /app
RUN chown -R nodeuser:nodejs /app

# Switch to non-root user
USER nodeuser

# Copy package files
COPY --chown=nodeuser:nodejs package*.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY --chown=nodeuser:nodejs src/ ./src/
COPY --chown=nodeuser:nodejs tsconfig.json ./

# Build the application
RUN pnpm run build

# Production stage
FROM node:18-alpine AS production

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Create app directory and user
RUN addgroup -S nodejs && adduser -S nodeuser -G nodejs

# Set working directory and permissions
WORKDIR /app
RUN chown -R nodeuser:nodejs /app

# Switch to non-root user
USER nodeuser

# Copy package files and install production dependencies
COPY --chown=nodeuser:nodejs package*.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# Copy built application from builder stage
COPY --chown=nodeuser:nodejs --from=builder /app/dist ./dist

# Set NODE_ENV
ENV NODE_ENV=production \
    PORT=8001 \
    TZ=Asia/Jakarta

# Expose the application port
EXPOSE ${PORT}

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/health || exit 1

# Start the application
CMD ["pnpm", "run", "start:prod"]
