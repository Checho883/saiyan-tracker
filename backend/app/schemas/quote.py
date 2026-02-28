from pydantic import BaseModel

class QuoteResponse(BaseModel):
    character: str
    quote_text: str
    context: str
    severity: int = 1
    
    class Config:
        from_attributes = True
