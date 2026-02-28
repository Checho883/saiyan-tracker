from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TaskCreate(BaseModel):
    category_id: str
    title: str
    description: Optional[str] = None
    base_points: int = 10
    energy_level: str = "medium"
    estimated_minutes: Optional[int] = None
    recurring: bool = False
    recurrence_pattern: Optional[str] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    base_points: Optional[int] = None
    energy_level: Optional[str] = None
    estimated_minutes: Optional[int] = None
    category_id: Optional[str] = None
    is_active: Optional[bool] = None

class TaskResponse(BaseModel):
    id: str
    user_id: str
    category_id: str
    title: str
    description: Optional[str]
    base_points: int
    energy_level: str
    estimated_minutes: Optional[int]
    recurring: bool
    recurrence_pattern: Optional[str]
    is_active: bool
    category_name: Optional[str] = None
    category_color: Optional[str] = None
    category_multiplier: Optional[float] = None
    effective_points: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class CategoryCreate(BaseModel):
    name: str
    point_multiplier: float = 1.0
    color_code: str = "#FF6B00"
    icon: str = "zap"

class CategoryResponse(BaseModel):
    id: str
    name: str
    point_multiplier: float
    color_code: str
    icon: str
    
    class Config:
        from_attributes = True
