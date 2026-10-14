from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Literal


class ContactRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    message: str = Field(..., min_length=1, max_length=2000)
    honeypot: str = Field(default="", max_length=200)
    locale: Literal["en", "fa"] = "en"


class ContactResponse(BaseModel):
    status: str
    detail: str