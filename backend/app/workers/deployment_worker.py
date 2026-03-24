import docker
from ..database import SessionLocal
from .. import models
from ..port_manager import generate_port
from ..nginx_manager import create_config

def process_deployment(deployment_id: int):
    db = SessionLocal()
    
    deployment = db.query(models.Deployment).filter(
        models.Deployment.id == deployment_id
    ).first()

    if not deployment:
        db.close()
        return

    # Simulate build
    deployment.status = "building"
    db.commit()

    try:
        client = docker.from_env()
        port = generate_port(deployment.id)
        
        container = client.containers.run(
            "nginx",
            ports={'80/tcp': port},
            detach=True
        )

        deployment.container_id = container.id
        deployment.port = port
        
        # Point to the new Nginx Reverse Proxy URL
        deployment.url = f"http://localhost:{8000 + deployment.id}"
        deployment.status = "running"
        
        # Configure reverse proxy instantly
        create_config(deployment.id, port)
    except Exception as e:
        print(f"Docker execution failed: {e}")
        deployment.status = "failed"
        
    db.commit()

    db.close()
