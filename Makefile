setup:
	docker compose build

deploy:
	./scripts/deploy.sh

stop:
	./scripts/stop.sh

restart:
	docker compose restart

logs:
	./scripts/logs.sh

reset:
	./scripts/reset.sh
