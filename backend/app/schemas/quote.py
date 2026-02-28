from pydantic import BaseModel
from typing import Optional


class QuoteResponse(BaseModel):
    character: str
    quote_text: str
    context: str
    severity: int = 1
    source_saga: Optional[str] = None

    class Config:
        from_attributes = True
