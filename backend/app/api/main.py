from fastapi import FastAPI, Depends, status
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db.database import engine, get_db
from app.models import models, schemas
from app.db import crud
from app.core import utils, auth
from app.services.cleanup_service import cleanup_deployment
from app.core.deployment_states import update_status
from app.services.health_service import check_service_health
from app.core.errors import DeploymentError
from app.workers.queue import deployment_queue
from app.workers.deployment_worker import process_deployment
from app.services.docker_service import stop_container, start_container, container_status, get_container_logs, container_details
from app.core.responses import success_response, error_response

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="DevDeploy Platform API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=engine)

@app.exception_handler(DeploymentError)
def deployment_error_handler(request, exc):
    return JSONResponse(
        status_code=400,
        content=error_response(exc.message, 400)
    )

@app.get("/")
def home():
    return success_response(message="DevDeploy API running")

@app.post("/register")
def register_user(
    user: schemas.UserCreate,
    db: Session = Depends(get_db)
):
    existing = crud.get_user_by_email(db, user.email)
    if existing:
        return JSONResponse(status_code=400, content=error_response("Email exists", 400))
    
    hashed = utils.hash_password(user.password)
    new_user = crud.create_user(db, user.email, hashed)
    user_data = {"id": new_user.id, "email": new_user.email}
    return success_response(user_data, "User registered successfully")

@app.post("/login")
def login(
    user: schemas.UserLogin,
    db: Session = Depends(get_db)
):
    db_user = crud.get_user_by_email(db, user.email)
    if not db_user:
        return JSONResponse(status_code=404, content=error_response("User not found", 404))
    
    if not utils.verify_password(user.password, db_user.password):
        return JSONResponse(status_code=401, content=error_response("Wrong password", 401))
    
    token = auth.create_token({"user_id": db_user.id})
    return success_response({"token": token}, "Login successful")

@app.post("/projects")
def create_project(
    project: schemas.ProjectCreate,
    user_id: int = Depends(auth.get_current_user_id_or_default),
    db: Session = Depends(get_db)
):
    new_project = crud.create_project(
        db,
        project.name,
        project.description,
        user_id
    )
    prj_data = {
        "id": new_project.id,
        "name": new_project.name,
        "description": new_project.description,
        "repo_url": new_project.repo_url,
        "branch": new_project.branch,
        "build_path": new_project.build_path,
        "owner_id": new_project.owner_id
    }
    return success_response(prj_data, "Project created successfully")

@app.get("/projects")
def list_projects(
    user_id: int = Depends(auth.get_current_user_id_or_default),
    db: Session = Depends(get_db)
):
    projects = crud.get_user_projects(db, user_id)
    prjs_data = [{
        "id": p.id,
        "name": p.name,
        "description": p.description,
        "repo_url": p.repo_url,
        "branch": p.branch,
        "build_path": p.build_path,
        "owner_id": p.owner_id
    } for p in projects]
    return success_response(prjs_data, "Projects listed successfully", len(projects))

@app.delete("/projects/{project_id}")
def delete_project(
    project_id: int,
    user_id: int = Depends(auth.get_current_user_id_or_default),
    db: Session = Depends(get_db)
):
    project = db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.owner_id == user_id
    ).first()

    if not project:
        return JSONResponse(status_code=404, content=error_response("Project not found", 404))

    deployments = crud.get_project_deployments(db, project_id)
    for deployment in deployments:
        cleanup_deployment(deployment)
        db.delete(deployment)

    db.delete(project)
    db.commit()
    return success_response(None, "Project deleted")

@app.put("/projects/{project_id}/source")
def update_source(
    project_id: int,
    data: schemas.ProjectSourceUpdate,
    user_id: int = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.owner_id == user_id
    ).first()
    
    if not project:
        return JSONResponse(status_code=404, content=error_response("Project not found", 404))
        
    updated = crud.update_project_source(
        db, project_id, data.repo_url, data.branch, data.build_path
    )
    prj_data = {
        "id": updated.id,
        "name": updated.name,
        "description": updated.description,
        "repo_url": updated.repo_url,
        "branch": updated.branch,
        "build_path": updated.build_path,
        "owner_id": updated.owner_id
    }
    return success_response(prj_data, "Project source updated")

