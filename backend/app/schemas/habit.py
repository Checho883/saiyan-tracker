"""Pydantic schemas for Habit endpoints (used by Plan 03-02)."""

import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class HabitCreate(BaseModel):
    title: str
    attribute: Literal["str", "vit", "int", "ki"]
    importance: Literal["normal", "important", "critical"] = "normal"
    frequency: Literal["daily", "weekdays", "custom"] = "daily"
    custom_days: list[int] | None = None
    description: str | None = None
    icon_emoji: str = "\u2b50"
    category_id: uuid.UUID | None = None
    target_time: str | None = None
    is_temporary: bool = False
    start_date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    end_date: str | None = None
    sort_order: int = 0


class HabitUpdate(BaseModel):
    title: str | None = None
    attribute: Literal["str", "vit", "int", "ki"] | None = None
    importance: Literal["normal", "important", "critical"] | None = None
    frequency: Literal["daily", "weekdays", "custom"] | None = None
    custom_days: list[int] | None = None
    description: str | None = None
    icon_emoji: str | None = None
    category_id: uuid.UUID | None = None
    target_time: str | None = None
    is_temporary: bool | None = None
    start_date: str | None = None
    end_date: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class HabitResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    description: str | None
    icon_emoji: str
    importance: str
    attribute: str
    frequency: str
    custom_days: list[int] | None
    target_time: str | None
    is_temporary: bool
    start_date: str
    end_date: str | None
    sort_order: int
    is_active: bool
    category_id: uuid.UUID | None
    created_at: datetime


class HabitCalendarDay(BaseModel):
    date: str
    completed: bool
    attribute_xp_awarded: int


class HabitStatsResponse(BaseModel):
    total_completions: int
    current_streak: int
    best_streak: int
    completion_rate_7d: float
    completion_rate_30d: float
    total_xp_earned: int
    attribute_xp: dict[str, int]  # {"STR": 120, "VIT": 80}


class DayDetailHabit(BaseModel):
    id: uuid.UUID
    title: str
    icon_emoji: str
    completed: bool
    attribute_xp_awarded: int
    is_excused: bool


class DayDetailResponse(BaseModel):
    date: str
    total_xp: int
    completion_tier: str
    is_off_day: bool
    is_perfect_day: bool
    habits: list[DayDetailHabit]


class ReorderRequest(BaseModel):
    habit_ids: list[uuid.UUID]


class HabitTodayResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    description: str | None
    icon_emoji: str
    importance: str
    attribute: str
    frequency: str
    custom_days: list[int] | None
    target_time: str | None
    is_temporary: bool
    start_date: str
    end_date: str | None
    sort_order: int
    is_active: bool
    category_id: uuid.UUID | None
    created_at: datetime
    completed: bool
    streak_current: int
    streak_best: int
