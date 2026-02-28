from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date


class HabitCreate(BaseModel):
    category_id: str
    title: str
    description: Optional[str] = None
    icon_emoji: str = "⭐"
    base_points: int = 10
    frequency: str = "daily"  # daily, weekdays, custom
    custom_days: Optional[list[str]] = None  # e.g. ["mon","wed","fri"]
    target_time: Optional[str] = None  # e.g. "22:00"
    is_temporary: bool = False
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class HabitUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    icon_emoji: Optional[str] = None
    base_points: Optional[int] = None
    category_id: Optional[str] = None
    frequency: Optional[str] = None
    custom_days: Optional[list[str]] = None
    target_time: Optional[str] = None
    is_temporary: Optional[bool] = None
    end_date: Optional[date] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None


class HabitResponse(BaseModel):
    id: str
    user_id: str
    category_id: str
    title: str
    description: Optional[str]
    icon_emoji: str
    base_points: int
    frequency: str
    custom_days: Optional[list[str]]
    target_time: Optional[str]
    is_temporary: bool
    start_date: Optional[date]
    end_date: Optional[date]
    sort_order: int
    is_active: bool
    created_at: datetime
    category_name: Optional[str] = None
    category_color: Optional[str] = None
    category_multiplier: Optional[float] = None

    class Config:
        from_attributes = True


class HabitTodayResponse(BaseModel):
    id: str
    title: str
    icon_emoji: str
    base_points: int
    category_id: str
    category_name: Optional[str] = None
    category_color: Optional[str] = None
    category_multiplier: Optional[float] = None
    completed: bool
    completed_at: Optional[datetime] = None
    points_awarded: int = 0
    current_streak: int = 0
    best_streak: int = 0


class HabitCalendarDay(BaseModel):
    date: date
    completed: bool
    points_awarded: int = 0


class HabitCalendarResponse(BaseModel):
    habit_id: str
    habit_title: str
    year: int
    month: int
    days: list[HabitCalendarDay]
    completion_rate: float


class AllHabitsCalendarDay(BaseModel):
    date: date
    habits_due: int
    habits_completed: int
    completion_rate: float
    total_points: int


class AllHabitsCalendarResponse(BaseModel):
    year: int
    month: int
    days: list[AllHabitsCalendarDay]


class HabitStatsResponse(BaseModel):
    habit_id: str
    habit_title: str
    current_streak: int
    best_streak: int
    total_completions: int
    completion_rate_7d: float
    completion_rate_30d: float
    completion_rate_90d: float
    total_points_earned: int


class HabitCheckResponse(BaseModel):
    habit_id: str
    completed: bool
    points_awarded: int
    base_points: int
    streak_bonus_points: int
    habit_streak: int
    new_total_power: int
    daily_points: int
    daily_minimum_met: bool
    all_habits_completed: bool
    consistency_bonus_applied: bool
    new_transformation: Optional[dict] = None
