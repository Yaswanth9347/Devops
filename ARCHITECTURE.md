# DevDeploy Architecture

## 1. Project Overview
DevDeploy is a self-hosted developer deployment platform that allows users to deploy applications using Docker-based CI/CD workflows.

The platform provides:
- User management
- Project management
- Deployment pipelines
- Container orchestration
- Deployment monitoring
- Infrastructure cleanup
- Health monitoring

The system strictly follows a heavily modular backend architecture.

## 2. High Level Architecture
DevDeploy architecture contains five major layers:

**API Layer:**
Handles HTTP requests, mapping payload inputs into unified standardized response structures.

**Service Layer:**
Contains business and execution logic. Bridges Python logic directly with underlying system tools.

**Worker Layer:**
Handles background deployments over Redis, offloading intensive Git and Docker operations away from the HTTP main loop.

**Infrastructure Layer:**
Manages Docker daemon controls natively, orchestrating containers and capturing system streams dynamically.

**Database Layer:**
Stores all platform operational metadata natively in PostgreSQL.

## 3. Deployment Flow
The platform fundamentally relies on the following operational orchestration flow:

1. User creates a deployment using the API
2. Deployment immediately enters `pending` state
3. Background Worker safely picks up the deployment task
4. Worker clones the correct branch from the source repository
5. Worker verifies instructions and builds the Docker image locally
6. Worker assigns an open container execution port
7. Worker spins up the container and runs the environment reliably
8. Worker actively captures build logs gracefully
9. Worker transitions final status matrix towards `running`
10. Health monitoring system continues to verify container uptime

## 4. CI/CD Pipeline Description
The State Machine is heavily restricted across the following immutable boundaries:

**Official Pipeline Stages:**
- `pending`
- `cloning`
- `building`
- `deploying`
- `running`
- `failed`
- `stopped`

State transitions are exclusively controlled natively by the internal deployment state machine mechanisms mapped safely over the worker infrastructure.

## 5. Component Responsibilities
Platform services represent highly modular functional programming designs:

**Git Service:**
Handles entire repository branch cloning configurations natively off network payloads.

**Docker Service:**
Directly interfaces with the local system handling container orchestration lifecycles.

**Build Service:**
Creates natively built isolation layers cleanly over user repositories securely.

**Health Service:**
Runs runtime validation checking application internal hooks correctly on container instances.

**Cleanup Service:**
Handles garbage collections of failed container images and stopped resources safely out of the disk footprint.

## 6. Folder Structure Documentation
The project fundamentally organizes operations inside the following architectural bounds:

```
DevDeploy/
├── backend/
│   ├── app/
│   │   ├── api/          # Contains FastAPI routes and routing maps
│   │   ├── core/         # Core application configurations, errors, and loggers
│   │   ├── db/           # Models, Schemas, and CRUD database execution queries
│   │   ├── models/       # Represents Python SQL tables and Pydantic validators
│   │   ├── services/     # Decoupled platform service infrastructure abstractions
│   │   ├── workers/      # Strict deployment supervisor queues isolated natively
│   ├── tests/            # Automated automated Python integration tests mappings
│   ├── storage/          # System location for mapping repository cloning targets safely
│   ├── .env              # Secrets and runtime architecture variables natively 
```

## 7. API Request Flow

The backend fundamentally tracks data over the following safe paths natively:

1. Client request initiated
2. API Auth Validation (JWT mapping successfully decoded)
3. API endpoints pass parameters reliably to Service/Database logic
4. Database successfully captures task context natively representing transactions 
5. Worker execution heavily pushed inside queue schemas natively 
6. Response mapping seamlessly structured natively over robust wrappers!
7. Final Response returned exactly over specific standard schemas safely!

## 8. Deployment Lifecycle 

The exact path a successful repository payload reliably triggers:

**Golden Flow:**
`pending` → `cloning` → `building` → `deploying` → `running`

**Failure Path Exits:**
`building` → `failed`
`failed` → `retry` → `pending`

## 9. System Capabilities
The current backend supports incredible features cleanly natively representing massive scale engineering tasks:

- Docker based deployment
- Source cloning securely across branches 
- Natively constructed Image building mapping
- Granular Container management mechanics 
- Deployment versioning seamlessly orchestrating history
- API-driven Retry system natively safely capturing crash loops!
- Active Build logs stream dumping directly across operations accurately
- Health monitoring hooks natively returning service metrics!
- Robust automated Infrastructure cleanup reliably mitigating storage issues
- API enterprise schema standardization successfully 

## 10. Design Decisions
To map this cleanly natively, major architecture decisions actively define our stack gracefully:

- **Docker:** Utilized for reliable application isolation avoiding cross-dependency bleeding!
- **FastAPI:** Massively optimized natively scaling Python payload REST streams smoothly!
- **Redis Queues:** Unlocks completely decoupled task handling directly offloading latency seamlessly! 
- **PostgreSQL:** Standard relational metadata mapping flawlessly executing complex CI/CD relations securely!
- **Nginx:** Explicit proxy mechanisms seamlessly pushing request traffic cleanly into environments gracefully!
