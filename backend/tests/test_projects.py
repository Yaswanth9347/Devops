from .conftest import client

def test_projects_endpoint():
    response = client.get("/projects")
    assert response.status_code in [200, 401]
