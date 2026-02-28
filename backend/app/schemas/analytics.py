from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class DailyStats(BaseModel):
    date: date
    points: int
    tasks_completed: int
    minimum_met: bool
    is_off_day: bool

class CategoryBreakdown(BaseModel):
    category_name: str
    category_color: str
    total_points: int
    percentage: float
    task_count: int

class WeeklyAnalytics(BaseModel):
    days: List[DailyStats]
    total_points: int
    average_daily: float
    days_minimum_met: int
    streak: int

class MonthlyAnalytics(BaseModel):
    days: List[DailyStats]
    total_points: int
    average_daily: float
    days_minimum_met: int
    best_day: Optional[DailyStats] = None
    category_breakdown: List[CategoryBreakdown]
