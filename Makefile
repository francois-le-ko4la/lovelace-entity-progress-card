.DEFAULT_GOAL := help

.PHONY: help install check lint lint-md format format-js format-js-check format-md \
        i18n-validate i18n-validate-structure i18n-sync \
        validate check-release-flags \
        build-test build-prod \
        release-dry-run clean

help: ## Show this help
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-24s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies (npm ci)
	npm ci

check: ## Syntax-check every src/ file (node --check)
	npm run check

lint: ## Lint the src/ module split (eslint)
	npm run lint

lint-md: ## Lint markdown files
	npm run lint:md

format: ## Reformat src/ JS and markdown in place (prettier)
	npm run format

format-js: ## Reformat src/ JS in place (prettier)
	npm run format:js

format-js-check: ## Check src/ JS formatting without writing (prettier --check)
	npm run format:js:check

format-md: ## Reformat markdown files in place (prettier)
	npm run format:md

i18n-validate: ## Validate translations/*.json against src/utils/translations.js
	npm run i18n:validate

i18n-validate-structure: ## Validate translations/*.json structure only (no JS sync needed)
	npm run i18n:validate:structure

i18n-sync: ## Regenerate src/utils/translations.js from translations/*.json
	npm run i18n:sync

check-release-flags: ## Fail if CARD_CONTEXT.dev/debug is left true in src/utils/parameters.js
	npm run check:release-flags

validate: check lint i18n-validate ## Run all pre-commit checks (check + lint + i18n:validate)

# --- Build ---------------------------------------------------------------
# src/ is bundled by scripts/build.js; mode controls CARD_CONTEXT:
#   test (default): dev:true, left exactly as committed
#   prod:           dev:false + all debug flags forced false
# dist/ is a gitignored build artifact dir - not committed, HACS never reads
# it directly, only the release asset scripts/build.js:prod produces (see
# .github/workflows/release.yaml).

build-test: ## Build dist/entity-progress-card_dev.js from src/
	npm run build:test

build-prod: ## Build dist/entity-progress-card.js from src/ (release build)
	npm run build:prod

release-dry-run: check-release-flags validate build-prod ## Mirror .github/workflows/release.yaml locally
	node --check dist/entity-progress-card.js
	@echo "✅ Release build OK: dist/entity-progress-card.js"

clean: ## Remove build output
	rm -rf dist
