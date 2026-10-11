import logging

import httpx

from app.core.config import settings
from app.models.contact import ContactRequest

logger = logging.getLogger("thehangingman.telegram")

TELEGRAM_API_URL = "https://api.telegram.org/bot{token}/sendMessage"


class TelegramDeliveryError(Exception):
    """Raised when a message could not be delivered via the Telegram Bot API."""


def format_message(payload: ContactRequest) -> str:
    return (
        f"New contact form submission ({payload.locale})\n"
        f"Name: {payload.name}\n"
        f"Email: {payload.email}\n"
        f"Message:\n{payload.message}"
    )


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

    if not settings.telegram_configured:
        logger.info("MOCK MODE (no Telegram credentials configured) - message not sent. Content:\n%s", text)
        return True

    url = TELEGRAM_API_URL.format(token=settings.bot_token)
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, json={"chat_id": settings.chat_id, "text": text})
            response.raise_for_status()
    except httpx.HTTPError as exc:
        logger.error("Telegram delivery failed: %s", exc)
        raise TelegramDeliveryError(str(exc)) from exc

    return True