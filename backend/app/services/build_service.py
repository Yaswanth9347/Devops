import os
import subprocess
from app.core.settings import settings

def has_dockerfile(path: str) -> bool:
    return os.path.exists(os.path.join(path, "Dockerfile"))

def build_image(source_path: str, deployment_id: int):
    tag = f"{settings.DOCKER_PREFIX}:{deployment_id}"
    result = subprocess.run([
        "docker",
        "build",
        "-t",
        tag,
        source_path
    ], capture_output=True, text=True)
    
    if result.returncode != 0:
        raise Exception(result.stderr or result.stdout)
        
    return tag, result.stdout
