# Complya — Plateforme de conformité fiscale PME CEMAC

> SaaS de conformité fiscale & déclarative pour PME en zone OHADA/CEMAC (focus initial : Gabon).
> Monorepo Turborepo · Next.js 14 · NestJS 10 · Prisma · PostgreSQL (Neon)

---

## Quickstart

```bash
git clone <repo>
cd complya
make setup        # installe, configure, migre — < 15 min
make dev-docker   # lance API + Web + DB + MinIO + MailHog
```

**C'est tout.** `make setup` guide le reste interactivement.

---

## Prérequis

| Outil   | Version | Lien                           |
| ------- | ------- | ------------------------------ |
| Node.js | ≥ 20    | https://nodejs.org             |
| pnpm    | ≥ 9     | `npm install -g pnpm@9`        |
| Docker  | any     | https://docker.com (optionnel) |

---

## Modes de développement

### Mode Docker (recommandé)

Lance Postgres + MinIO (R2 local) + MailHog en containers. Parité maximale avec la prod.

```bash
make setup        # choisir [1] Docker lors du prompt
make dev-docker   # API + Web en watch mode
```

Accès :

| URL                          | Service                                              |
| ---------------------------- | ---------------------------------------------------- |
| http://localhost:3000        | Next.js (Web)                                        |
| http://localhost:3001        | NestJS (API)                                         |
| http://localhost:3001/health | Health check                                         |
| http://localhost:9001        | MinIO console (R2 local) — `minioadmin / minioadmin` |
| http://localhost:8025        | MailHog (emails capturés)                            |

Variables `apps/api/.env` en mode Docker :

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/complya
DATABASE_URL_UNPOOLED=postgresql://postgres:postgres@localhost:5433/complya
R2_ENDPOINT=http://localhost:9000
R2_ACCESS_KEY_ID=minioadmin
R2_SECRET_ACCESS_KEY=minioadmin
R2_BUCKET_NAME=complya-documents-dev
R2_ACCOUNT_ID=local
```

> `docker-compose.override.yml` remplace automatiquement ces valeurs par les noms de services internes
> (`postgres:5432`, `minio:9000`) pour les containers. Les URLs `localhost` restent pour les outils host
> (Prisma Studio, `make migrate`).

### Mode sans Docker

Neon dev branch + Cloudflare R2 dev bucket. Plus rapide à démarrer, services cloud réels.

```bash
make setup        # choisir [2] sans Docker lors du prompt
make dev          # API + Web localement
```

Créer une branche Neon personnelle :

```bash
neonctl branch create --name dev-$(whoami) --parent main
neonctl connection-string dev-$(whoami) --pooled   # → DATABASE_URL
neonctl connection-string dev-$(whoami)             # → DATABASE_URL_UNPOOLED
```

---

## Architecture

```
Browser
  │  mutations → Server Actions (POST)
  │  lectures  → fetch / SWR / React Query
  ▼
Next.js (App Router)      — UI + BFF léger, aucune logique métier
  │  SDK typé (/packages/sdk)
  ▼
NestJS API                — toute la logique métier + fiscal
  ├── PostgreSQL (Neon / Prisma)
  ├── R2 / MinIO (métadonnées uniquement en transit)
  └── Trigger.dev (jobs async)
        └── Mistral OCR API
