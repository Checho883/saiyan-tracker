"""Pydantic schemas for the status/welcome-back endpoint."""

from pydantic import BaseModel


class StatusQuote(BaseModel):
    character: str
    quote_text: str
    source_saga: str
    avatar_path: str


class RoastInfo(BaseModel):
    quote: StatusQuote | None = None
    severity: str
    gap_days: int


class StatusResponse(BaseModel):
    welcome_back: StatusQuote | None = None
    roast: RoastInfo | None = None
