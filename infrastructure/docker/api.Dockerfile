# ============================================================
# API Dockerfile — NestJS + Fastify
# Targets : development (hot-reload) | production (multi-stage)
# Node     : 22 LTS
# ============================================================

# ---- Base ─────────────────────────────────────────────────
FROM node:22-alpine AS base
RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

# Copie uniquement les manifests pour profiter du cache Docker
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY packages/config/package.json    ./packages/config/
COPY packages/types/package.json     ./packages/types/
COPY packages/schemas/package.json   ./packages/schemas/
COPY packages/tax-rules/package.json ./packages/tax-rules/
COPY packages/sdk/package.json       ./packages/sdk/
COPY apps/api/package.json           ./apps/api/

# ---- Dependencies ──────────────────────────────────────────
FROM base AS deps
COPY apps/api/prisma ./apps/api/prisma
RUN pnpm install --frozen-lockfile
RUN pnpm --filter api exec prisma generate

# ---- Development (hot-reload via nest start --watch) ──────
FROM deps AS development
ENV NODE_ENV=development

ARG UID=1000
ARG GID=1000
# Chown uniquement les répertoires sources — node_modules reste root (world-readable = OK).
# prisma generate est déjà exécuté dans la stage deps (au build), pas au démarrage du container.
RUN chown -R ${UID}:${GID} /app/apps/api/src /app/apps/api/prisma 2>/dev/null || true
USER ${UID}:${GID}

COPY --chown=${UID}:${GID} . .
WORKDIR /app
EXPOSE 3001 9229
CMD ["pnpm", "--filter", "api", "dev"]

# ---- Build ─────────────────────────────────────────────────
FROM deps AS builder
COPY . .
RUN pnpm --filter api... build

# ---- Prune — deps prod uniquement, workspace packages résolus
FROM builder AS pruner
RUN pnpm --filter api deploy --prod /deploy

# ---- Production ────────────────────────────────────────────
FROM node:22-alpine AS production
RUN apk add --no-cache openssl
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
WORKDIR /app

COPY --from=pruner  --chown=nestjs:nodejs /deploy/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist   ./dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/prisma ./prisma
COPY --from=pruner  --chown=nestjs:nodejs /deploy/package.json ./package.json

USER nestjs
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "dist/main.js"]
