import requests

def check_service_health(url: str) -> str:
    try:
        response = requests.get(url, timeout=3)
        if response.status_code == 200:
            return "healthy"
        return "unhealthy"
    except Exception:
        return "unreachable"