@app.get("/projects/{project_id}/source")
def view_source(
    project_id: int,
    user_id: int = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.owner_id == user_id
    ).first()
    
    if not project:
        return JSONResponse(status_code=404, content=error_response("Project not found", 404))
        
    return success_response({
        "repo_url": project.repo_url,
        "branch": project.branch,
        "build_path": project.build_path
    }, "Source fetched successfully")

@app.post("/deployments")
def create_deployment(
    deployment: schemas.DeploymentCreate,
    user_id: int = Depends(auth.get_current_user_id_or_default),
    db: Session = Depends(get_db)
):
    project = db.query(models.Project).filter(
        models.Project.id == deployment.project_id,
        models.Project.owner_id == user_id
    ).first()
    
    if not project:
        return JSONResponse(status_code=404, content=error_response("Project not found", 404))
    
    deployment_record = crud.create_deployment(
        db,
        deployment.project_id,
        deployment.commit_hash,
        deployment.runtime,
        deployment.env_vars
    )
    
    deployment_queue.enqueue(
        process_deployment,
        deployment_record.id
    )

    dep_data = {
        "id": deployment_record.id,
        "project_id": deployment_record.project_id,
        "version": deployment_record.version,
        "status": deployment_record.status,
        "build_status": deployment_record.build_status,
        "runtime": deployment_record.runtime,
        "image_tag": deployment_record.image_tag,
        "container_id": deployment_record.container_id,
        "port": deployment_record.port,
        "url": deployment_record.url,
        "env_vars": deployment_record.env_vars,
        "created_at": deployment_record.created_at.isoformat(),
        "is_active": deployment_record.is_active
    }
    return success_response(dep_data, "Deployment created successfully")

@app.post("/deployments/{deployment_id}/redeploy")
def redeploy(
    deployment_id: int,
    user_id: int = Depends(auth.get_current_user_id_or_default),
    db: Session = Depends(get_db)
):
    old = crud.get_deployment(db, deployment_id)
    if not old:
        return JSONResponse(status_code=404, content=error_response("Deployment not found", 404))
        
    new = crud.create_deployment(
        db,
        old.project_id,
        old.commit_hash,
        old.runtime,
        old.env_vars
    )
    
    deployment_queue.enqueue(
        process_deployment,
        new.id
    )
    
    dep_data = {
        "id": new.id,
        "project_id": new.project_id,
        "version": new.version,
        "status": new.status,
        "build_status": new.build_status,
        "runtime": new.runtime,
        "image_tag": new.image_tag,
        "container_id": new.container_id,
        "port": new.port,
        "url": new.url,
        "env_vars": new.env_vars,
        "created_at": new.created_at.isoformat(),
        "is_active": new.is_active
    }
    return success_response(dep_data, "Redeployed successfully")

@app.get("/projects/{project_id}/deployments")
def list_deployments(
    project_id: int,
    user_id: int = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.owner_id == user_id
    ).first()
    
    if not project:
        return JSONResponse(status_code=404, content=error_response("Project not found", 404))
    
    deployments = crud.get_project_deployments(db, project_id)
    deps_data = []
    for d in deployments:
        deps_data.append({
            "id": d.id,
            "project_id": d.project_id,
            "version": d.version,
            "status": d.status,
            "build_status": d.build_status,
            "runtime": d.runtime,
            "image_tag": d.image_tag,
            "container_id": d.container_id,
            "port": d.port,
            "url": d.url,
            "env_vars": d.env_vars,
            "created_at": d.created_at.isoformat(),
            "is_active": d.is_active
        })
    return success_response(deps_data, "Deployments listed successfully", len(deps_data))

@app.get("/deployments")
def list_all_deployments(
    user_id: int = Depends(auth.get_current_user_id_or_default),
    db: Session = Depends(get_db)
):
    deployments = db.query(models.Deployment).join(models.Project).filter(
        models.Project.owner_id == user_id
    ).all()
    deps_data = []
    for d in deployments:
        deps_data.append({
            "id": d.id,
            "project_id": d.project_id,
            "version": d.version,
            "status": d.status,
            "build_status": d.build_status,
            "runtime": d.runtime,
            "image_tag": d.image_tag,
            "container_id": d.container_id,
            "port": d.port,
            "url": d.url,
            "env_vars": d.env_vars,
            "created_at": d.created_at.isoformat(),
            "is_active": d.is_active
        })
    return success_response(deps_data, "Global deployments listed successfully", len(deps_data))

