from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from .database import engine, Base, get_db
from . import models, schemas, crud, utils, auth

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