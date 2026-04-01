from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True)
    password = Column(String)
    
    projects = relationship("Project", back_populates="owner")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    owner_id = Column(Integer, ForeignKey("users.id"))
    repo_url = Column(String, nullable=True)
    branch = Column(String, default="main")
    build_path = Column(String, nullable=True)

    owner = relationship("User", back_populates="projects")

class Deployment(Base):
    __tablename__ = "deployments"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    status = Column(String, default="pending")
    commit_hash = Column(String)
    container_id = Column(String, nullable=True)
    port = Column(Integer, nullable=True)
    url = Column(String, nullable=True)
    logs = Column(String, nullable=True)
    runtime = Column(String, nullable=True)
    image = Column(String, nullable=True)
    build_status = Column(String, default="pending")
    env_vars = Column(String, nullable=True)
    version = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=False)
    source_path = Column(String, nullable=True)
    image_tag = Column(String, nullable=True)
    build_logs = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project")