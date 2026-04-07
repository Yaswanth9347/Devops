from .conftest import client

def test_health():
    response = client.get("/")
    assert response.json()["success"] == True

def test_deployment_specific_health():
    response = client.get("/deployments/1/health")
    assert response.status_code in [200, 401, 404, 403]
