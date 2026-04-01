from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from .database import engine, Base, get_db
from . import models, schemas, crud, utils, auth
from .workers.queue import deployment_queue
from .workers.deployment_worker import process_deployment
from .docker_manager import stop_container, start_container, container_status, get_container_logs

app = FastAPI()

Base.metadata.create_all(bind=engine)

@app.get("/")
def home():
    return {"message": "DevDeploy API running"}

@app.post("/register", response_model=schemas.UserResponse)
def register_user(
    user: schemas.UserCreate,
    db: Session = Depends(get_db)
):
    existing = crud.get_user_by_email(db, user.email)
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email exists"
        )
    
    hashed = utils.hash_password(user.password)
    new_user = crud.create_user(db, user.email, hashed)
    return new_user

@app.post("/login")
def login(
    user: schemas.UserLogin,
    db: Session = Depends(get_db)
):
    db_user = crud.get_user_by_email(db, user.email)
    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    if not utils.verify_password(user.password, db_user.password):
        raise HTTPException(
            status_code=401,
            detail="Wrong password"
        )
    
    token = auth.create_token({"user_id": db_user.id})
    return {"token": token}

@app.post("/projects", response_model=schemas.ProjectResponse)
def create_project(
    project: schemas.ProjectCreate,
    user_id: int = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    new_project = crud.create_project(
        db,
        project.name,
        project.description,
        user_id
    )
    return new_project

@app.get("/projects", response_model=list[schemas.ProjectResponse])
def list_projects(
    user_id: int = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    return crud.get_user_projects(db, user_id)

@app.put("/projects/{project_id}/source", response_model=schemas.ProjectResponse)
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
        raise HTTPException(status_code=404, detail="Project not found")
        
    return crud.update_project_source(
        db, project_id, data.repo_url, data.branch, data.build_path
    )

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
        raise HTTPException(status_code=404, detail="Project not found")
        
    return {
        "repo_url": project.repo_url,
        "branch": project.branch,
        "build_path": project.build_path
    }

@app.post("/deployments", response_model=schemas.DeploymentResponse)
def create_deployment(
    deployment: schemas.DeploymentCreate,
    user_id: int = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(models.Project).filter(
        models.Project.id == deployment.project_id,
        models.Project.owner_id == user_id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )
    
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

    return deployment_record

@app.post("/deployments/{deployment_id}/redeploy", response_model=schemas.DeploymentResponse)
def redeploy(
    deployment_id: int,
    user_id: int = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    old = crud.get_deployment(db, deployment_id)
    if not old:
        raise HTTPException(status_code=404, detail="Deployment not found")
        
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
    
    return new

@app.get("/projects/{project_id}/deployments", response_model=list[schemas.DeploymentResponse])
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
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )
    
    return crud.get_project_deployments(
        db,
        project_id
    )

@app.post("/deployments/{deployment_id}/stop")
def stop_deployment(
    deployment_id: int,
    user_id: int = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    deployment = crud.get_deployment(db, deployment_id)
    if not deployment:
        raise HTTPException(status_code=404, detail="Deployment not found")
    
    project = db.query(models.Project).filter(
        models.Project.id == deployment.project_id,
        models.Project.owner_id == user_id
    ).first()
    
    if not project:
        raise HTTPException(status_code=403, detail="Not authorized")

    if deployment.container_id:
        stop_container(deployment.container_id)
        
    deployment.status = "stopped"
    db.commit()
    return {"message": "Deployment stopped"}

@app.post("/deployments/{deployment_id}/start")
def start_deployment(
    deployment_id: int,
    user_id: int = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    deployment = crud.get_deployment(db, deployment_id)
    if not deployment:
        raise HTTPException(status_code=404, detail="Deployment not found")

    project = db.query(models.Project).filter(
        models.Project.id == deployment.project_id,
        models.Project.owner_id == user_id
    ).first()
    
    if not project:
        raise HTTPException(status_code=403, detail="Not authorized")

    if deployment.container_id:
        try:
            start_container(deployment.container_id)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
            
    deployment.status = "running"
    db.commit()
    return {"message": "Deployment started"}

@app.get("/deployments/{deployment_id}/status")
def get_deployment_status(
    deployment_id: int,
    user_id: int = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    deployment = crud.get_deployment(db, deployment_id)
    if not deployment:
        raise HTTPException(status_code=404, detail="Deployment not found")

    project = db.query(models.Project).filter(
        models.Project.id == deployment.project_id,
        models.Project.owner_id == user_id
    ).first()
    
    if not project:
        raise HTTPException(status_code=403, detail="Not authorized")

    if deployment.container_id:
        status = container_status(deployment.container_id)
        if status != "not_found":
            deployment.status = status
            db.commit()
            
    return {"status": deployment.status}

@app.get("/deployments/{deployment_id}/logs")
def deployment_logs(
    deployment_id: int,
    user_id: int = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    deployment = crud.get_deployment(db, deployment_id)
    if not deployment:
        raise HTTPException(status_code=404, detail="Deployment not found")

    project = db.query(models.Project).filter(
        models.Project.id == deployment.project_id,
        models.Project.owner_id == user_id
    ).first()
    
    if not project:
        raise HTTPException(status_code=403, detail="Not authorized")

    if not deployment.container_id:
        return {"logs": "Container not initialized"}

    logs = get_container_logs(deployment.container_id)
    return {"logs": logs}

@app.get("/deployments/{deployment_id}/build-logs")
def build_logs(
    deployment_id: int,
    user_id: int = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    deployment = crud.get_deployment(db, deployment_id)
    if not deployment:
        raise HTTPException(status_code=404, detail="Deployment not found")

    project = db.query(models.Project).filter(
        models.Project.id == deployment.project_id,
        models.Project.owner_id == user_id
    ).first()
    
    if not project:
        raise HTTPException(status_code=403, detail="Not authorized")

    return {
        "build_status": deployment.build_status,
        "logs": deployment.build_logs
    }

@app.get("/deployments/{deployment_id}/details")
def deployment_details(
    deployment_id: int,
    user_id: int = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    deployment = crud.get_deployment(db, deployment_id)
    if not deployment:
        raise HTTPException(status_code=404, detail="Deployment not found")

    project = db.query(models.Project).filter(
        models.Project.id == deployment.project_id,
        models.Project.owner_id == user_id
    ).first()
    
    if not project:
        raise HTTPException(status_code=403, detail="Not authorized")

    logs = "No container assigned"
    if deployment.container_id:
        status = container_status(deployment.container_id)
        if status != "not_found":
            deployment.status = status
            db.commit()
        logs = get_container_logs(deployment.container_id)

    return {
        "status": deployment.status,
        "url": deployment.url,
        "port": deployment.port,
        "logs": logs
    }