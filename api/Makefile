# ========= Development ========= # 
run:
	go run ./cmd/web start

dev-build:
	docker compose -f compose.dev.yml -p puzzlely build api

dev-up:
	docker compose -f compose.dev.yml -p puzzlely up --build api

dev-run:
	docker compose -f compose.dev.yml -p puzzlely up api

dev-down:
	docker compose -p puzzlely down
