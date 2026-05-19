#!/usr/bin/env bash
# ============================================================
# seed.sh — Seed de développement
#
# Usage :
#   ./infrastructure/scripts/seed.sh
#
# ATTENTION : À utiliser en développement uniquement
# Ne jamais exécuter en production
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
API_DIR="$PROJECT_ROOT/apps/api"

echo "🌱 Complya — Seed de développement"
echo "   Environnement : ${NODE_ENV:-development}"
echo ""

# Vérifier qu'on n'est PAS en production
if [ "${NODE_ENV:-development}" = "production" ]; then
  echo "❌ REFUSÉ : seed interdit en environnement production"
  exit 1
fi

# Charger le .env de dev
if [ -f "$API_DIR/.env" ]; then
  echo "   Chargement de $API_DIR/.env"
  set -a
  # shellcheck disable=SC1091
  source "$API_DIR/.env"
  set +a
fi

echo "📦 Génération du client Prisma..."
cd "$API_DIR"
pnpm exec prisma generate

echo ""
echo "🌱 Exécution du seed..."
pnpm exec ts-node --project tsconfig.json prisma/seed.ts

echo ""
echo "✅ Seed terminé"
