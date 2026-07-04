# =============================================================
# AgentFlow Web — Dockerfile
# Multi-stage build for Next.js production
# =============================================================

# Stage 1: Builder
FROM node:20-alpine AS builder

RUN npm install -g pnpm@9

WORKDIR /app

# Copy workspace config files
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY turbo.json ./
COPY tsconfig.base.json ./
COPY .npmrc ./

# Copy all packages and apps needed
COPY packages/shared ./packages/shared
COPY packages/database ./packages/database
COPY apps/web ./apps/web

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Build shared package first, then web
RUN pnpm --filter @agentflow/shared build
RUN pnpm --filter @agentflow/web build

# =============================================================
# Stage 2: Production runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy the standalone Next.js build output
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
