start_db:
	docker compose up -d

stop_db:
	docker compose down

migrate:
	db-migrate up

migrate-down:
	db-migrate down

create_migration:
	db-migrate create $(n) --sql-file

server:
	npm run dev

.PHONEY:start_db stop_db server migrate migrate-down create_migration