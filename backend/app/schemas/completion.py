from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CompletionCreate(BaseModel):
    task_id: str
    energy_at_completion: Optional[str] = None
    notes: Optional[str] = None

class CompletionResponse(BaseModel):
    id: str
    task_id: str
    task_title: Optional[str] = None
    points_awarded: int
    energy_at_completion: Optional[str]
    completed_at: datetime
    category_name: Optional[str] = None
    
    class Config:
        from_attributes = True
