import os

from fastapi.testclient import TestClient

from app.main import app
from app.guards import reset_rate_limits

client = TestClient(app)

VALID = {
    "name": "Test User",
    "email": "test@example.com",
    "message": "Hello, this is a backend hardening test message.",
}


def _post(payload=None):
    return client.post("/contact", json=payload or VALID)


def setup_function():
    reset_rate_limits()
    for k in ("ENVIRONMENT", "BOT_TOKEN", "CHAT_ID"):
        os.environ.pop(k, None)   # deterministic: dev mode, no credentials


def teardown_function():
    for k in ("ENVIRONMENT", "BOT_TOKEN", "CHAT_ID"):
        os.environ.pop(k, None)


def test_health_ok():
    assert client.get("/health").status_code == 200


def test_valid_submission_succeeds_in_mock_mode():
    r = _post()
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_rate_limit_blocks_after_threshold():
    for _ in range(5):
        assert _post().status_code == 200
    assert _post().status_code == 429


def test_production_fails_closed_without_credentials():
    os.environ["ENVIRONMENT"] = "production"
    r = _post()
    assert r.status_code == 503


def test_honeypot_returns_silent_success():
    r = _post({**VALID, "honeypot": "i am a bot"})
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_validation_rejects_bad_payloads():
    assert _post({"name": "", "email": "a@b.co", "message": "long enough message"}).status_code == 422
    assert _post({"name": "A", "email": "not-an-email", "message": "long enough message"}).status_code == 422
    assert _post({"name": "A", "email": "a@b.co", "message": ""}).status_code == 422
    assert _post({"name": "A", "email": "a@b.co", "message": "x" * 2001}).status_code == 422
    assert _post({**VALID, "locale": "de"}).status_code == 422