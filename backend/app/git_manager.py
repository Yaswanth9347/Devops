import os
import subprocess

BASE_PATH = "storage/repos/"

def clone_repo(repo_url: str, project_id: int, deployment_id: int, branch: str = "main"):
    folder = f"{project_id}_{deployment_id}"
    path = os.path.join(BASE_PATH, folder)

    if not os.path.exists(BASE_PATH):
        os.makedirs(BASE_PATH)

    subprocess.run([
        "git",
        "clone",
        "-b",
        branch,
        repo_url,
        path
    ], check=True)

    return path
