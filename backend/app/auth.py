from datetime import datetime, timedelta
from jose import jwt, JWTError
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from .config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

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