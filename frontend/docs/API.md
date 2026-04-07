# DevDeploy API Documentation (Frontend Reference)

This document maps the backend endpoints used by the DevDeploy React frontend.

## Response Format
All successful API responses follow this standard JSON schema:
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... } or [ ... ],
  "count": optional_integer
}
```

## Endpoints

### Projects
- **GET `/projects`**
  - **Description**: Lists all projects owned by the user.
  - **Response Data**: Array of project objects.
  - **Fields**: `id`, `name`, `description`, `repo_url`, `branch`, `owner_id`.

### Deployments
- **GET `/deployments`**
  - **Description**: Lists all deployments across all projects.
  - **Response Data**: Array of deployment objects.
  - **Fields**: `id`, `project_id`, `version`, `status`, `url`, `created_at`.

- **GET `/projects/{id}/deployments`**
  - **Description**: Lists all deployments for a specific project.

### Health & Monitoring
- **GET `/health`**
  - **Description**: Checks system-wide backend health.
  - **Response Data**: `{"status": "healthy"}`
