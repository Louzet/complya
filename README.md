# Complya — Plateforme de conformité fiscale PME CEMAC

> SaaS de conformité fiscale & déclarative pour PME en zone OHADA/CEMAC.
> Monorepo Turborepo · Next.js 14 · NestJS 10 · Prisma · PostgreSQL (Neon)

---

## Prérequis

- Node.js >= 20
- pnpm >= 9
- Docker & docker-compose
- Comptes : Neon (DB), Clerk (auth), Cloudflare R2 (stockage), Trigger.dev (jobs)

---

## Installation

```bash
# Cloner le repo
git clone https://github.com/votre-org/complya.git
cd complya

# Installer les dépendances
pnpm install

# Copier les fichiers d'environnement
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# Remplir les variables dans apps/api/.env et apps/web/.env.local
```

---

## Développement local (avec Docker)

```bash
# Démarrer tous les services (API + Web + PostgreSQL local)
docker-compose up

# En arrière-plan
docker-compose up -d

# Voir les logs
docker-compose logs -f api
docker-compose logs -f web
```

Services disponibles :
- Web (Next.js) : http://localhost:3000
- API (NestJS) : http://localhost:3001
- Health check : http://localhost:3001/health
- PostgreSQL : localhost:5432

---

## Développement local (sans Docker — Neon direct)

```bash
# Lancer tous les services en mode watch
pnpm dev

# Lancer uniquement l'API
pnpm --filter api dev

# Lancer uniquement le Web
pnpm --filter web dev
```

---

## Migrations base de données

```bash
# Dev — crée une nouvelle migration et l'applique
pnpm --filter api migrate:dev

# Prod / Staging — applique les migrations existantes (pas de création)
pnpm --filter api migrate:deploy

# Réinitialiser la DB de dev (DESTRUCTIF)
pnpm --filter api migrate:reset

# Générer le client Prisma après un changement de schéma
pnpm --filter api generate
```

---

## Tests

```bash
# Tests unitaires (tous les packages)
pnpm test

# Tests e2e NestJS uniquement
pnpm --filter api test:e2e

# Tests avec couverture
pnpm --filter api test:cov
```

---

## Build

```bash
# Build tous les packages (ordre respecté via Turborepo)
pnpm build

# Build un package spécifique
pnpm --filter api build
pnpm --filter web build
```

---

## Lint & Format

```bash
# Linter tous les packages
pnpm lint

# Vérification des types TypeScript
pnpm type-check

# Formatter le code (Prettier)
pnpm format
```

---

## Staging

```bash
docker-compose -f docker-compose.yml -f docker-compose.staging.yml up
```

---

## Production

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## Structure du monorepo

```
apps/
  web/        Next.js 14 App Router — UI & BFF léger
  api/        NestJS 10 + Fastify — logique métier & API
packages/
  types/      Types domaine partagés (TypeScript)
  schemas/    Zod schemas partagés (validation)
  tax-rules/  Règles fiscales versionnées (YAML)
  sdk/        Client TS typé pour appeler NestJS depuis Next.js
  config/     ESLint · Prettier · tsconfig partagés
infrastructure/
  docker/     Dockerfiles (dev + prod multi-stage)
  scripts/    migrate.sh, seed.sh
```

---

## Variables d'environnement

Chaque app/package possède son propre `.env.example` documenté :

- `apps/api/.env.example` — Variables NestJS (DB, Clerk, R2, Trigger.dev)
- `apps/web/.env.example` — Variables Next.js (Clerk public keys, API URL)
- `.env.example` — Variables racine (CI/CD, Docker registry)

---

## Domaine métier

| Terme | Définition |
|-------|-----------|
| DUS | Déclaration Unique des Salaires — portail Gabon Connect |
| CNSS | Caisse Nationale de Sécurité Sociale (Gabon) |
| CNAMGS | Caisse Nationale d'Assurance Maladie et de Garantie Sociale |
| DGI | Direction Générale des Impôts |
| SYSCOHADA | Système comptable OHADA |
| Obligation | Montant à payer à une administration pour une période donnée |
| Filing | Déclaration déposée + preuve de paiement archivée |
| Tenant | Organisation cliente (cabinet ou PME directe) |
