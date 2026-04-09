#!/bin/bash
echo "Resetting DevDeploy Platform..."
docker compose down -v
docker system prune -f
docker compose up -d --build
echo "Reset complete"
