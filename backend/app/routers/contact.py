import logging

from fastapi import APIRouter, HTTPException, Request

from app.guards import client_ip, rate_limited, telegram_configured, is_production
from app.models.contact import ContactRequest, ContactResponse
from app.services.telegram import TelegramDeliveryError, send_contact_message

logger = logging.getLogger("thehangingman.contact")
router = APIRouter()


@router.post("/contact", response_model=ContactResponse)
async def submit_contact(request: Request, payload: ContactRequest) -> ContactResponse:
    # Rate limiting — first line of defence
    if rate_limited(client_ip(request)):
        raise HTTPException(status_code=429, detail="Too many requests. Please try again later.")

    # Production guard — fail closed if Telegram not configured
    if is_production() and not telegram_configured():
        logger.error("/contact hit in production without Telegram credentials — failing closed")
        raise HTTPException(status_code=503, detail="Contact delivery is not configured. Please use direct channels.")

    # Honeypot check: real users never fill this hidden field.
    # Respond with the same success shape so bots get no signal that they were caught.
    if payload.honeypot:
        logger.info("Honeypot triggered - discarding submission silently (email=%s)", payload.email)
        return ContactResponse(status="ok", detail="Message received.")

    try:
        await send_contact_message(payload)
    except TelegramDeliveryError as exc:
        logger.error("Contact submission failed to deliver: %s", exc)
        raise HTTPException(
            status_code=502,
            detail="Could not deliver your message right now. Please try again later or reach out via social links.",
        ) from exc

    return ContactResponse(status="ok", detail="Message received.")