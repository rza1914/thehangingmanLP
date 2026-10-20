from fastapi.testclient import TestClient

from app.core import config as config_module
from app.main import app

client = TestClient(app)

VALID_PAYLOAD = {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "message": "Hello, I would like to discuss a project.",
    "honeypot": "",
    "locale": "en",
}


def test_contact_valid_submission_mock_mode(monkeypatch, caplog):
    monkeypatch.setattr(config_module.settings, "bot_token", "")
    monkeypatch.setattr(config_module.settings, "chat_id", "")

    with caplog.at_level("INFO"):
        response = client.post("/contact", json=VALID_PAYLOAD)

    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert any("MOCK MODE" in record.message for record in caplog.records)


def test_contact_honeypot_rejected_silently(caplog):
    payload = {**VALID_PAYLOAD, "honeypot": "i-am-a-bot"}

    with caplog.at_level("INFO"):
        response = client.post("/contact", json=payload)

    assert response.status_code == 200
    assert not any("MOCK MODE" in record.message for record in caplog.records)
    assert any("Honeypot triggered" in record.message for record in caplog.records)


def test_contact_invalid_email_rejected():
    payload = {**VALID_PAYLOAD, "email": "not-an-email"}
    response = client.post("/contact", json=payload)
    assert response.status_code == 422


def test_contact_missing_message_rejected():
    payload = {**VALID_PAYLOAD, "message": ""}
    response = client.post("/contact", json=payload)
    assert response.status_code == 422


def test_contact_telegram_failure_returns_502(monkeypatch):
    monkeypatch.setattr(config_module.settings, "bot_token", "fake-token")
    monkeypatch.setattr(config_module.settings, "chat_id", "fake-chat")

    import app.routers.contact as contact_module
    from app.services.telegram import TelegramDeliveryError

    async def failing_send(_payload):
        raise TelegramDeliveryError("simulated failure")

    monkeypatch.setattr(contact_module, "send_contact_message", failing_send)

    response = client.post("/contact", json=VALID_PAYLOAD)
    assert response.status_code == 502


def test_telegram_error_timeout_type(monkeypatch):
    monkeypatch.setenv("BOT_TOKEN", "fake-token")
    monkeypatch.setenv("CHAT_ID", "fake-chat")

    from app.services.telegram import TelegramDeliveryError, send_contact_message
    import httpx

    class FailingClient:
        async def __aenter__(self):
            return self
        async def __aexit__(self, *args):
            return False
        async def post(self, url, json):
            raise httpx.TimeoutException("read timed out")

    monkeypatch.setattr(httpx, "AsyncClient", lambda *args, **kwargs: FailingClient())

    payload = type("P", (), {"locale": "en", "name": "n", "email": "a@b.co", "message": "m", "honeypot": ""})()

    import asyncio
    try:
        asyncio.run(send_contact_message(payload))
    except TelegramDeliveryError as exc:
        assert exc.error_type == "timeout"
    else:
        raise AssertionError("expected TelegramDeliveryError")


def test_telegram_error_connection_type(monkeypatch):
    monkeypatch.setenv("BOT_TOKEN", "fake-token")
    monkeypatch.setenv("CHAT_ID", "fake-chat")

    from app.services.telegram import TelegramDeliveryError, send_contact_message
    import httpx

    class FailingClient:
        async def __aenter__(self):
            return self
        async def __aexit__(self, *args):
            return False
        async def post(self, url, json):
            raise httpx.ConnectError("connection refused")

    monkeypatch.setattr(httpx, "AsyncClient", lambda *args, **kwargs: FailingClient())

    payload = type("P", (), {"locale": "en", "name": "n", "email": "a@b.co", "message": "m", "honeypot": ""})()

    import asyncio
    try:
        asyncio.run(send_contact_message(payload))
    except TelegramDeliveryError as exc:
        assert exc.error_type == "connection"
    else:
        raise AssertionError("expected TelegramDeliveryError")


def test_telegram_error_http_status_type(monkeypatch):
    monkeypatch.setenv("BOT_TOKEN", "fake-token")
    monkeypatch.setenv("CHAT_ID", "fake-chat")

    from app.services.telegram import TelegramDeliveryError, send_contact_message
    import httpx

    class FakeResponse:
        status_code = 502

    class FailingClient:
        async def __aenter__(self):
            return self
        async def __aexit__(self, *args):
            return False
        async def post(self, url, json):
            raise httpx.HTTPStatusError("server error", request=httpx.Request("POST", "http://x"), response=FakeResponse())

    monkeypatch.setattr(httpx, "AsyncClient", lambda *args, **kwargs: FailingClient())

    payload = type("P", (), {"locale": "en", "name": "n", "email": "a@b.co", "message": "m", "honeypot": ""})()

    import asyncio
    try:
        asyncio.run(send_contact_message(payload))
    except TelegramDeliveryError as exc:
        assert exc.error_type == "http"
        assert exc.status_code == 502
    else:
        raise AssertionError("expected TelegramDeliveryError")