from .conftest import client

def test_home():
    response = client.get("/")
    assert response.status_code == 200
