# ============================================================
# Web Dockerfile — Next.js 14 App Router
# Targets : development (hot-reload) | production (standalone)
# ============================================================

# ---- Base ----
FROM node:20-alpine AS base
RUN npm install -g pnpm@9.1.0
WORKDIR /app

# ---- Dependencies ----
FROM base AS deps
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY packages/config/package.json ./packages/config/
COPY packages/types/package.json ./packages/types/
COPY packages/schemas/package.json ./packages/schemas/
COPY packages/sdk/package.json ./packages/sdk/
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile

# ---- Development (hot-reload next dev) ----
FROM deps AS development
ENV NODE_ENV=development
COPY . .
WORKDIR /app/apps/web
EXPOSE 3000
CMD ["pnpm", "--filter", "web", "dev"]

# ---- Build ----
FROM deps AS builder
COPY . .
# Active le mode standalone Next.js pour l'image de prod
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter web... build

# ---- Production ----
FROM node:20-alpine AS production
LABEL maintainer="Complya Team"

# Sécurité : utilisateur non-root
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Next.js standalone output
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "apps/web/server.js"]
