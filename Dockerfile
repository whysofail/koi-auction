# Use official Node.js image with Alpine or Debian base
FROM node:22-slim

# Set working directory
WORKDIR /app

# Install necessary packages for native modules like bcrypt
RUN apt-get update && \
    apt-get install -y python3 make g++ && \
    apt-get clean

# Copy package files and install dependencies
COPY pnpm-lock.yaml package.json ./
RUN npm install -g pnpm && pnpm install

# Copy source code
COPY . .

# Build the TypeScript project
RUN pnpm build

# Expose the port your app runs on
EXPOSE 8001

# Start the app
CMD ["pnpm", "start"]
