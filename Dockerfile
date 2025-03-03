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

# Manually install node-pre-gyp as a project dependency
RUN pnpm add node-pre-gyp

# Manually compile bcrypt
RUN cd node_modules/bcrypt && npx node-pre-gyp install --fallback-to-build

# Copy application source code and build
COPY . .
RUN pnpm run build

# Production Stage
FROM node:18-alpine AS production

# Enable corepack and install necessary dependencies
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN apk add --no-cache python3 make g++ bash

WORKDIR /app

# Copy package files and install production dependencies
COPY package.json pnpm-lock.yaml ./

# Remove Husky’s prepare script before installing
RUN npm pkg delete scripts.prepare
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Manually compile bcrypt again in production
RUN cd node_modules/bcrypt && npx node-pre-gyp install --fallback-to-build

# Copy built files from the builder stage
COPY --from=builder /app/dist ./dist

# Set environment variables
ENV NODE_ENV=production \
    PORT=8001 \
    TZ=Asia/Jakarta

# Expose application port
EXPOSE ${PORT}

# Start the application
CMD ["node", "dist/main.js"]
