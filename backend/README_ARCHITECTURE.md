# DevDeploy Architecture

The backend of `DevDeploy` strictly enforces a modular **Clean Architecture**. This dramatically separates the REST API routes from the background execution infrastructure, allowing horizontal execution layers across standard enterprise scale.

## Layer Summary

### `1. app/api/` (Presentation & Routing)
- Contains ONLY the primary FastApi router mappings (`main.py`).
- Routes receive input, invoke CRUD operations, and offload business logic down to Core functions or Background workers.

### `2. app/core/` (Configuration & Utilities)
- Maintains cross-cutting singletons: Application Settings (`settings.py`), Auth mechanisms (`auth.py`), logging setups (`logger.py`), and error boundaries (`errors.py`).

### `3. app/models/` (Data Schemas)
- Dictates exact Database representations via SQLAlchemy (`models.py`) and standard JSON serialization pipelines over Pydantic (`schemas.py`).

### `4. app/db/` (Persistence Layer)
- Configures exactly how the API communicates with PostgreSQL (`database.py`) and parses the Python `crud.py` objects natively out of active sessions.

### `5. app/services/` (Infrastructure Logic)
- The workhorse directory. Connects directly to external system execution interfaces. Docker Daemon integration (`docker_service`, `build_service`), local repository mapping (`git_service`), and Proxy interactions (`nginx_service`).
- Keeps subprocess bash executions isolated away from standard Python objects.

### `6. app/workers/` (Asynchronous Task Processors)
- Holds RQ (Redis Queue) pipelines and Background Thread workers (`deployment_worker.py`). Offloads heavy container building away from active HTTP polling loops.
