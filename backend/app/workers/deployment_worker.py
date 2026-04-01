import docker
from ..database import SessionLocal
from .. import models
from ..port_manager import generate_port
from ..nginx_manager import create_config
from ..build_manager import get_runtime_image
from ..env_manager import parse_env_string
from ..crud import deactivate_project_deployments
from ..git_manager import clone_repo
from ..docker_builder import build_image, has_dockerfile

def process_deployment(deployment_id: int):
    db = SessionLocal()
    
    deployment = db.query(models.Deployment).filter(
        models.Deployment.id == deployment_id
    ).first()

    if not deployment:
        db.close()
        return

    # Mark as building
    deployment.status = "building"
    deployment.build_status = "building"
    db.commit()

    try:
        client = docker.from_env()
        port = generate_port(deployment.id)

        # Resolve the correct image for this runtime
        image = get_runtime_image(deployment.runtime or "nginx")
        env_dict = parse_env_string(deployment.env_vars)

        project = db.query(models.Project).filter(
            models.Project.id == deployment.project_id
        ).first()

        if project and project.repo_url:
            deployment.build_status = "cloning"
            db.commit()

            path = clone_repo(
                project.repo_url,
                deployment.project_id,
                deployment.id,
                project.branch or "main"
            )
            deployment.source_path = path

            deployment.build_status = "cloned"
            db.commit()

            if has_dockerfile(path):
                deployment.build_status = "building"
                db.commit()

                try:
                    tag, logs = build_image(path, deployment.id)
                    deployment.image_tag = tag
                    deployment.build_logs = logs
                    deployment.build_status = "built"
                    db.commit()
                except Exception as build_error:
                    deployment.status = "failed"
                    deployment.build_status = "failed"
                    deployment.build_logs = str(build_error)
                    db.commit()
                    return
            else:
                deployment.status = "failed"
                deployment.build_status = "no_dockerfile"
                db.commit()
                return

        if deployment.image_tag:
            image = deployment.image_tag

        container = client.containers.run(
            image,
            ports={'80/tcp': port},
            environment=env_dict,
            detach=True
        )

        deployment.container_id = container.id
        deployment.port = port
        deployment.image = image
        deployment.build_status = "completed"

        # Point to the Nginx Reverse Proxy URL
        deployment.url = f"http://localhost:{8000 + deployment.id}"
        deployment.status = "running"

        # Configure reverse proxy instantly
        create_config(deployment.id, port)
        
        # Deactivate previous deployments and mark the new one active
        deactivate_project_deployments(db, deployment.project_id)
        deployment.is_active = True
        
    except Exception as e:
        print(f"Docker execution failed: {e}")
        deployment.status = "failed"
        deployment.build_status = "failed"

    db.commit()
    db.close()
