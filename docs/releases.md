# Releases & Versioning — Complya

> Versioning : [SemVer](https://semver.org/lang/fr/) — Commits : [Conventional Commits](https://www.conventionalcommits.org/fr/)

---

## Exemple concret : de la feature au tag de release

Scenario : tu implémentes l'export DUS pour Gabon Connect. Voici chaque commande,
dans l'ordre, de la création de branche jusqu'au tag en production.

### 1. Partir de main a jour

```bash
git checkout main
git pull
```

### 2. Créer la branche feature

Pas de convention stricte sur le nom de branche — sois explicite.

```bash
git checkout -b feat/dus-export
```

### 3. Développer, commiter au fil de l'eau

Chaque commit = une unité logique. Pas besoin que ce soit parfait,
l'important c'est le type et la description.

```bash
# Premier commit : le service de génération XML
git add apps/api/src/modules/filings/dus-export.service.ts
git commit -m "feat(filings): generate DUS XML from payroll data"

# Deuxième commit : l'endpoint
git add apps/api/src/modules/filings/filings.controller.ts
git commit -m "feat(filings): add POST /api/filings/dus/export endpoint"

# Troisième commit : un bug trouvé en cours de route
git add apps/api/src/modules/payroll/payroll.service.ts
git commit -m "fix(payroll): correct CNSS base calculation for part-time employees"

# Quatrième commit : tests
git add apps/api/src/modules/filings/dus-export.service.spec.ts
git commit -m "test(filings): add unit tests for DUS XML generation"
```

Si tu te trompes dans le message du dernier commit (pas encore pushé) :

```bash
git commit --amend -m "fix(payroll): correct CNSS base calculation for part-time employees"
```

### 4. Pousser la branche et ouvrir une PR

```bash
git push -u origin feat/dus-export
# Ouvrir la PR sur GitHub : base = main
```

La CI tourne automatiquement (type-check, lint, tests, docker build).
Ne pas merger si la CI est rouge.

### 5. Merger dans main (squash ou merge commit, au choix)

Une fois la PR approuvée et la CI verte :

```bash
# Option A : merge commit (conserve tous les commits individuels)
git checkout main
git merge --no-ff feat/dus-export
git push

# Option B : depuis GitHub, "Merge pull request" (merge commit)
# Option C : depuis GitHub, "Squash and merge" (un seul commit — ok si la branche est brouillon)
```

### 6. Vérifier ce que la release contiendra

```bash
make release-dry
```

Sortie attendue :

```
🚀 Let's release complya (0.1.0...0.2.0)

Changelog:
## 0.2.0 (2026-05-29)
### Nouvelles fonctionnalites
* feat(filings): generate DUS XML from payroll data
* feat(filings): add POST /api/filings/dus/export endpoint
### Corrections
* fix(payroll): correct CNSS base calculation for part-time employees
```

Le bump est `minor` car il y a au moins un `feat:`.
Si tu avais seulement des `fix:`, ce serait `0.1.1` (patch).

### 7. Lancer la release

```bash
git checkout main   # obligatoire — release-it refuse toute autre branche
git pull            # s'assurer d'être a jour
make release
```

Release-it va :

1. Confirmer la version proposée (appuyer Entrée pour accepter, ou taper une version custom)
2. Mettre à jour `package.json` à la racine + `apps/api/` + `apps/web/`
3. Écrire `CHANGELOG.md`
4. Créer le commit `chore(release): v0.2.0`
5. Créer le tag `v0.2.0`
6. Pusher commit + tag sur `main`

```
? Commit (chore(release): v0.2.0)? Yes
? Tag (v0.2.0)? Yes
? Push? Yes
```

### 8. Vérifier

```bash
git log --oneline -5
# chore(release): v0.2.0
# feat(filings): add POST /api/filings/dus/export endpoint
# feat(filings): generate DUS XML from payroll data
# fix(payroll): correct CNSS base calculation for part-time employees
# ...

git tag | sort -V | tail -3
# v0.2.0

cat CHANGELOG.md | head -20
# ## 0.2.0 (2026-05-29)
# ...
```

La version `v0.2.0` est maintenant visible dans la sidebar de l'app
après le prochain build Docker (`make dev` ou build de prod).

### Résumé des commandes dans l'ordre

```bash
git checkout main && git pull
git checkout -b feat/dus-export

# ... développement ...

git add <fichiers>
git commit -m "feat(filings): generate DUS XML from payroll data"
git commit -m "fix(payroll): correct CNSS base calculation"
git push -u origin feat/dus-export

# ... PR → review → merge dans main ...

git checkout main && git pull
make release-dry        # vérifier avant d'agir
make release            # bumper, tagger, pusher
```

---

## Principe en une phrase

**Chaque commit raconte une histoire. La somme des commits depuis la derniere release determine automatiquement la prochaine version.**

- `fix:` accumules → patch (0.1.0 → 0.1.1)
- Au moins un `feat:` → minor (0.1.0 → 0.2.0)
- Au moins un `feat!:` ou `BREAKING CHANGE` → major (0.1.0 → 1.0.0)

---

## Format des commits (obligatoire)

```
type(scope): description courte en imperatif

Corps optionnel (pourquoi, pas quoi).

BREAKING CHANGE: description si API/schema cassé
```

### Types reconnus

| Type              | Effet sur version | Quand l'utiliser                            |
| ----------------- | ----------------- | ------------------------------------------- |
| `feat`            | minor bump        | Nouvelle fonctionnalite visible utilisateur |
| `fix`             | patch bump        | Correction de bug                           |
| `feat!` ou `fix!` | major bump        | Breaking change (API, schema, auth)         |
| `perf`            | patch bump        | Amelioration de performance mesurable       |
| `refactor`        | aucun             | Refactoring interne sans changement visible |
| `chore`           | aucun             | Deps, config, Makefile, Docker              |
| `docs`            | aucun             | Documentation uniquement                    |
| `test`            | aucun             | Ajout ou correction de tests                |
| `ci`              | aucun             | CI/CD, GitHub Actions                       |
| `build`           | aucun             | Build system, Dockerfile                    |
| `style`           | aucun             | Formatage, lint (zero logique)              |
| `revert`          | selon revert      | Annulation d'un commit                      |

### Exemples

```bash
# Bonne pratique
git commit -m "feat(auth): add Google OAuth via Clerk"
git commit -m "fix(organization): correct tenantId filter on paginated list"
git commit -m "feat(payroll): implement DUS export for Gabon Connect"
git commit -m "chore(deps): bump @nestjs/* to 11.1.0"
git commit -m "perf(storage): cache signed URL generation"

# Breaking change → major bump
git commit -m "feat!: rename /api/tenants to /api/organizations"
# ou avec corps :
git commit -m "feat(api): restructure organization endpoints

BREAKING CHANGE: /api/tenants/* renomme en /api/organizations/*
Mettre a jour le SDK client avant de deployer."

# Multi-scope
git commit -m "feat(payroll,filings): generate DUS XML from payroll data"
```

### Ce qui est refuse par le hook

```bash
git commit -m "fix bug"         # pas de type ni description
git commit -m "WIP"             # invalide
git commit -m "update stuff"    # invalide
git commit -m "feat: "          # description vide
```

---

## Workflow de release

### Prerequis

- Etre sur la branche `main` (release-it le verifie)
- Working directory propre (`git status` = rien)
- `pnpm install` a jour

### Cas standard : release automatique

```bash
# 1. Verifier que tous les commits sont bien formates
git log --oneline origin/main..HEAD

# 2. Voir ce que la prochaine release contiendra (dry run)
make release-dry

# 3. Lancer la release
make release
```

Release-it va :

1. Analyser les commits depuis le dernier tag
2. Determiner le type de bump (patch / minor / major)
3. Proposer la nouvelle version — confirmer ou modifier
4. Mettre a jour `package.json` a la racine + `apps/api/` + `apps/web/`
5. Generer / mettre a jour `CHANGELOG.md`
6. Creer le commit `chore(release): vX.Y.Z`
7. Creer le tag git `vX.Y.Z`
8. Pusher le commit et le tag sur `main`

### Forcer un type de bump

```bash
make release-minor   # → 0.1.x devient 0.2.0 (nouvelle feature sans breaking)
make release-major   # → 0.x.y devient 1.0.0 (breaking change)
```

### Dry run (simulation sans commit ni tag)

```bash
make release-dry
```

Affiche ce qui se passerait : version proposee, contenu du CHANGELOG, sans rien modifier.

---

## Workflow hotfix

Pour un bug critique en production :

```bash
# 1. Creer une branche hotfix depuis le tag de production
git checkout -b hotfix/v0.1.1 v0.1.0

# 2. Corriger, commiter
git commit -m "fix(auth): correct session expiry on Fastify adapter"

# 3. Merger dans main
git checkout main
git merge --no-ff hotfix/v0.1.1

# 4. Releaser
make release     # detecte le fix:, propose 0.1.1

# 5. Supprimer la branche
git branch -d hotfix/v0.1.1
```

---

## Version dans l'application

La version est injectee **a la compilation** depuis `apps/web/package.json` :

- `next.config.mjs` expose `process.env.NEXT_PUBLIC_APP_VERSION`
- Affichee dans la sidebar (bas gauche, mode expande)
- Disponible dans tout composant React : `process.env.NEXT_PUBLIC_APP_VERSION`

```tsx
// Exemple dans n'importe quel composant
<span>v{process.env.NEXT_PUBLIC_APP_VERSION}</span>
```

Pour l'API NestJS, `process.env.npm_package_version` est defini par pnpm au demarrage
et correspond a la version de `apps/api/package.json` — synchronisee par le hook release-it.

```typescript
// Dans main.ts ou un service
const version = process.env["npm_package_version"] ?? "dev";
```

---

## Structure des tags

```
v0.1.0   — release initiale
v0.1.1   — patch (bugfix)
v0.2.0   — minor (nouvelle feature)
v1.0.0   — major (breaking change ou milestone produit)
```

Les tags sont pushes sur le remote. Le CI peut s'en servir pour declencher
un deploiement automatique (sur `v*`).

---

## CHANGELOG

Genere et mis a jour automatiquement dans `CHANGELOG.md` a la racine.
Seuls `feat`, `fix`, `perf` et `refactor` apparaissent.
Les `chore`, `docs`, `test`, `ci` sont caches (bruit inutile pour les utilisateurs).

---

## Commandes de reference

```bash
make release-dry    # simuler (aucun effet)
make release        # release auto depuis les commits
make release-minor  # forcer minor
make release-major  # forcer major

# Equivalents pnpm directs
pnpm release:dry
pnpm release
pnpm release:minor
pnpm release:major
pnpm release:patch  # forcer patch explicitement
```

---

## FAQ

**Q : J'ai oublie de suivre la convention sur quelques commits. Que faire ?**

Amender ou rebase avant de merger sur main. Une fois sur main, ne pas rebase —
creer un commit de correction : `fix(scope): correct X following bad merge`.

**Q : Quand passer de 0.x a 1.0 ?**

Quand le produit est en production stable avec des clients reels. La version 0.x
signifie "API interne instable, breaking changes possibles". La 1.0 engage
une stabilite d'API.

**Q : Puis-je releaser depuis une autre branche que main ?**

Non — `.release-it.json` impose `requireBranch: "main"`. C'est voulu :
seul ce qui est merge et valide en CI part en production.
