.PHONY: help install dev seed test lint clean docker-up docker-down

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# --- Setup ---

install: ## Install all dependencies
	cd backend && pip install -r requirements.txt
	cd bot && pip install -r requirements.txt
	cd data && pip install -r requirements.txt
	cd frontend && npm install

# --- Development ---

dev-backend: ## Run backend in dev mode
	cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend: ## Run frontend in dev mode
	cd frontend && npm run dev

dev-bot: ## Run bot in polling mode
	cd bot && python -m bot.main

# --- Data ---

seed: ## Seed database for 2010 season
	cd data/scripts && python seed_all.py --year 2010

seed-reset: ## Reset and re-seed database
	cd data/scripts && python seed_all.py --year 2010 --reset

validate: ## Validate data integrity
	cd data/scripts && python validate_data.py --year 2010

# --- Testing ---

test: ## Run all tests
	cd backend && pytest tests/ -v
	cd bot && pytest tests/ -v

test-backend: ## Run backend tests only
	cd backend && pytest tests/ -v

test-bot: ## Run bot tests only
	cd bot && pytest tests/ -v

# --- Linting ---

lint: ## Run linters
	cd backend && ruff check .
	cd bot && ruff check .
	cd frontend && npm run lint

# --- Docker ---

docker-up: ## Start all services with Docker
	docker compose up -d --build

docker-down: ## Stop all Docker services
	docker compose down

docker-logs: ## View Docker logs
	docker compose logs -f

# --- Cleanup ---

clean: ## Remove caches and build artifacts
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .pytest_cache -exec rm -rf {} + 2>/dev/null || true
	rm -rf frontend/dist frontend/node_modules/.vite
