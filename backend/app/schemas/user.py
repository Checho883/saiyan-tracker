from pydantic import BaseModel
from typing import Optional

class UserCreate(BaseModel):
    username: str
    email: str

class UserSettings(BaseModel):
    daily_point_minimum: Optional[int] = None

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    daily_point_minimum: int
    
    class Config:
        from_attributes = True
