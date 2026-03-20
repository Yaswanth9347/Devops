from fastapi import FastAPI
from .database import engine, Base
from . import models

app = FastAPI()

@app.get("/")
def home():
    return {"message":"DevDeploy API running"}
    
Base.metadata.create_all(bind=engine)