```

### Packages

| Package              | Rôle                                    |
| -------------------- | --------------------------------------- |
| `packages/types`     | Types domaine partagés                  |
| `packages/schemas`   | Schémas Zod partagés                    |
| `packages/tax-rules` | Règles fiscales versionnées (YAML/JSON) |
| `packages/sdk`       | Client TS typé Next → NestJS            |
| `packages/config`    | ESLint · Prettier · tsconfig partagés   |

### Concepts domaine

| Terme                     | Définition                                                           |
| ------------------------- | -------------------------------------------------------------------- |
| **Tenant / Organisation** | Entité cliente (cabinet ou PME directe)                              |
| **Company**               | Dossier entreprise sous un tenant                                    |
| **FiscalPeriod**          | Contexte mensuel (`year`, `month`) — tous les calculs s'y rattachent |
| **Obligation**            | Montant dû à une administration pour une période                     |
| **Filing**                | Déclaration déposée + preuve archivée                                |
| **DUS**                   | Déclaration Unique des Salaires (portail Gabon Connect)              |
| **CNSS**                  | Caisse Nationale de Sécurité Sociale (Gabon)                         |
| **CNAMGS**                | Caisse Nationale d'Assurance Maladie et de Garantie Sociale (Gabon)  |
| **DGI**                   | Direction Générale des Impôts                                        |

---

## Commandes Makefile

```bash
make help          # liste toutes les commandes
make dev           # API + Web sans Docker
make dev-docker    # API + Web en Docker
make setup         # onboarding complet nouveau dev
make migrate       # appliquer les migrations Prisma
make migrate-dev   # créer + appliquer une migration dev
make seed          # peupler la DB avec données de test
make reset         # reset DB + migrations + seed
make studio        # Prisma Studio (UI base de données)
make test          # lancer tous les tests
make type-check    # TypeScript strict check
make lint          # ESLint sur tout le monorepo
make check         # type-check + lint
make docker-up     # démarrer les services Docker
make docker-down   # arrêter les services Docker
make docker-logs   # logs Docker en live
make docker-reset  # reset complet Docker (volumes inclus)
make trigger-dev   # runner Trigger.dev local
make build         # build production
make clean         # nettoyer node_modules + dist
```

---

## CI/CD

| Branche   | Déclencheur   | Jobs                             |
| --------- | ------------- | -------------------------------- |
| `main`    | PR uniquement | type-check + lint + test + build |
| `develop` | PR + push     | type-check + lint + test + build |

Les jobs CI utilisent des variables placeholder (pas de vraie DB) — les tests unitaires ne touchent pas Postgres.

---

## Variables d'environnement

Voir `apps/api/.env.example` pour la documentation complète de chaque variable.

Variables obligatoires au démarrage de l'API :

| Variable                | Source                                                                     |
| ----------------------- | -------------------------------------------------------------------------- |
| `DATABASE_URL`          | Neon Console ou Docker local                                               |
| `DATABASE_URL_UNPOOLED` | Neon Console ou Docker local                                               |
| `CLERK_SECRET_KEY`      | dashboard.clerk.com                                                        |
| `R2_ACCOUNT_ID`         | dash.cloudflare.com ou `local` (Docker)                                    |
| `R2_ACCESS_KEY_ID`      | Cloudflare R2 API tokens ou `minioadmin` (Docker)                          |
| `R2_SECRET_ACCESS_KEY`  | Cloudflare R2 API tokens ou `minioadmin` (Docker)                          |
| `R2_BUCKET_NAME`        | Créer un bucket par env : `-dev`, `-staging`, `-prod`                      |
| `R2_ENDPOINT`           | `https://<account-id>.r2.cloudflarestorage.com` ou `http://localhost:9000` |
| `TRIGGER_SECRET_KEY`    | app.trigger.dev (préfixe `tr_dev_` en dev)                                 |

> L'API refuse de démarrer si une variable obligatoire est manquante ou invalide.

---

## Conventions Neon (sans Docker)

```
main          → prod (protégée, migrations CI uniquement)
staging       → staging
dev           → dev partagé (reset autorisé entre alphas)
dev-<login>   → branche personnelle par développeur
alpha/AXX     → branche éphémère CI par alpha
```

---

## État d'avancement

| Version  | Statut   | Périmètre                                                                                                   |
| -------- | -------- | ----------------------------------------------------------------------------------------------------------- |
| **v0.1** | En cours | Multi-tenant · Employés & salaires · Dashboard obligations DGI/CNSS/CNAMGS Gabon · Rappels · Export CSV/PDF |
| **MVP**  | Planifié | Paie complète · Ingestion documents R2 · Exports DUS · Audit log                                            |
| **v1.2** | Roadmap  | OCR Mistral · SYSCOHADA · Rapprochement bancaire · RBAC avancé                                              |
| **v2.0** | Roadmap  | Moteur multi-pays CEMAC · Vue cabinet · Scoring risque                                                      |

Voir `.claude/` pour la roadmap détaillée (`RELEASE_PLAN.md`) et les sprints en cours.
