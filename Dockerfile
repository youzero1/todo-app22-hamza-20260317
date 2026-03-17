FROM node:20-alpine AS base

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++ libc6-compat

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm i

# Copy source files
COPY . .

# Create data directory
RUN mkdir -p ./data

# Set environment
ENV NODE_ENV=production
ENV DATABASE_PATH=./data/todos.db
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start command
CMD ["npm", "run", "start"]
