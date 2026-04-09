#!/bin/bash
echo "Starting DevDeploy Platform..."
docker compose down
docker compose up -d --build
echo "System running"
docker compose ps
