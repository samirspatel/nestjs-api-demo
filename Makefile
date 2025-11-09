.PHONY: help build up down restart logs shell db-shell seed clean rebuild test

# Default target
help:
	@echo "Available commands:"
	@echo "  make build       - Build Docker images"
	@echo "  make up          - Start all services"
	@echo "  make down        - Stop all services"
	@echo "  make restart     - Restart all services"
	@echo "  make logs        - View application logs"
	@echo "  make logs-follow - Follow application logs"
	@echo "  make shell       - Access app container shell"
	@echo "  make db-shell    - Access PostgreSQL shell"
	@echo "  make seed        - Seed the database with dummy data"
	@echo "  make clean       - Stop and remove containers, networks, volumes"
	@echo "  make rebuild     - Rebuild and restart all services"
	@echo "  make ps          - Show running containers"
	@echo "  make install     - Install npm dependencies locally"
	@echo "  make dev         - Start development server locally (requires local PostgreSQL)"

# Build Docker images
build:
	docker-compose build

# Start all services
up:
	docker-compose up -d --build
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "  Starting services with hot reload..."
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@( \
		sleep 3; \
		echo ""; \
		echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"; \
		echo "  BOOTSTRAP: Waiting for database..."; \
		echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"; \
		timeout=30; \
		while [ $$timeout -gt 0 ]; do \
			if docker-compose exec -T postgres pg_isready -U library_user > /dev/null 2>&1; then \
				echo "✓ Database is ready!"; \
				break; \
			fi; \
			sleep 1; \
			timeout=$$((timeout - 1)); \
		done; \
		if [ $$timeout -eq 0 ]; then \
			echo "✗ Error: Database did not become ready in time"; \
			exit 1; \
		fi; \
		echo "BOOTSTRAP: Waiting for app to create database schema..."; \
		timeout=30; \
		while [ $$timeout -gt 0 ]; do \
			if docker-compose exec -T postgres psql -U library_user -d library_db -c "SELECT 1 FROM information_schema.tables WHERE table_name='authors' LIMIT 1;" > /dev/null 2>&1; then \
				echo "✓ Database schema is ready!"; \
				break; \
			fi; \
			sleep 1; \
			timeout=$$((timeout - 1)); \
		done; \
		if [ $$timeout -eq 0 ]; then \
			echo "⚠ Warning: Schema may not be ready, but proceeding with seed..."; \
		fi; \
		echo "BOOTSTRAP: Seeding database..."; \
		docker-compose exec -T app npm run seed; \
		echo ""; \
		echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"; \
		echo "  ✓ System fully bootstrapped!"; \
		echo "  - Database: Ready"; \
		echo "  - Application: Running on http://localhost:3000"; \
		echo "  - API Docs: http://localhost:3000/api"; \
		echo "  - Hot reload: Enabled (watch mode active)"; \
		echo "  - Database seeded with sample data"; \
		echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"; \
		echo ""; \
	) &
	@echo "Tailing logs (Ctrl+C to stop)..."
	@echo ""
	@docker-compose logs -f --tail=50

# Start all services with logs
up-logs:
	docker-compose up

# Stop all services
down:
	docker-compose down

# Restart all services
restart:
	docker-compose restart

# View logs
logs:
	docker-compose logs app

# Follow logs
logs-follow:
	docker-compose logs -f app

# View all logs
logs-all:
	docker-compose logs

# Follow all logs
logs-all-follow:
	docker-compose logs -f

# Access app container shell
shell:
	docker-compose exec app sh

# Access PostgreSQL shell
db-shell:
	docker-compose exec postgres psql -U library_user -d library_db

# Seed the database
seed:
	docker-compose exec app npm run seed

# Clean everything (containers, volumes, networks)
clean:
	docker-compose down -v
	docker system prune -f

# Rebuild and restart
rebuild:
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d

# Show running containers
ps:
	docker-compose ps

# Install dependencies locally
install:
	npm install

# Start development server locally (requires local PostgreSQL)
dev:
	npm run start:dev

# Start development server with seed
dev-seed: seed dev

# Run tests
test:
	docker-compose exec app npm test

# Run linting
lint:
	docker-compose exec app npm run lint

# Format code
format:
	docker-compose exec app npm run format

# Build for production
build-prod:
	docker-compose build --no-cache

# Stop and remove only containers (keep volumes)
clean-containers:
	docker-compose down

# Show database status
db-status:
	docker-compose exec postgres pg_isready -U library_user

# Backup database
db-backup:
	docker-compose exec postgres pg_dump -U library_user library_db > backup_$(shell date +%Y%m%d_%H%M%S).sql

# Restore database from backup
db-restore:
	@echo "Usage: make db-restore FILE=backup.sql"
	@if [ -z "$(FILE)" ]; then echo "Error: FILE parameter required"; exit 1; fi
	docker-compose exec -T postgres psql -U library_user -d library_db < $(FILE)

