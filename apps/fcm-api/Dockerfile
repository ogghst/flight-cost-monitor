FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.3 --activate

# Copy workspace configuration
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./

# Copy package.json files first to leverage cache
COPY apps/fcm-api/package.json ./apps/fcm-api/
COPY packages/fcm-shared/package.json ./packages/fcm-shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/fcm-shared/ ./packages/fcm-shared/
COPY apps/fcm-api/ ./apps/fcm-api/

# Build shared package first
RUN pnpm --filter "@fcm/shared" build

# Build the NestJS app
RUN pnpm --filter "@fcm/api" build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

# Install pnpm and production dependencies
RUN corepack enable && corepack prepare pnpm@9.15.3 --activate

# Copy necessary files and built artifacts
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./

# Copy built packages and their package.json
COPY --from=builder /app/packages/fcm-shared/package.json ./packages/fcm-shared/
COPY --from=builder /app/packages/fcm-shared/dist/ ./packages/fcm-shared/dist/

# Copy NestJS built app
COPY --from=builder /app/apps/fcm-api/package.json ./apps/fcm-api/
COPY --from=builder /app/apps/fcm-api/dist/ ./apps/fcm-api/dist/

# Create log directory
RUN mkdir -p /app/apps/fcm-api/logs

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Expose port
EXPOSE 3001

# Start the app
CMD ["node", "apps/fcm-api/dist/main"]