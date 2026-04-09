# DevDeploy - DevOps Deployment Platform
![CI Status](https://github.com/Yaswanth9347/Devops/actions/workflows/ci.yml/badge.svg)

## Project Overview
DevDeploy is a powerful multi-service DevOps platform built to orchestrate and manage repository lifecycles and software deployments. It provides an elegant UI to review active deployments, logs, and environments.

## Tech Stack
- **Frontend** → React (Vite)
- **Backend** → FastAPI (Python)
- **Database** → PostgreSQL
- **Proxy** → Nginx
- **Containers** → Docker
- **Orchestration** → Docker Compose

## DevOps Features
- **Multi-Stage Builds:** The React frontend utilizes robust build steps culminating in lightweight Nginx distribution models.
- **Production Guard-Rails:** Database bindings, connection strings, and exposed ports are rigidly managed by isolated Docker networks removing direct host exposure.
- **Auto-Healing Orchestration:** All core microservices utilize `unless-stopped` restart policies alongside API footprint validation checks via curl heartbeats.
- **Reverse Proxy Routing:** Raw ingress connections are funneled through Nginx upstream rules.

## Setup Instructions
Ensure `docker` and `docker compose` are installed. Run the command manually or utilize the Makefile.

### Run Project
```bash
make deploy
```

### Stop Project
```bash
make stop
```

### Reset Project (Hard wipe)
```bash
make reset
```
