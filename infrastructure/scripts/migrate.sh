#!/usr/bin/env bash
# ============================================================
# migrate.sh — Wrapper prisma migrate deploy
#
# Usage :
#   ./infrastructure/scripts/migrate.sh                    # utilise DATABASE_URL_UNPOOLED de l'env
#   DATABASE_URL_UNPOOLED="postgresql://..." ./infrastructure/scripts/migrate.sh
#
# IMPORTANT : Utilise DATABASE_URL_UNPOOLED (connexion directe, sans PgBouncer)
# prisma migrate NE FONCTIONNE PAS avec une connexion poolée
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
API_DIR="$PROJECT_ROOT/apps/api"

echo "🔄 Complya — Migration base de données"
echo "   Environnement : ${NODE_ENV:-development}"
echo "   Timestamp     : $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo ""

# Charger le .env si on est en développement
if [ "${NODE_ENV:-development}" = "development" ] && [ -f "$API_DIR/.env" ]; then
  echo "   Chargement de $API_DIR/.env"
  set -a
  # shellcheck disable=SC1091
  source "$API_DIR/.env"
  set +a
fi

# Vérifier que DATABASE_URL_UNPOOLED est définie
if [ -z "${DATABASE_URL_UNPOOLED:-}" ]; then
  echo "❌ Erreur : DATABASE_URL_UNPOOLED n'est pas définie"
  echo "   Cette variable est obligatoire pour prisma migrate"
  echo "   Récupérer la connexion directe (non-poolée) depuis Neon Console"
  exit 1
fi

echo "   DB : ${DATABASE_URL_UNPOOLED:0:50}..."
echo ""

cd "$API_DIR"

# Créer le schema PostgreSQL si absent (requis par Prisma multiSchema)
# prisma migrate ne crée pas les schemas PostgreSQL — à faire avant deploy
echo "🔧 Création du schema 'complya' si absent..."
DATABASE_URL="$DATABASE_URL_UNPOOLED" pnpm exec prisma db execute \
  --stdin <<'SQL'
CREATE SCHEMA IF NOT EXISTS complya;
SQL

# Générer le client Prisma
echo "📦 Génération du client Prisma..."
pnpm exec prisma generate

# Appliquer les migrations
echo ""
echo "🗄️  Application des migrations..."
DATABASE_URL="$DATABASE_URL_UNPOOLED" pnpm exec prisma migrate deploy

echo ""
echo "✅ Migration terminée avec succès"
