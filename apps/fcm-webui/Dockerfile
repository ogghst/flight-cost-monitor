FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.3 --activate

# Copy workspace configuration
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./

# Copy only package.json files first to leverage cache
COPY apps/fcm-webui/package.json ./apps/fcm-webui/
COPY packages/fcm-shared/package.json ./packages/fcm-shared/
COPY packages/fcm-shared-webui/package.json ./packages/fcm-shared-webui/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/fcm-shared/ ./packages/fcm-shared/
COPY packages/fcm-shared-webui/ ./packages/fcm-shared-webui/
COPY apps/fcm-webui/ ./apps/fcm-webui/

# Copy shared .env.local for build time
COPY apps/fcm-webui/.env.local ./apps/fcm-webui/

# Build shared packages first
RUN pnpm --filter "@fcm/shared" build
RUN pnpm --filter "@fcm/shared-webui" build

# Build the Next.js app
RUN pnpm --filter "@fcm/webui" build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.3 --activate

# Copy necessary files and built artifacts
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./

# Copy built packages and their package.json
COPY --from=builder /app/packages/fcm-shared/package.json ./packages/fcm-shared/
COPY --from=builder /app/packages/fcm-shared/dist/ ./packages/fcm-shared/dist/
COPY --from=builder /app/packages/fcm-shared-webui/package.json ./packages/fcm-shared-webui/
COPY --from=builder /app/packages/fcm-shared-webui/dist/ ./packages/fcm-shared-webui/dist/

# Copy Next.js standalone build
COPY --from=builder /app/apps/fcm-webui/.next/standalone/ ./
COPY --from=builder /app/apps/fcm-webui/.next/static/ ./apps/fcm-webui/.next/static/
COPY --from=builder /app/apps/fcm-webui/public/ ./apps/fcm-webui/public/
COPY --from=builder /app/apps/fcm-webui/.env.local ./apps/fcm-webui/.env.local

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Expose port
EXPOSE 3000

# Start the app
CMD ["node", "apps/fcm-webui/server.js"]