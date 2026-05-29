#!/usr/bin/env bash
# ============================================================
# setup.sh — Onboarding nouveau développeur Complya
#
# Usage :
#   bash infrastructure/scripts/setup.sh
#
# Ce script :
#   1. Vérifie les prérequis (node 22+, pnpm 9+, docker)
#   2. Copie les .env.example si absents
#   3. Installe les dépendances pnpm
#   4. Indique d'appeler `make dev` pour démarrer l'env complet
#
# NOTE : toutes les migrations s'exécutent dans Docker via make dev.
#        Ne jamais lancer prisma migrate en dehors de Docker.
# ============================================================
set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${GREEN}✓  $1${NC}"; }
warn() { echo -e "${YELLOW}!  $1${NC}"; }
fail() { echo -e "${RED}✗  $1${NC}"; exit 1; }
info() { echo -e "${CYAN}→  $1${NC}"; }
step() { echo -e "\n${CYAN}──── $1 ────${NC}\n"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   Complya — Setup environnement local        ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════╝${NC}"
echo ""

# ─── 1. Prérequis ─────────────────────────────────────────────────────────────
step "1/3 — Prérequis"

command -v node >/dev/null 2>&1 || fail "Node.js 22+ requis. Installer via nvm : nvm install 22"
NODE_MAJOR=$(node -e "console.log(process.versions.node.split('.')[0])")
[ "$NODE_MAJOR" -ge 22 ] || fail "Node.js 22+ requis (actuel : $(node -v)). Voir .nvmrc"
log "Node.js $(node -v)"

command -v pnpm >/dev/null 2>&1 || fail "pnpm requis. Installer : corepack enable && corepack prepare pnpm@9.15.4 --activate"
PNPM_MAJOR=$(pnpm -v | cut -d. -f1)
[ "$PNPM_MAJOR" -ge 9 ] || fail "pnpm 9+ requis (actuel : $(pnpm -v))"
log "pnpm $(pnpm -v)"

command -v docker >/dev/null 2>&1 || fail "Docker requis. Installer : https://docs.docker.com/get-docker/"
docker info >/dev/null 2>&1 || fail "Docker daemon non démarré. Lancer Docker Desktop ou 'sudo systemctl start docker'"
log "Docker $(docker version --format '{{.Server.Version}}' 2>/dev/null || docker -v | awk '{print $3}' | tr -d ',')"

command -v docker >/dev/null && docker compose version >/dev/null 2>&1 || \
  fail "Docker Compose v2 requis (plugin 'docker compose', pas 'docker-compose')"
log "Docker Compose $(docker compose version --short 2>/dev/null || echo 'v2')"

# ─── 2. Variables d'environnement ─────────────────────────────────────────────
step "2/3 — Variables d'environnement"

copy_env() {
  local src="$1" dst="$2" label="$3"
  if [ ! -f "$dst" ]; then
    cp "$src" "$dst"
    warn "$label créé depuis .example — vérifier les valeurs avant de démarrer"
  else
    log "$label déjà présent"
  fi
}

copy_env "$ROOT/apps/api/.env.example"   "$ROOT/apps/api/.env"       "apps/api/.env"
copy_env "$ROOT/apps/web/.env.example"   "$ROOT/apps/web/.env.local" "apps/web/.env.local"

# ─── 3. Installation des dépendances ──────────────────────────────────────────
step "3/3 — Installation des dépendances"

cd "$ROOT"
pnpm install --frozen-lockfile
log "Dépendances installées"

# ─── Résumé ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Setup terminé                              ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"
echo ""
echo "  Démarrer l'environnement complet (Docker) :"
echo ""
echo -e "    ${CYAN}make dev${NC}"
echo ""
echo "  Cela démarre : Postgres → migrations Prisma → API → Web"
echo "  Logs disponibles dans .logs/ après démarrage."
echo ""
echo "  Accès une fois démarré :"
echo "    http://localhost:3000  — Next.js"
echo "    http://localhost:3001  — NestJS API"
echo "    http://localhost:8025  — MailPit (emails de dev)"
echo "    http://localhost:9001  — MinIO console (R2 local)"
echo ""
echo "  Autres commandes utiles :"
echo -e "    ${CYAN}make help${NC}                    liste toutes les commandes"
echo -e "    ${CYAN}make migrate-docker NAME=xxx${NC} créer une migration Prisma"
echo -e "    ${CYAN}make studio${NC}                  Prisma Studio"
echo -e "    ${CYAN}make test${NC}                    lancer les tests"
echo ""
echo "  Documentation : docs/dev-workflow.md"
echo ""
