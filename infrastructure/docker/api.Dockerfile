# ============================================================
# API Dockerfile — NestJS + Fastify
# Targets : development (hot-reload) | production (multi-stage)
# ============================================================

# ---- Base ----
FROM node:20-alpine AS base
RUN npm install -g pnpm@9.1.0
WORKDIR /app
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY packages/config/package.json ./packages/config/
COPY packages/types/package.json ./packages/types/
COPY packages/schemas/package.json ./packages/schemas/
COPY packages/tax-rules/package.json ./packages/tax-rules/
COPY packages/sdk/package.json ./packages/sdk/
COPY apps/api/package.json ./apps/api/

# ---- Dependencies ----
FROM base AS deps
RUN pnpm install --frozen-lockfile

# ---- Development (hot-reload via ts-node / nest start --watch) ----
FROM deps AS development
ENV NODE_ENV=development
COPY . .
WORKDIR /app/apps/api
EXPOSE 3001
CMD ["pnpm", "--filter", "api", "dev"]

# ---- Build ----
FROM deps AS builder
COPY . .
RUN pnpm --filter api... build

# ---- Production ----
FROM node:20-alpine AS production
RUN npm install -g pnpm@9.1.0
WORKDIR /app

# Copier uniquement ce qui est nécessaire au runtime
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/packages/types/package.json ./packages/types/
COPY --from=builder /app/packages/types/dist ./packages/types/dist
COPY --from=builder /app/packages/schemas/package.json ./packages/schemas/
COPY --from=builder /app/packages/schemas/dist ./packages/schemas/dist

# Installer uniquement les dépendances de production
RUN pnpm install --prod --frozen-lockfile

ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "apps/api/dist/main.js"]
