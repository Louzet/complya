.PHONY: help \
        setup \
        dev up stop restart logs logs-api logs-web \
        migrate migrate-docker migrate-dev seed reset studio \
        test test-watch type-check lint check \
        docker-ps bash-api bash-web docker-reset \
        build clean r2-console trigger-dev \
        release release-minor release-major release-dry

# ─── Couleurs ─────────────────────────────────────────────────────────────────
GREEN  := \033[0;32m
YELLOW := \033[1;33m
CYAN   := \033[0;36m
NC     := \033[0m

# ─── Aide ─────────────────────────────────────────────────────────────────────

help: ## Affiche cette aide
	@echo ""
	@echo "$(CYAN)Complya — Commandes disponibles$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
	  awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-22s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "  $(YELLOW)Docs$(NC) → docs/dev-workflow.md"
	@echo ""

# ─── Onboarding ───────────────────────────────────────────────────────────────

setup: ## Onboarding nouveau dev — prérequis + .env + pnpm install
	@bash infrastructure/scripts/setup.sh

# ─── Développement ────────────────────────────────────────────────────────────

dev: ## Lance l'env complet Docker + migrations + logs (entrée principale)
	@bash infrastructure/scripts/dev-start.sh

up: ## Redémarre les services sans rebuild (rapide si images déjà présentes)
	@bash infrastructure/scripts/dev-start.sh --no-build

dev-local: ## Lance API + Web localement SANS Docker (Neon ou Postgres local requis)
	@echo "$(YELLOW)Mode local — NODE_ENV=development (hors Docker)$(NC)"
	pnpm turbo dev

stop: ## Arrête tous les services Docker
	docker compose stop

restart: ## Redémarre un service avec volumes frais (ex: make restart SVC=api)
	@[ -n "$(SVC)" ] || (echo "$(YELLOW)Usage: make restart SVC=api$(NC)" && exit 1)
	docker compose stop $(SVC)
	docker compose rm -f $(SVC)
	docker compose up -d -V $(SVC)

# ─── Logs ─────────────────────────────────────────────────────────────────────

logs: ## Logs en live de tous les services (Ctrl+C pour quitter)
	@mkdir -p .logs/api .logs/web
	@LOG_DATE=$$(date +%Y-%m-%d) && \
	  docker compose logs --no-color -f api 2>&1 | tee -a ".logs/api/$$LOG_DATE.log" & \
	  docker compose logs --no-color -f web 2>&1 | tee -a ".logs/web/$$LOG_DATE.log" & \
	  docker compose logs -f

logs-api: ## Logs NestJS uniquement
	docker compose logs -f api

logs-web: ## Logs Next.js uniquement
	docker compose logs -f web

# ─── Base de données ──────────────────────────────────────────────────────────

migrate: ## Applique les migrations (hors Docker — DATABASE_URL_UNPOOLED requis)
	@bash infrastructure/scripts/migrate.sh

migrate-docker: ## Crée + applique une migration Prisma dans Docker (recommandé)
	@[ -n "$(NAME)" ] || (echo "$(YELLOW)Usage: make migrate-docker NAME=a02-users$(NC)" && exit 1)
	docker compose run --rm -e DATABASE_URL=postgresql://postgres:postgres@postgres:5432/complya \
	  -e DATABASE_URL_UNPOOLED=postgresql://postgres:postgres@postgres:5432/complya \
	  api sh -c "cd /app/apps/api && pnpm exec prisma migrate dev --name $(NAME)"

seed: ## Exécute le seed de développement (interdit en production)
	@bash infrastructure/scripts/seed.sh

reset: ## Reset DB + remigre + reseed (DEV UNIQUEMENT — irréversible)
	@[ "$(NODE_ENV)" != "production" ] || \
	  (echo "$(YELLOW)REFUSÉ : reset interdit en production$(NC)" && exit 1)
	@echo "$(YELLOW)Reset base de données (dev)...$(NC)"
	docker compose run --rm -e DATABASE_URL=postgresql://postgres:postgres@postgres:5432/complya \
	  api sh -c "cd /app/apps/api && pnpm exec prisma migrate reset --force"
	@bash infrastructure/scripts/seed.sh

studio: ## Ouvre Prisma Studio — connexion directe localhost:5433 (hors Docker)
	cd apps/api && pnpm exec prisma studio

# ─── Tests & qualité ──────────────────────────────────────────────────────────

test: ## Lance tous les tests unitaires
	pnpm turbo test

test-watch: ## Tests en mode watch (API uniquement)
	pnpm --filter api run test:watch

type-check: ## Vérifie le typage TypeScript strict
	pnpm turbo type-check

lint: ## Lint + auto-fix sur tous les packages
	pnpm turbo lint

check: type-check lint ## type-check + lint (à lancer avant chaque commit)

# ─── Docker ───────────────────────────────────────────────────────────────────

docker-ps: ## Liste les containers et leur statut (up/down/unhealthy)
	docker compose ps -a

bash-api: ## Ouvre un bash dans le container API (NestJS)
	docker compose exec api sh

bash-web: ## Ouvre un bash dans le container Web (Next.js)
	docker compose exec web sh

docker-reset: ## Arrête + supprime volumes Docker (reset complet — irréversible)
	@echo "$(YELLOW)Suppression des volumes Docker...$(NC)"
	docker compose down -v

# ─── Services locaux ──────────────────────────────────────────────────────────

r2-console: ## Ouvre la console MinIO (R2 local) dans le navigateur
	@xdg-open http://localhost:9001 2>/dev/null || open http://localhost:9001 2>/dev/null || \
	  echo "Ouvrir : http://localhost:9001  (minioadmin / minioadmin)"

trigger-dev: ## Lance le runner Trigger.dev en local (jobs sans cloud)
	pnpm --filter api run trigger:dev

# ─── Releases & versioning ────────────────────────────────────────────────────

release: ## Release auto (patch/minor/major selon commits) — depuis main uniquement
	@git diff --quiet || (echo "$(RED)Working directory non clean. Commit ou stash avant de releaser.$(NC)" && exit 1)
	pnpm release

release-minor: ## Forcer un minor release (nouvelle feature sans breaking change)
	@git diff --quiet || (echo "$(RED)Working directory non clean.$(NC)" && exit 1)
	pnpm release:minor

release-major: ## Forcer un major release (breaking changes)
	@git diff --quiet || (echo "$(RED)Working directory non clean.$(NC)" && exit 1)
	pnpm release:major

release-dry: ## Simuler la release sans créer tag/commit (dry run)
	pnpm release:dry

# ─── Build & nettoyage ────────────────────────────────────────────────────────

build: ## Build de production pour tous les packages
	pnpm turbo build

clean: ## Supprime node_modules et artefacts de build
	@echo "$(YELLOW)Nettoyage...$(NC)"
	pnpm turbo clean
	find . -name 'node_modules' -type d -prune -exec rm -rf '{}' + 2>/dev/null || true
	@echo "$(GREEN)Nettoyage terminé$(NC)"
