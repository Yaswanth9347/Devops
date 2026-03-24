BASE_PORT = 5000

def generate_port(deployment_id: int) -> int:
    return BASE_PORT + deployment_id
