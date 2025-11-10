.PHONY: up down logs

# Start all services (builds images, starts services, seeds database)
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

# Stop all services and clean up (removes containers, networks, and volumes)
down:
	docker-compose down -v

# View application logs
logs:
	docker-compose logs -f app

