from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str

    class Config:
        from_attributes = True

class ProjectCreate(BaseModel):
    name: str
    description: str

class ProjectResponse(BaseModel):
    id: int
    name: str
    description: str
    owner_id: int

    class Config:
        from_attributes = True

class DeploymentCreate(BaseModel):
    project_id: int
    commit_hash: str | None = None

class DeploymentResponse(BaseModel):
    id: int
    project_id: int
    status: str
    commit_hash: str | None
    container_id: str | None = None
    port: int | None = None
    url: str | None = None

    class Config:
        from_attributes = True