@app.get("/projects/{project_id}/deployments/summary")
def project_macro_summary(
    project_id: int,
    user_id: int = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.owner_id == user_id
    ).first()
    
    if not project:
        return JSONResponse(status_code=404, content=error_response("Project not found", 404))

    deployments = crud.get_project_deployments(db, project_id)
    
    summary = []
    for d in deployments:
        summary.append({
            "id": d.id,
            "version": d.version,
            "status": d.status,
            "is_active": d.is_active,
            "url": d.url,
            "health_status": d.health_status
        })
        
    return success_response(summary, "Project summary generated")

@app.post("/deployments/{deployment_id}/stop")
def stop_deployment(
    deployment_id: int,
    user_id: int = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    deployment = crud.get_deployment(db, deployment_id)
    if not deployment:
        return JSONResponse(status_code=404, content=error_response("Deployment not found", 404))
    
    project = db.query(models.Project).filter(
        models.Project.id == deployment.project_id,
        models.Project.owner_id == user_id
    ).first()
    
    if not project:
        return JSONResponse(status_code=403, content=error_response("Not authorized", 403))

    if deployment.container_id:
        stop_container(deployment.container_id)
        
    update_status(deployment, "stopped")
    db.commit()
    return success_response(None, "Deployment stopped")

@app.post("/deployments/{deployment_id}/start")
def start_deployment(
    deployment_id: int,
    user_id: int = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    deployment = crud.get_deployment(db, deployment_id)
    if not deployment:
        return JSONResponse(status_code=404, content=error_response("Deployment not found", 404))

    project = db.query(models.Project).filter(
        models.Project.id == deployment.project_id,
        models.Project.owner_id == user_id
    ).first()
    
    if not project:
        return JSONResponse(status_code=403, content=error_response("Not authorized", 403))

    if deployment.container_id:
        try:
            start_container(deployment.container_id)
        except Exception as e:
            return JSONResponse(status_code=500, content=error_response(str(e), 500))
            
    update_status(deployment, "running")
    db.commit()
    return success_response(None, "Deployment started")

@app.get("/deployments/{deployment_id}/status")
def get_deployment_status(
    deployment_id: int,
    user_id: int = Depends(auth.get_current_user_id_or_default),
    db: Session = Depends(get_db)
):
    deployment = crud.get_deployment(db, deployment_id)
    if not deployment:
        return JSONResponse(status_code=404, content=error_response("Deployment not found", 404))

    project = db.query(models.Project).filter(
        models.Project.id == deployment.project_id,
        models.Project.owner_id == user_id
    ).first()
    
    if not project:
        return JSONResponse(status_code=403, content=error_response("Not authorized", 403))

    if deployment.container_id:
        status = container_status(deployment.container_id)
        if status != "not_found":
            update_status(deployment, status)
            db.commit()
            
    return success_response({"status": deployment.status}, "Status retrieved")

@app.get("/deployments/{deployment_id}/logs")
def deployment_logs(
    deployment_id: int,
    user_id: int = Depends(auth.get_current_user_id_or_default),
    db: Session = Depends(get_db)
):
    deployment = crud.get_deployment(db, deployment_id)
    if not deployment:
        return JSONResponse(status_code=404, content=error_response("Deployment not found", 404))

    project = db.query(models.Project).filter(
        models.Project.id == deployment.project_id,
        models.Project.owner_id == user_id
    ).first()
    
    if not project:
        return JSONResponse(status_code=403, content=error_response("Not authorized", 403))

    if not deployment.container_id:
        return success_response({"logs": "Container not initialized"}, "Logs retrieved")

    logs = get_container_logs(deployment.container_id)
    return success_response({"logs": logs}, "Logs retrieved")

@app.get("/deployments/{deployment_id}/build-logs")
def build_logs(
    deployment_id: int,
    user_id: int = Depends(auth.get_current_user_id_or_default),
    db: Session = Depends(get_db)
):
    deployment = crud.get_deployment(db, deployment_id)
    if not deployment:
        return JSONResponse(status_code=404, content=error_response("Deployment not found", 404))

    project = db.query(models.Project).filter(
        models.Project.id == deployment.project_id,
        models.Project.owner_id == user_id
    ).first()
    
    if not project:
        return JSONResponse(status_code=403, content=error_response("Not authorized", 403))

    return success_response({
        "build_status": deployment.build_status,
        "logs": deployment.build_logs
    }, "Build logs retrieved")

@app.get("/deployments/{deployment_id}/details")
def deployment_details(
    deployment_id: int,
    user_id: int = Depends(auth.get_current_user_id_or_default),
    db: Session = Depends(get_db)
):
    deployment = crud.get_deployment(db, deployment_id)
    if not deployment:
        return JSONResponse(status_code=404, content=error_response("Deployment not found", 404))

    project = db.query(models.Project).filter(
        models.Project.id == deployment.project_id,
        models.Project.owner_id == user_id
    ).first()
    
    if not project:
        return JSONResponse(status_code=403, content=error_response("Not authorized", 403))

    runtime_logs = "No container assigned"
    container_info = None

    if deployment.container_id:
        runtime_logs = get_container_logs(deployment.container_id)
        container_info = container_details(deployment.container_id)
        
        if container_info:
            update_status(deployment, container_info["status"])
            db.commit()

    return success_response({
        "id": deployment.id,
        "project_id": deployment.project_id,
        "version": deployment.version,
        "status": deployment.status,
        "build_status": deployment.build_status,
        "runtime": deployment.runtime,
        "image": deployment.image_tag,
        "url": deployment.url,
        "port": deployment.port,
        "is_active": deployment.is_active,
        "build_logs": deployment.build_logs,
        "runtime_logs": runtime_logs,
        "container": container_info,
        "health": deployment.health_status,
        "retry_count": deployment.retry_count,
        "max_retries": deployment.max_retries,
        "last_error": deployment.last_error
    }, "Deployment details fetched")

@app.get("/deployments/{deployment_id}/health")
def deployment_health(
    deployment_id: int,
    user_id: int = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    deployment = crud.get_deployment(db, deployment_id)
    if not deployment:
        return JSONResponse(status_code=404, content=error_response("Not found", 404))

    project = db.query(models.Project).filter(
        models.Project.id == deployment.project_id,
        models.Project.owner_id == user_id
    ).first()
    
    if not project:
        return JSONResponse(status_code=403, content=error_response("Not authorized", 403))

    if not deployment.url:
        return success_response({"health": "unknown"}, "Health check completed")

    health = check_service_health(deployment.url)
    deployment.health_status = health
    db.commit()

    return success_response({
        "health": health,
        "url": deployment.url
    }, "Health check completed")

@app.delete("/deployments/{deployment_id}")
def delete_deployment(
    deployment_id: int,
    user_id: int = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    deployment = crud.get_deployment(db, deployment_id)
    if not deployment:
        return JSONResponse(status_code=404, content=error_response("Deployment not found", 404))

    project = db.query(models.Project).filter(
        models.Project.id == deployment.project_id,
        models.Project.owner_id == user_id
    ).first()
    
    if not project:
        return JSONResponse(status_code=403, content=error_response("Not authorized", 403))

    cleanup_deployment(deployment)
    db.delete(deployment)
    db.commit()

    return success_response(None, "Deployment removed")

@app.post("/deployments/{deployment_id}/retry")
def retry_deployment(
    deployment_id: int,
    user_id: int = Depends(auth.get_current_user_id_or_default),
    db: Session = Depends(get_db)
):
    deployment = crud.get_deployment(db, deployment_id)
    if not deployment:
        return JSONResponse(status_code=404, content=error_response("Not found", 404))

    project = db.query(models.Project).filter(
        models.Project.id == deployment.project_id,
        models.Project.owner_id == user_id
    ).first()

    if not project:
        return JSONResponse(status_code=403, content=error_response("Not authorized", 403))

    if deployment.retry_count >= deployment.max_retries:
        return JSONResponse(status_code=429, content=error_response("Retry limit reached", 429))

    update_status(deployment, "pending")
    db.commit()

    deployment_queue.enqueue(process_deployment, deployment.id)

    return success_response({
        "retry": deployment.retry_count
    }, "Retry started")