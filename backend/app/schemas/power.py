from pydantic import BaseModel
from typing import Optional, List
from datetime import date

class PowerLevelResponse(BaseModel):
    total_power_points: int
    transformation_level: str
    transformation_name: str
    next_transformation: Optional[str] = None
    next_transformation_name: Optional[str] = None
    points_to_next: Optional[int] = None
    progress_percentage: float
    daily_points_today: int
    current_streak: int
    daily_minimum: int
    daily_minimum_met: bool

class PowerHistoryEntry(BaseModel):
    date: date
    total_power_points: int
    transformation_level: str
    daily_points: int

class TransformationEvent(BaseModel):
    level: str
    name: str
    threshold: int
    unlocked: bool
    unlocked_at: Optional[str] = None
