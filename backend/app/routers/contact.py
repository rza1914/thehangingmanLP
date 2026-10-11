import logging

from fastapi import APIRouter, HTTPException

from app.models.contact import ContactRequest, ContactResponse
from app.services.telegram import TelegramDeliveryError, send_contact_message

logger = logging.getLogger("thehangingman.contact")
router = APIRouter()


@router.post("/contact", response_model=ContactResponse)
async def submit_contact(payload: ContactRequest) -> ContactResponse:
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