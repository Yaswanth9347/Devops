import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    BASE_PORT = int(os.getenv("BASE_PORT", 5000))
    NGINX_BASE_PORT = int(os.getenv("NGINX_PORT", 8000))
    MAX_RETRIES = int(os.getenv("MAX_RETRIES", 3))
    BUILD_TIMEOUT = int(os.getenv("BUILD_TIMEOUT", 300))
    REPO_STORAGE = os.getenv("REPO_STORAGE", "storage/repos/")
    DOCKER_PREFIX = os.getenv("DOCKER_PREFIX", "devdeploy")

settings = Settings()
