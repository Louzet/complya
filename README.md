# Complya — Plateforme de conformité fiscale PME CEMAC

> SaaS de conformité fiscale & déclarative pour PME en zone OHADA/CEMAC (focus initial : Gabon).
> Monorepo Turborepo · Next.js 14 · NestJS 10 · Prisma · PostgreSQL (Neon)

---

## 🏗️ Architecture & Fonctionnement du Projet

Complya est conçu sous la forme d'un **monorepo TypeScript** géré par **Turborepo** et **pnpm**. Les responsabilités sont réparties comme suit :

### Composants principaux
*   **`apps/web`** : Frontend Next.js 14 (App Router) servant d'interface utilisateur et de BFF (Backend-for-Frontend) léger. Aucun calcul fiscal ni logique métier ne doit être implémenté ici.
*   **`apps/api`** : Backend NestJS 10 (utilisant Fastify en production) contenant l'ensemble de la logique métier, du moteur de calcul fiscal, de la gestion de l'OCR et de la génération des déclarations.
*   **`packages/`** : Bibliothèques partagées au sein du monorepo :
    *   `packages/types` : Modèles de données et interfaces de requêtes partagés.
    *   `packages/schemas` : Schémas Zod pour la validation de bout en bout.
    *   `packages/tax-rules` : Moteur et configuration YAML des taux et règles fiscales par pays/administration.
    *   `packages/sdk` : Client API fortement typé pour faciliter les appels de `web` vers `api`.
    *   `packages/config` : Configurations partagées (ESLint, Prettier, TypeScript).

### Concepts clés du domaine
*   **Tenant / Organisation** : Une entité parente (ex: Cabinet comptable ou PME en direct).
*   **Company (Entreprise)** : Un dossier d'entreprise hébergé sous un tenant. Une organisation peut gérer $N$ entreprises.
*   **FiscalPeriod (Période fiscale)** : Contexte mensuel (`year`, `month`) associé à un statut `open` ou `locked`. Les calculs de paie et d'obligations s'y effectuent toujours.
*   **Obligation** : Échéance déclarative calculée par rapport à une période pour une administration (ex: `DGI`, `CNSS`, `CNAMGS`).
*   **DUS** : Déclaration Unique des Salaires (Gabon Connect).

---

## 🚀 Quickstart — Démarrage rapide en local

Suivez ces étapes pour configurer et lancer le projet en local en restant synchronisé (ISO) avec le reste de l'équipe.

### 1. Prérequis
Assurez-vous d'avoir installé sur votre machine :
*   **Node.js** >= 20.0.0
*   **pnpm** >= 9.0.0 (géré via Corepack ou installé globalement)
*   **Docker & Docker Compose** (requis pour faire tourner la base de données PostgreSQL locale)

### 2. Installation des dépendances
À la racine du projet, lancez :
```bash
pnpm install
```

### 3. Fichiers d'environnement (`.env`)
Copiez les modèles d'environnements pour chaque application :
```bash
# Pour l'API NestJS
cp apps/api/.env.example apps/api/.env

# Pour le Frontend Next.js
cp apps/web/.env.example apps/web/.env.local
```
*Note : Les fichiers `.env` et `.env.local` sont exclus du suivi Git pour des raisons de sécurité.*

### 4. Configuration de la base de données (PostgreSQL)

Deux modes de fonctionnement sont supportés en local :

#### Option A : PostgreSQL Local via Docker (Recommandé en Dev)
1. Lancez le conteneur PostgreSQL :
   ```bash
   docker compose up -d postgres
   ```
