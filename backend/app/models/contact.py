from pydantic import BaseModel, EmailStr, Field, field_validator


class ContactRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    message: str = Field(..., min_length=1, max_length=2000)
    honeypot: str = Field(default="", max_length=200)
    locale: str = Field(default="en")

    @field_validator("locale")
    @classmethod
    def normalize_locale(cls, value: str) -> str:
        return value if value in ("en", "fa") else "en"


class ContactResponse(BaseModel):
    status: str
    detail: str