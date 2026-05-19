# CLAUDE.md — Plateforme de conformité fiscale PME CEMAC

> **Ce fichier est la source de vérité pour tout assistant IA intervenant sur ce repo.**
> Lis-le entièrement avant de proposer du code, un schéma ou une architecture.

---

## 1. Produit en une phrase

SaaS de conformité fiscale & déclarative pour PME en zone OHADA/CEMAC — le "Pennylane de la conformité en Afrique centrale" : ingestion de pièces, structuration SYSCOHADA, calcul automatique des obligations, génération des exports déclaratifs, suivi des échéances et preuve de conformité.

---

## 2. Roadmap & périmètre actuel

| Version | Statut | Ce qu'on livre |
|---------|--------|---------------|
| **v0.1** | 🔨 En cours | Multi-tenant basique · Employés & salaires · Dashboard obligations (DGI/CNSS/CNAMGS Gabon) · Calcul codé en dur · Rappels échéances · Export CSV/PDF minimal |
| **MVP** | 📋 Planifié | Module paie complet · Règles DGI/CNSS/CNAMGS · Ingestion documents → R2 · Génération exports DUS · Audit log basique |
| **v1.2** | 🔭 Roadmap | OCR Mistral · Noyau SYSCOHADA (journaux) · Rapprochement bancaire/mobile money · RBAC avancé · Historique déclarations + preuves |
| **v2.0** | 🔭 Roadmap | Moteur de règles multi-pays CEMAC · Vue cabinet multi-dossiers · Scoring risque non-conformité |

**Règle :** ne jamais implémenter une feature d'une version ultérieure sans ticket explicite.

---

## 3. Stack — versions & décisions

### Frontend
```
Next.js 14+    App Router · TypeScript strict · React 18
```
- Rôle : UI produit + BFF léger (orchestration des appels vers NestJS)
- **Pas de logique métier ni de calcul fiscal ici**

### Backend API
```
NestJS 10+     TypeScript strict · Adaptateur Fastify (prod) · Express (dev/test ok)
```
- Toute logique métier, fiscale et de calcul vit **ici uniquement**
- Modules : `auth` · `tenants` · `users` · `documents` · `ocr` · `ledger` · `payroll` · `tax-engine` · `filings` · `reconciliation` · `notifications` · `audit` · `storage` · `jobs`

### Base de données
```
PostgreSQL 15+    Neon (serverless/branching)    Prisma ORM
```
- Schémas multi-tenant : chaque query Prisma **doit** inclure le `tenantId`
- Migrations versionnées, jamais de `db push` en production

### Auth
```
Clerk    (Next.js App Router)
```
- Mapping `clerkUserId → internalUserId` côté NestJS
- RBAC géré **côté NestJS** (guards + décorateurs), pas côté Clerk

### Stockage objet
```
Cloudflare R2    (défaut — 0 egress, edge network)
Amazon S3        (si contraintes AWS/compliance client)
```
- Upload : toujours **direct client → R2/S3** via signed URL
- NestJS ne reçoit que les métadonnées, jamais le binaire en transit

### OCR
```
Mistral OCR API    (PDF/documents structurés)
```
- Appel **toujours asynchrone** via job Trigger.dev
- Stocker : fichier brut + JSON normalisé + score de confiance + modèle source

### Jobs & async
```
Trigger.dev
```
- Cas d'usage : OCR · recalculs mensuels · exports PDF/ZIP · rappels · imports lourds
- Statuts obligatoires : `pending → processing → done | failed`

---

## 4. Architecture & flux de données

```
Browser
  │  mutations → Server Actions (POST)
  │  lectures  → GET fetch / SWR / React Query
  ▼
Next.js (App Router)  ← BFF léger uniquement
  │  appels typés via /packages/sdk
  ▼
NestJS API  ← toute la logique métier
  ├── PostgreSQL (Neon / Prisma)
  ├── R2/S3 (métadonnées uniquement en transit)
  └── Trigger.dev (jobs async)
        └── Mistral OCR API
```

**Pattern document :**
1. Client upload → R2 via signed URL
2. Next → NestJS : `POST /documents` (métadonnées)
3. NestJS → Trigger.dev : job OCR planifié
4. Trigger.dev → Mistral OCR → JSON normalisé → stocké
5. Front poll ou WebSocket : statut `processed` + données extraites

---

## 5. Pièges de performance — règles à respecter

### 5.1 Double hop Next → NestJS
- Next et Nest **doivent être co-localisés** (même région, réseau privé/VPC)
- Une Server Action = un seul appel NestJS, jamais une cascade
- Les endpoints NestJS pour les écrans complexes doivent renvoyer **toutes les données en une réponse**

### 5.2 Server Actions = POST only
- Mutations → Server Actions → NestJS ✅
- Lectures → `fetch` côté serveur dans les layouts/pages, ou GET client avec SWR/React Query ✅
- Jamais de lecture fréquente via Server Action (pas de cache HTTP/CDN sur POST)

