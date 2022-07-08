# ========= Development ========= # 
.PHONY: run
run:
	go run ./cmd start

.PHONY: compose-build
compose-build:
	docker-compose -p puzzlely build dev

.PHONY: compose-up
compose-up:
	docker-compose -p puzzlely up --build dev

.PHONE: compose-run
compose-run:
	docker-compose -p puzzlely up dev

.PHONY: compose-down
compose-down:
	docker-compose -p puzzlely down