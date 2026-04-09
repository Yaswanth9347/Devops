# Command Reference

## Application Workflow
- **Deploy Cluster:** `make deploy` or `./scripts/deploy.sh`
- **Tear Down:** `make stop` or `./scripts/stop.sh`
- **Tail Logs:** `make logs` or `./scripts/logs.sh`
- **Cluster Hard Reset:** `make reset` or `./scripts/reset.sh`

## Common Docker Operations

### Verify Running State
```bash
docker compose ps
```

### Manual Service Restart
To specifically target and restart the backend without dropping the rest of the array:
```bash
docker compose restart backend
```

### Enter Running Container Shell
```bash
docker exec -it <container_name_or_id> /bin/bash
# or
docker exec -it <container_name_or_id> /bin/sh
```

## Troubleshooting
**Port 80 In Use:** If `docker compose up` crashes complaining about `0.0.0.0:80`, you have a native service installed on your Host OS (like an `apt` installation of Nginx or Apache).
Solution: `sudo systemctl stop nginx`

**Stale Dependency Build:** If you update a `requirements.txt` or `package.json` file but `make deploy` doesn't pick it up, run:
```bash
docker compose build --no-cache
docker compose up -d
```
