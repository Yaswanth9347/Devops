from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app.models import models, schemas
from app.db import database

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)