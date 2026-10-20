import logging
import os

import httpx

from app.models.contact import ContactRequest

logger = logging.getLogger("thehangingman.telegram")

TELEGRAM_API_URL = "https://api.telegram.org/bot{token}/sendMessage"


class TelegramDeliveryError(Exception):
    """Raised when a message could not be delivered via the Telegram Bot API."""

    def __init__(self, message: str, error_type: str = "unknown", status_code: int | None = None):
        super().__init__(message)
        self.error_type = error_type
        self.status_code = status_code

    def __str__(self) -> str:
        parts = [super().__str__()]
        if self.error_type:
            parts.append(f"type={self.error_type}")
        if self.status_code is not None:
            parts.append(f"status={self.status_code}")
        return " ".join(parts)


def format_message(payload: ContactRequest) -> str:
    return (
        f"New contact form submission ({payload.locale})\n"
        f"Name: {payload.name}\n"
        f"Email: {payload.email}\n"
        f"Message:\n{payload.message}"
    )


def _telegram_configured() -> bool:
    return bool(os.getenv("BOT_TOKEN")) and bool(os.getenv("CHAT_ID"))


def _bot_token() -> str:
    return os.getenv("BOT_TOKEN", "")


def _chat_id() -> str:
    return os.getenv("CHAT_ID", "")


async def send_contact_message(payload: ContactRequest) -> bool:
    """
    Sends the contact message via the Telegram Bot API.

    If BOT_TOKEN/CHAT_ID are not configured, falls back to mock mode:
    logs the formatted message and returns True without making a network call.
    This allows the full request/response flow to be developed and tested
    before real Telegram credentials exist.

    Raises TelegramDeliveryError on network/API failure when credentials ARE configured.
    """
    text = format_message(payload)

    if not _telegram_configured():
        logger.info("MOCK MODE (no Telegram credentials configured) - message not sent. Content:\n%s", text)
        return True

    url = TELEGRAM_API_URL.format(token=_bot_token())
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, json={"chat_id": _chat_id(), "text": text})
            response.raise_for_status()
    except httpx.TimeoutException as exc:
        logger.error("Telegram delivery timed out: %s", exc)
        raise TelegramDeliveryError(str(exc), error_type="timeout") from exc
    except httpx.ConnectError as exc:
        logger.error("Telegram delivery connection error: %s", exc)
        raise TelegramDeliveryError(str(exc), error_type="connection") from exc
    except httpx.HTTPStatusError as exc:
        logger.error("Telegram delivery HTTP error: %s", exc)
        raise TelegramDeliveryError(str(exc), error_type="http", status_code=exc.response.status_code) from exc
    except httpx.HTTPError as exc:
        logger.error("Telegram delivery failed: %s", exc)
        raise TelegramDeliveryError(str(exc), error_type="http_error") from exc

    return True