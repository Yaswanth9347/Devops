import os
import subprocess

def has_dockerfile(path: str) -> bool:
    return os.path.exists(os.path.join(path, "Dockerfile"))

def build_image(source_path: str, deployment_id: int) -> str:
    tag = f"devdeploy:{deployment_id}"
    subprocess.run([
        "docker",
        "build",
        "-t",
        tag,
        source_path
    ], check=True)
    return tag
