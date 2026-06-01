#!/usr/bin/env bash
# ============================================================
# dev-start.sh — Lance l'env de développement complet
# Usage : bash infrastructure/scripts/dev-start.sh [--no-build]
# Appelé par : make dev | make up
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$ROOT"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

BUILD_FLAG="--build"
# -V recrée les volumes anonymes (node_modules) depuis l'image.
# Nécessaire quand un package est ajouté — sans ça, l'ancien volume est réutilisé
# même si l'image a été rebuildée et contient le nouveau package.
VOLUMES_FLAG="-V"
if [ "${1:-}" = "--no-build" ]; then
  BUILD_FLAG=""
fi

# ─── Prérequis ───────────────────────────────────────────────────────────────
if ! command -v docker &>/dev/null; then
  printf "${RED}✗ Docker non trouvé. Installe Docker Desktop ou Docker Engine.${NC}\n"
  exit 1
fi
if ! docker info &>/dev/null 2>&1; then
  printf "${RED}✗ Docker daemon non démarré.${NC}\n"
  exit 1
fi

# ─── Fichiers .env ───────────────────────────────────────────────────────────
if [ ! -f apps/api/.env ]; then
  printf "${YELLOW}⚠  apps/api/.env absent → copie depuis .env.example${NC}\n"
  cp apps/api/.env.example apps/api/.env
  printf "${YELLOW}   → Remplis CLERK_SECRET_KEY et autres vars dans apps/api/.env${NC}\n\n"
fi

if [ ! -f apps/web/.env.local ]; then
  printf "${YELLOW}⚠  apps/web/.env.local absent → copie depuis .env.example${NC}\n"
  cp apps/web/.env.example apps/web/.env.local
  printf "${YELLOW}   → Remplis NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY dans apps/web/.env.local${NC}\n\n"
fi

# ─── Répertoires de logs ─────────────────────────────────────────────────────
mkdir -p .logs/api .logs/web
LOG_DATE=$(date +%Y-%m-%d)
LOG_ALL=".logs/dev.log"
LOG_API=".logs/api/${LOG_DATE}.log"
LOG_WEB=".logs/web/${LOG_DATE}.log"

# ─── Démarrage ───────────────────────────────────────────────────────────────
printf "\n${CYAN}🚀 Démarrage Complya...${NC}\n"
# --remove-orphans : supprime les containers d'anciennes configs (ex: mailhog → mailpit)
# -V : recrée les volumes anonymes depuis l'image (node_modules frais à chaque démarrage)
# shellcheck disable=SC2086
docker compose up -d --remove-orphans $BUILD_FLAG $VOLUMES_FLAG

printf "\n${GREEN}✓ Services démarrés${NC}\n\n"
printf "  API     → http://localhost:3001\n"
printf "  Health  → http://localhost:3001/health\n"
printf "  Web     → http://localhost:3000\n"
printf "  MinIO   → http://localhost:9001  (minioadmin / minioadmin)\n"
printf "  MailPit → http://localhost:8025\n"
printf "\n"
printf "  Logs    → %s\n" "$LOG_API"
printf "            %s\n" "$LOG_WEB"
printf "            %s  (tous services)\n" "$LOG_ALL"
printf "\n"
printf "  Ctrl+C  → stoppe les logs (services continuent en arrière-plan)\n"
printf "  make stop → arrête tous les services\n\n"

# ─── Écriture silencieuse des logs par service ───────────────────────────────
# Ces processus tournent en fond et écrivent dans .logs/ sans polluer le terminal.
# Le terminal reçoit tous les logs via le dernier appel `docker compose logs -f`.
docker compose logs --no-color --timestamps -f api >> "$LOG_API" 2>&1 &
docker compose logs --no-color --timestamps -f web >> "$LOG_WEB" 2>&1 &

cleanup() {
  pkill -P $$ 2>/dev/null || true
  exit 0
}
trap cleanup INT TERM

# ─── Logs en live sur le terminal + écriture dans dev.log ────────────────────
docker compose logs -f 2>&1 | tee -a "$LOG_ALL"

wait
