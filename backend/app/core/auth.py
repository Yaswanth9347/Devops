from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, HTTPBearer
from sqlalchemy.orm import Session
from app.models import schemas, models
from app.db import database
from app.core.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

security = HTTPBearer()

def create_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token=Depends(security)):
    try:
        # print(f"DEBUG: Received token credentials: {token.credentials}")
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        # print(f"DEBUG: Token payload: {payload}")
        user_id = payload.get("user_id")
        if user_id is None:
            print("DEBUG: user_id not found in payload")
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except JWTError as e:
        print(f"DEBUG: JWT Decode Error: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user_id_or_default(token=Depends(HTTPBearer(auto_error=False))):
    if not token:
        return 5 # Development Fallback User ID
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        return user_id if user_id else 5
    except:
        return 5