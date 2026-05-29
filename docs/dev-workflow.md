# Dev Workflow — Complya

> Règle n°1 : **tout se passe dans Docker**. Ni Node, ni pnpm, ni Prisma ne s'exécutent directement sur la machine host — sauf les outils locaux listés dans les exceptions.

---

## Démarrage

```bash
make dev
```

C'est la seule commande à retenir. Elle :

1. Vérifie que Docker tourne
2. Crée `apps/api/.env` et `apps/web/.env.local` depuis les exemples si absents
3. Build les images Docker si nécessaire
4. Démarre : **postgres → migrate → api → web** (dans l'ordre correct)
5. Streame les logs vers le terminal ET dans `.logs/`

**Services disponibles :**

| Service    | URL                          | Credentials             |
| ---------- | ---------------------------- | ----------------------- |
| API NestJS | http://localhost:3001        | —                       |
| Health     | http://localhost:3001/health | —                       |
| Web Next   | http://localhost:3000        | —                       |
| MinIO (R2) | http://localhost:9001        | minioadmin / minioadmin |
| MailPit    | http://localhost:8025        | —                       |
| PostgreSQL | localhost:5433 (hors Docker) | postgres / postgres     |

---

## Commandes courantes

```bash
make dev          # démarrage complet (build + migrate + logs)
make up           # redémarrage rapide sans rebuild
make stop         # arrêt propre des services
make restart SVC=api   # redémarrer un service précis
make logs         # logs live + écriture dans .logs/
make logs-api     # logs NestJS uniquement
make logs-web     # logs Next.js uniquement
make docker-ps    # statut des containers
```

---

## Migrations Prisma

### Créer une migration (toujours dans Docker)

```bash
make migrate-docker NAME=a03-employees
```

Cette commande lance `prisma migrate dev` dans le container api, avec la base locale.
Le fichier SQL de migration est créé dans `apps/api/prisma/migrations/` et versionné dans git.

**Ne jamais lancer `prisma migrate dev` directement sur la machine host.**
Raison : le container api et la machine host n'ont pas le même PostgreSQL — la
migration s'appliquerait sur la mauvaise base.

### Appliquer les migrations (auto au démarrage)

Le service `migrate` dans docker-compose.yml applique automatiquement `prisma migrate deploy`
à chaque `make dev`. C'est idempotent — si aucune migration n'est en attente, rien ne se passe.

### Reset complet (dev uniquement)

```bash
make reset
```

⚠️ Supprime toutes les données. Refusé si `NODE_ENV=production`.

### Voir la base de données — Prisma Studio

Prisma Studio se connecte directement au PostgreSQL local (port 5433).
C'est l'une des rares exceptions où un outil tourne hors Docker :

```bash
make studio
```

Assure-toi que `apps/api/.env` contient `DATABASE_URL=postgresql://postgres:postgres@localhost:5433/complya`.

---

## Logs

Les logs sont centralisés dans `.logs/` (git-ignorés sauf `.gitkeep`) :

```
.logs/
  api/
    2026-05-29.log    # logs NestJS du jour
  web/
    2026-05-29.log    # logs Next.js du jour
  dev.log             # tous les services (append)
```

`make dev` et `make logs` écrivent dans ces fichiers automatiquement.
`make logs-api` / `make logs-web` affichent sans écriture fichier.

Pour grep dans les logs :

```bash
grep "ERROR" .logs/api/$(date +%Y-%m-%d).log
grep "tenantId" .logs/api/$(date +%Y-%m-%d).log
```

---

## Variables d'environnement

Fichiers à remplir après un premier `make dev` (copiés depuis `.env.example`) :

| Fichier               | Contenu minimal requis              |
| --------------------- | ----------------------------------- |
| `apps/api/.env`       | `CLERK_SECRET_KEY`, `CLERK_JWT_KEY` |
| `apps/web/.env.local` | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` |

Les variables R2, SMTP et DATABASE_URL sont gérées automatiquement par docker-compose.override.yml
(MinIO + MailPit locaux). Aucune config cloud nécessaire pour dev.

---

## Ajouter un module NestJS

```bash
# Dans le container api
docker compose exec api sh -c "cd /app/apps/api && pnpm exec nest generate module modules/employees"
docker compose exec api sh -c "cd /app/apps/api && pnpm exec nest generate service modules/employees"
docker compose exec api sh -c "cd /app/apps/api && pnpm exec nest generate controller modules/employees"
```

Ou directement sur la machine host si NestJS CLI est installé globalement — les fichiers
sont hot-reloadés via bind-mount.

---

## Debug NestJS (VSCode)

Le port 9229 est exposé par le container api. Ajoute dans `.vscode/launch.json` :

```json
{
  "type": "node",
  "request": "attach",
  "name": "Docker: NestJS",
  "port": 9229,
  "restart": true,
  "remoteRoot": "/app/apps/api"
}
```

Le hot-reload avec debug est activé via `pnpm dev:debug` :

```bash
make restart SVC=api
# puis dans le container :
docker compose exec api sh -c "cd /app/apps/api && pnpm dev:debug"
```

---

## Emails en développement

Tous les emails SMTP sont capturés par MailPit. Aucun email réel n'est envoyé.
Interface : http://localhost:8025

---

## Schéma PostgreSQL de production (Neon)

En staging/prod, la base est Neon (serverless PostgreSQL). Les branches Neon
permettent d'avoir un env par PR :

- `main` → branche Neon production
- `staging` → branche Neon staging
- PR → branche Neon éphémère (voir CI)

Les migrations sont appliquées via GitHub Actions (`.github/workflows/migrate.yml`).

---

## Exceptions autorisées hors Docker

Ces outils peuvent tourner sur la machine host :

| Outil             | Raison                                       |
| ----------------- | -------------------------------------------- |
| `make studio`     | Prisma Studio a besoin d'un browser local    |
| `pnpm install`    | Régénérer le lockfile après bump de versions |
| `pnpm lint`       | Pre-commit hooks Husky                       |
| `pnpm type-check` | Pre-commit hooks Husky                       |

Tout le reste (migrate, seed, build, test, nest generate) → dans Docker.
