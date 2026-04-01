import docker
import docker.errors

client = docker.from_env()

def stop_container(container_id: str):
    try:
        container = client.containers.get(container_id)
        container.stop()
    except docker.errors.NotFound:
        pass

def start_container(container_id: str):
    container = client.containers.get(container_id)
    container.start()

def container_status(container_id: str) -> str:
    try:
        container = client.containers.get(container_id)
        container.reload()
        return container.status
    except docker.errors.NotFound:
        return "not_found"

def container_details(container_id: str):
    try:
        container = client.containers.get(container_id)
        return {
            "status": container.status,
            "image": container.image.tags,
            "name": container.name
        }
    except Exception:
        return None

def get_container_logs(container_id: str) -> str:
    try:
        container = client.containers.get(container_id)
        logs = container.logs(tail=100)
        return logs.decode('utf-8')
    except Exception as e:
        return "No logs available"

def remove_container(container_id: str):
    try:
        container = client.containers.get(container_id)
        container.stop()
        container.remove()
    except Exception:
        pass

def remove_image(image_tag: str):
    try:
        client.images.remove(image=image_tag, force=True)
    except Exception:
        pass

def prune_docker():
    try:
        client.containers.prune()
        client.images.prune()
    except Exception:
        pass
