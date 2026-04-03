from app.services.docker_service import remove_container, remove_image, prune_docker

def cleanup_deployment(deployment):
    if deployment.container_id:
        remove_container(deployment.container_id)

    if deployment.image_tag:
        remove_image(deployment.image_tag)
