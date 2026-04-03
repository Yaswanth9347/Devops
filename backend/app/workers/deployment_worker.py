import docker
from app.db.database import SessionLocal
from app.models import models
from app.services.port_service import generate_port
from app.services.nginx_service import create_config
from app.services.runtime_service import get_runtime_image
from app.services.env_service import parse_env_string
from app.db.crud import deactivate_project_deployments
from app.services.git_service import clone_repo
from app.services.build_service import build_image, has_dockerfile
from app.services.docker_service import remove_container
from app.services.health_service import check_service_health
from app.core.deployment_states import update_status
from app.core.settings import settings
from app.core.logger import logger

def process_deployment(deployment_id: int):
    db = SessionLocal()
    
    deployment = db.query(models.Deployment).filter(
        models.Deployment.id == deployment_id
    ).first()

    if not deployment:
        db.close()
        return

    # Mark as building
    if not update_status(deployment, "building"):
        logger.warning(f"Deployment {deployment.id}: Invalid transition to building")
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
                    logger.error(f"Deployment {deployment.id} build failed: {build_error}")
                    update_status(deployment, "failed")
                    deployment.build_status = "failed"
                    deployment.build_logs = str(build_error)
                    db.commit()
                    return
            else:
                update_status(deployment, "failed")
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
        deployment.url = f"http://localhost:{settings.NGINX_BASE_PORT + deployment.id}"
        
        if not update_status(deployment, "running"):
            logger.warning(f"Deployment {deployment.id}: Invalid transition to running")

        # Configure reverse proxy instantly
        create_config(deployment.id, port)
        
        # Deactivate previous deployments and mark the new one active
        deactivate_project_deployments(db, deployment.project_id)
        deployment.is_active = True

        old_deployments = db.query(models.Deployment).filter(
            models.Deployment.project_id == deployment.project_id,
            models.Deployment.id != deployment.id
        ).all()

        for old in old_deployments:
            if old.container_id:
                remove_container(old.container_id)
                update_status(old, "stopped")
                
        # Test Initial Health
        health = check_service_health(deployment.url)
        deployment.health_status = health
        db.commit()
        logger.info(f"Deployment {deployment.id} successfully processed and running")
        
    except Exception as e:
        logger.error(f"Deployment {deployment.id} execution failed: {e}")
        deployment.retry_count += 1
        deployment.last_error = str(e)
        update_status(deployment, "failed")
        deployment.build_status = "failed"

    db.commit()
    db.close()
