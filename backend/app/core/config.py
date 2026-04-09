from dotenv import load_dotenv
import os

load_dotenv()

db_host = os.getenv("DB_HOST", "localhost")
db_user = os.getenv("DB_USER", "postgres")
db_password = os.getenv("DB_PASSWORD", "postgres")
db_name = os.getenv("DB_NAME", "devdeploy")

# Automatically compose PostgreSQL connection string for Docker network (or fallback to local overriding string)
DATABASE_URL = os.getenv("DATABASE_URL", f"postgresql://{db_user}:{db_password}@{db_host}:5432/{db_name}")
SECRET_KEY = os.getenv("SECRET_KEY", "devsecret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30