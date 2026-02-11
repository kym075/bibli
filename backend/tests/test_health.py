from app import app

def test_hello():
    client = app.test_client()
    res = client.get('/api/hello')
    assert res.status_code == 200
