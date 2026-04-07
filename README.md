# DevDeploy
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white) ![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi) ![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white) ![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)

**Self-Hosted Developer Deployment Platform**

## Project Status
**Current stage**: Backend platform engineering complete. Architecture decoupling finalized. Frontend dashboard is actively planned. 

---

## 🚀 Project Overview

DevDeploy is a self-hosted Platform-as-a-Service (PaaS) prototype that allows developers to deploy their applications seamlessly using Docker-based CI/CD workflows.

The platform heavily automates:
- Application source fetching (Git integrations)
- Docker image runtime compilation
- Sandboxed container deployment orchestration
- Open port assignment routing
- Application monitoring and logs
- Deep deployment lifecycle management

This platform was engineered strictly to prototype and demonstrate highly technical real-world DevOps orchestration and platform engineering concepts.

## 💡 Project Motivation

Most standard student or portfolio projects heavily focus on standard REST APIs mapped to simple CRUD applications. This project deliberately isolates **infrastructure engineering** and **deployment automation** to reflect massively scalable industry engineering practices.

The goal of building this was to natively learn and implement:
- Hardened DevOps operational workflows
- Safe CI/CD mapping designs 
- OS-level Container orchestration
- Strongly decoupled Backend domain architecture
- Deep Infrastructure reliability and zero-downtime execution

## ✨ Features 

- **Enterprise User authentication** mapped internally over JWT barriers.
- **Project management paths** enabling isolation across engineering bases.
- **Deployment pipelines** structurally automating manual clone sequences.
- **Docker-based builds** creating native OS isolation targets dynamically.
- **Deployment versioning** accurately tagging history matrices.
- **Robust Retry system** actively recovering dropped deployment networks.
- **Live Build Logs** systematically tracked and retained over operations.
- **Runtime container monitoring** reliably reporting internal OS states.
- **Native Health monitoring hooks** validating container success loops.
- **Zero-downtime Infrastructure cleanup** avoiding disk or dangling thread bloat.
- **FastAPI Standardization wrappers** operating like mass enterprise systems.
- **Automated testing** securely asserting system bounds dynamically.

## 🛠 Tech Stack

**Backend**:
- FastAPI (High performance routing)
- Python 3+

**Database**:
- PostgreSQL (ACID relational mapping)
- SQLAlchemy (ORM layer)

**Infrastructure**:
- Docker Engine SDK (Internal sandboxing orchestration)
- Redis Cache (Job queue execution routing)
- NGINX (Planned HTTP reverse routing matrix)

**Monitoring**:
- Built-in App Health checks
- Structured Data Loggers

**Quality Assurance**:
- Pytest integration suite

## 🏢 Architecture Overview

DevDeploy strictly follows a heavy Domain-Driven layered backend architecture to separate concerns actively:

1. **API Layer**: Route interceptions and data wrappers.
2. **Service Layer**: Bash bindings decoupled into pure functions.
3. **Worker Layer**: Heavy RQ Supervisor orchestrations securely. 
4. **Infrastructure Layer**: Direct Daemon level executions natively.
5. **Database Layer**: SQLAlchemy mapping targets.

For detailed macro architectures, data flows, and layer assignments, view our [ARCHITECTURE.md](ARCHITECTURE.md).

## 🔄 Deployment Pipeline

Our platform executes serially over strict State Machine boundaries:

1. **Pending**
2. **Cloning repository**
3. **Building Docker image**
4. **Deploying container**
5. **Running application**
6. **Health Verification loop**
7. **Production Monitoring**

If any stage fundamentally breaks, the state machine smoothly transitions the target correctly back into a **Failed** assignment, allowing secure manual retries seamlessly. 

## ⚙️ Setup Instructions
*(Assuming Python, Docker Engine, PostgreSQL, and Redis-Server are installed locally)*

**1. Clone repository:**
```bash
git clone <your-repo>
cd DevDeploy/backend
```

**2. Setup Virtual Environment & Install Dependencies:**
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**3. Configure `.env` Environment:**
Ensure PostgreSQL mappings and Redis ports are initialized securely in `backend/.env`.

**4. Start Subsystems (Redis & Postgres):**
```bash
sudo service postgresql start
sudo service redis-server start
```

**5. Start Worker Process (Terminal 1):**
```bash
sudo venv/bin/rq worker deployments
```

**6. Start Backend API Router (Terminal 2):**
```bash
uvicorn app.api.main:app --reload --port 8001
```

**7. Access Swagger API Interactive Docs:**
```text
http://127.0.0.1:8001/docs
```

## 📁 Project Structure

```text
backend/
├── app/
│   ├── api/       → API endpoints and Routers 
│   ├── core/      → Configurations, Logging, Handlers
│   ├── services/  → OS-level platform abstractions 
│   ├── workers/   → Redis background thread executors 
│   ├── db/        # Database Layer interactions
│   └── models/    # Domain schema declarations 
├── tests/         → Automated Pytest configurations
└── storage/       → Target internal repo clone space
```

## 🎓 Learning Outcomes

Executing this architectural undertaking drastically mapped my skills natively over the following technical capabilities:

- **CI/CD Pipeline Design**: Understanding natively how to isolate operations safely.
- **Docker-based Executions**: Calling OS-level sandboxes safely out of Python API loops. 
- **Background Worker Architecture**: Routing latency processes correctly down onto external cache layers.
- **Deployment Lifecycle Mapping**: Maintaining strictly decoupled State Machine matrices efficiently.
- **Platform Reliability Engineering**: Structuring data logs defensively catching deep bash execution failures naturally.
- **Backend Service Decoupling**: Structuring domains correctly over standard Service formats strictly without monolithic coupling natively.
- **Infrastructure Automation**: Running deterministic configurations natively over remote code pushes robustly dynamically.

## 🔭 Future Improvements

While the baseline orchestrator completely excels, future scale targets include seamlessly:

- **Frontend Dashboard GUI**
- **Deep Metrics monitoring graphics**
- **Automated SSL Certificate assignments**
- **Custom domains routing maps**
- **Multi-node deployment load scaling**
- **External target CI hooks natively tracking commit websockets**
