# =============================================================
# AgentFlow API — Dockerfile
# Multi-stage build for production
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
COPY apps/api ./apps/api

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma client
RUN pnpm --filter @agentflow/database prisma generate

# Build shared package first, then API
RUN pnpm --filter @agentflow/shared build
RUN pnpm --filter @agentflow/database build
RUN pnpm --filter @agentflow/api build

# =============================================================
# Stage 2: Production runner
FROM node:20-alpine AS runner

RUN npm install -g pnpm@9

WORKDIR /app

ENV NODE_ENV=production

# Copy workspace config
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY .npmrc ./

# Copy built packages
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/packages/database ./packages/database
COPY --from=builder /app/apps/api ./apps/api

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Generate Prisma client in runner stage
RUN pnpm --filter @agentflow/database prisma generate

EXPOSE 4000

CMD ["node", "apps/api/dist/index.js"]
