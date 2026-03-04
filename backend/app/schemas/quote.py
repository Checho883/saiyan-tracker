"""Pydantic schemas for Quote endpoints."""

from pydantic import BaseModel


class QuoteResponse(BaseModel):
    character: str
    quote_text: str
    source_saga: str
    avatar_path: str