2. Modifiez votre fichier `apps/api/.env` pour utiliser la base locale (décommentez ces lignes si nécessaire) :
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cemac_dev
   DATABASE_URL_UNPOOLED=postgresql://postgres:postgres@localhost:5432/cemac_dev
   ```

#### Option B : Neon PostgreSQL (Cloud / Sandbox de l'équipe)
Si vous travaillez avec des branches de base de données Neon ou une base partagée :
1. Renseignez directement les chaînes de connexion Neon fournies dans votre console d'administration (`console.neon.tech`) dans le fichier `apps/api/.env` :
   ```env
   DATABASE_URL=postgresql://user:password@ep-xxx.eu-west-2.aws.neon.tech/cemac?sslmode=require&pgbouncer=true
   DATABASE_URL_UNPOOLED=postgresql://user:password@ep-xxx.eu-west-2.aws.neon.tech/cemac?sslmode=require
   ```

### 5. Initialisation du schéma de base de données
Exécutez les commandes suivantes pour générer le client Prisma et appliquer le schéma :
```bash
# Générer le client Prisma
pnpm --filter api generate

# Appliquer les migrations de structure de base de données
pnpm --filter api migrate:dev
```

### 6. Lancement des serveurs de développement
Lancez l'ensemble du monorepo (API + Frontend + Postgres s'il est configuré dans Docker Compose) :
```bash
pnpm dev
```
Une fois démarré :
*   **Frontend Web** : [http://localhost:3000](http://localhost:3000)
*   **Backend API** : [http://localhost:3001](http://localhost:3001)
*   **Health Check API** (Vérification de la santé des services) : [http://localhost:3001/health](http://localhost:3001/health)

---

## ⚠️ Notes sur l'état d'avancement & Points d'amélioration

Certains composants du projet sont en cours de développement, simplifiés pour les besoins des phases Alpha courantes, ou nécessitent des ajustements locaux. 

### 🔐 Contournement de l'authentification (Clerk)
*   **Situation actuelle** : Le projet intègre **Clerk** pour l'authentification. Si vous ne possédez pas de clés d'API Clerk valides localement ou si vous souhaitez travailler en mode "sandbox" sans Clerk :
    *   Vous pouvez temporairement commenter l'appel à `auth().protect()` dans `apps/web/src/middleware.ts` ainsi que la redirection vers `/sign-in` dans `apps/web/src/app/(app)/layout.tsx`.
*   **Amélioration prévue** : Un mécanisme de mock d'authentification robuste (`bypass-auth-provider`) sera implémenté afin d'éviter d'avoir à manipuler le code à chaque nouvelle installation locale.

### 🌱 Données de démonstration (Prisma Seed)
*   **Situation actuelle** : Le script de peuplement `apps/api/prisma/seed.ts` est actuellement une coquille vide prête pour l'injection (aucun enregistrement n'est inséré).
*   **Amélioration prévue** : Les données par défaut (utilisateurs de démo, organisations de test, exemples d'entreprises gabonaises) seront intégrées dès l'Alpha A02 pour permettre un démarrage instantané post-migration. Pour peupler la base manuellement à ce stade, utilisez Prisma Studio via `pnpm --filter api studio`.

### ⚙️ Moteur de calcul & Règles fiscales
*   **Situation actuelle** : Les calculs de cotisations (CNSS, CNAMGS, IRPP Gabon) sont pour le moment implémentés de façon simplifiée ou semi-statique dans l'API NestJS.
*   **Amélioration prévue** : La migration totale de ces règles vers des configurations YAML versionnées autonomes (`packages/tax-rules`) est prévue lors de l'Alpha A21 afin de découpler la logique réglementaire du code de l'application.

### 📄 OCR & Traitements asynchrones (Trigger.dev & Mistral AI)
*   **Situation actuelle** : Les modules liés à l'OCR Mistral et à Trigger.dev sont désactivés par défaut via les variables d'environnement (`NEXT_PUBLIC_ENABLE_OCR=false`).
*   **Amélioration prévue** : L'implémentation de la couche 3 (OCR & documents) se fera de manière progressive. Pour tester en local, l'utilisation de l'émulateur Trigger.dev en ligne de commande ou de credentials valides sera documentée dans `/docs/alphas/` correspondants.
