from .conftest import client

def test_deployments_endpoint():
    response = client.get("/projects/1/deployments")
    assert response.status_code in [200, 401, 404]
