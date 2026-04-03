import os
import subprocess
from app.core.settings import settings

def clone_repo(repo_url: str, project_id: int, deployment_id: int, branch: str = "main"):
    folder = f"{project_id}_{deployment_id}"
    path = os.path.join(settings.REPO_STORAGE, folder)

    if not os.path.exists(settings.REPO_STORAGE):
        os.makedirs(settings.REPO_STORAGE)

    subprocess.run([
        "git",
        "clone",
        "-b",
        branch,
        repo_url,
        path
    ], check=True)

    return path
