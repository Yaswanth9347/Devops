from app.core.settings import settings

def generate_port(deployment_id: int) -> int:
    return settings.BASE_PORT + deployment_id
