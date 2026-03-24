from sqlalchemy.orm import Session
from . import models

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, email: str, password: str):
    user = models.User(email=email, password=password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def create_project(db: Session, name: str, description: str, owner_id: int):
    project = models.Project(name=name, description=description, owner_id=owner_id)
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

def get_user_projects(db: Session, owner_id: int):
    return db.query(models.Project).filter(models.Project.owner_id == owner_id).all()

def create_deployment(db: Session, project_id: int, commit_hash: str = None):
    deployment = models.Deployment(
        project_id=project_id,
        commit_hash=commit_hash,
        status="pending"
    )
    db.add(deployment)
    db.commit()
    db.refresh(deployment)
    return deployment

def get_project_deployments(db: Session, project_id: int):
    return db.query(models.Deployment).filter(models.Deployment.project_id == project_id).all()

def get_deployment(db: Session, deployment_id: int):
    return db.query(models.Deployment).filter(models.Deployment.id == deployment_id).first()