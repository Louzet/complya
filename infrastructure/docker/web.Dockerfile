# ============================================================
# Web Dockerfile — Next.js App Router
# Targets : development (hot-reload) | production (standalone)
# Node     : 22 LTS
# ============================================================

# ---- Base ─────────────────────────────────────────────────
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

# ---- Dependencies ──────────────────────────────────────────
FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY packages/config/package.json  ./packages/config/
COPY packages/types/package.json   ./packages/types/
COPY packages/schemas/package.json ./packages/schemas/
COPY packages/sdk/package.json     ./packages/sdk/
COPY apps/web/package.json         ./apps/web/
RUN pnpm install --frozen-lockfile

# ---- Development (hot-reload via next dev) ─────────────────
FROM deps AS development
ENV NODE_ENV=development

ARG UID=1000
ARG GID=1000
RUN chown -R ${UID}:${GID} /app/apps/web/src /app/apps/web/public 2>/dev/null || true
USER ${UID}:${GID}

COPY --chown=${UID}:${GID} . .
WORKDIR /app
EXPOSE 3000
CMD ["pnpm", "--filter", "web", "dev"]

# ---- Build ─────────────────────────────────────────────────
FROM deps AS builder
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter web... build

# ---- Production ────────────────────────────────────────────
FROM node:22-alpine AS production
LABEL org.opencontainers.image.title="Complya Web"

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Next.js standalone output
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static      ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public            ./apps/web/public

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/healthz || exit 1

CMD ["node", "apps/web/server.js"]