### 5.3 Taille de payload
- `bodySizeLimit` Next.js = **1 Mo par défaut**
- Jamais d'upload de fichier via Server Action → toujours signed URL direct
- Une action = une responsabilité (créer doc ≠ lancer OCR)

### 5.4 NestJS performance
- Adapter **Fastify** en production (meilleur throughput qu'Express)
- Cache Redis pour : règles fiscales, listes statiques, metadata fréquentes
- Toutes les queries Prisma critiques : `select` explicite + pagination + index

### 5.5 OCR Mistral
- Jamais synchrone dans une requête HTTP
- Job Trigger.dev obligatoire, avec retry et gestion d'erreur explicite

---

## 6. Conventions de code

### TypeScript
```typescript
// ✅ Typage strict partout
// ❌ Jamais de `any` — utiliser `unknown` si le type est indéterminé
// ✅ Zod pour la validation des entrées (DTOs, Server Actions, règles)
```

### NestJS
```typescript
// ✅ Validation DTO : class-validator + whitelist: true + forbidNonWhitelisted: true
// ✅ Guards sur tout endpoint : @UseGuards(JwtAuthGuard, RolesGuard)
// ✅ Tenant isolation systématique dans chaque service
// ✅ Erreurs structurées — jamais de stack trace exposée au client
// ❌ Jamais de logique fiscale dans un Controller — uniquement dans un Service
```

### Prisma
```typescript
// ✅ tenantId dans chaque where{} sans exception
// ✅ select explicite sur les queries critiques (pas de SELECT *)
// ✅ Pagination systématique sur les listes
// ❌ Jamais de db push en prod — migrations versionnées uniquement
```

### Règles fiscales
```typescript
// ✅ Toujours dans /packages/tax-rules (YAML/JSON versionné) + service NestJS
// ❌ Jamais de chiffre fiscal hardcodé dans un composant React ou un Controller
// ✅ Si une règle est inconnue → TODO explicite avec source à consulter
```

---

## 7. Structure du repo (monorepo)

```
/apps
  /web          Next.js App Router — UI & BFF léger
  /api          NestJS — logique métier & API interne
/packages
  /types        Types partagés (domaine, DTO)
  /schemas      Zod — validation d'entrées
  /tax-rules    Règles fiscales versionnées (YAML/JSON)
  /sdk          Client TS typé pour appeler NestJS depuis Next.js
  /config       ESLint · Prettier · tsconfig · env
  /utils        Helpers transverses
  /ui           (optionnel) Design system partage
/infrastructure
  /docker
  /migrations
```

---

## 8. Domaine métier — ce que l'assistant doit savoir

| Terme | Définition |
|-------|-----------|
| **DUS** | Déclaration Unique des Salaires — portail Gabon Connect (DGI + CNSS + CNAMGS) |
| **CNSS** | Caisse Nationale de Sécurité Sociale (Gabon) |
| **CNAMGS** | Caisse Nationale d'Assurance Maladie et de Garantie Sociale (Gabon) |
| **DGI** | Direction Générale des Impôts |
| **SYSCOHADA** | Système comptable OHADA — plan de comptes de référence pour la zone |
| **OHADA** | Organisation pour l'Harmonisation en Afrique du Droit des Affaires |
| **CEMAC** | Communauté Économique et Monétaire de l'Afrique Centrale |
| **Obligation** | Montant à payer à une administration pour une période donnée |
| **Filing** | Déclaration déposée + preuve de paiement archivée |
| **Tenant** | Organisation cliente de la plateforme (cabinet ou PME directe) |

---

## 9. Ce que l'assistant peut et ne peut pas faire

### ✅ Autorisé
- Proposer schémas Prisma, endpoints NestJS, routes Next.js, hooks, Server Actions
- Écrire/refactorer du TypeScript strict (React, NestJS, Prisma, Zod)
- Expliquer les trade-offs (performance, sécurité, DX, coût)
- Implémenter des règles fiscales **avec source explicite** dans le code
- Proposer des migrations Prisma et patterns de query optimisés

### ❌ Interdit
- Affirmer que la plateforme envoie déjà des déclarations aux portails officiels
- Mettre de la logique fiscale dans React / Server Actions / Controllers
- Ajouter une dépendance externe sans signaler coût, lock-in et complexité
- Inventer une règle fiscale (taux, plafond, seuil) sans source — mettre un TODO
- Utiliser `any`, exposer des stack traces, omettre le `tenantId`

---

## 10. Checklist avant tout PR

- [ ] `tenantId` présent dans toutes les queries Prisma du changement
- [ ] Aucun calcul fiscal dans Next.js ou un Controller NestJS
- [ ] Validation DTO avec Zod ou class-validator
- [ ] Aucun upload de fichier via Server Action (signed URL uniquement)
- [ ] Jobs Trigger.dev pour tout traitement asynchrone > 2s
- [ ] Typage strict — zéro `any`
- [ ] Migration Prisma créée si changement de schéma
- [ ] Tests unitaires sur la logique du tax-engine modifiée