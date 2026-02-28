from pydantic import BaseModel
from typing import Optional
from datetime import date

class OffDayCreate(BaseModel):
    off_day_date: Optional[date] = None
    reason: str  # sick, vacation, rest, injury
    notes: Optional[str] = None

class OffDayResponse(BaseModel):
    id: str
    off_day_date: date
    reason: str
    notes: Optional[str]
    
    class Config:
        from_attributes = True
