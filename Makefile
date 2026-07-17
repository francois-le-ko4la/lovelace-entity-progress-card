.DEFAULT_GOAL := help

.PHONY: help install check lint lint-src lint-md format-md \
        i18n-validate i18n-validate-structure i18n-sync \
        validate check-release-flags \
        build-test build-prod build-src-test build-src-prod build-all \
        release-dry-run clean

help: ## Show this help
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-24s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies (npm ci)
	npm ci

check: ## Syntax-check entity-progress-card.js (node --check)
	npm run check

lint: ## Lint entity-progress-card.js (eslint)
	npm run lint

lint-src: ## Lint the src/ module split (not wired into validate/CI yet)
	npx eslint "src/**/*.js"

lint-md: ## Lint markdown files
	npm run lint:md

format-md: ## Reformat markdown files in place (prettier)
	npm run format:md

i18n-validate: ## Validate translations/*.json against entity-progress-card.js
	npm run i18n:validate

i18n-validate-structure: ## Validate translations/*.json structure only (no JS sync needed)
	npm run i18n:validate:structure

i18n-sync: ## Regenerate TRANSLATIONS in entity-progress-card.js and src/utils/translations.js
	npm run i18n:sync

check-release-flags: ## Fail if CARD_CONTEXT.dev/debug is left true in the committed source
	npm run check:release-flags

validate: check lint i18n-validate ## Run all pre-commit checks (check + lint + i18n:validate)

# --- Build ---------------------------------------------------------------
# Two independent axes:
#   pipeline: monolith (entity-progress-card.js) vs src/ (the module split)
#   mode:     test (dev:true, CARD_CONTEXT left exactly as committed)
#          vs prod (dev:false + all debug flags forced false)
# Both pipelines write to the same dist/ filenames by design (dist/ is a
# gitignored build artifact dir, meant for comparing the two pipelines'
# output, not for keeping every combination around at once):
#   dist/entity-progress-card.js     <- prod (either pipeline)
#   dist/entity-progress-card_dev.js <- test (either pipeline)

build-test: ## Build dist/entity-progress-card_dev.js from the monolith
	npm run build:test

build-prod: ## Build dist/entity-progress-card.js from the monolith (release build)
	npm run build:prod

build-src-test: ## Build dist/entity-progress-card_dev.js from src/
	npm run build:src:test

build-src-prod: ## Build dist/entity-progress-card.js from src/
	npm run build:src:prod

build-all: build-test build-prod build-src-test build-src-prod ## Run all four build variants (dist/ ends up with the last test + last prod output only)

release-dry-run: check-release-flags validate build-prod ## Mirror .github/workflows/release.yaml locally
	node --check dist/entity-progress-card.js
	@echo "✅ Release build OK: dist/entity-progress-card.js"

clean: ## Remove build output
	rm -rf dist
