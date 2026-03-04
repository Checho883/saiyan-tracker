"""Pydantic schemas for Analytics endpoints (used by Plan 03-02)."""

import uuid
from datetime import datetime

from pydantic import BaseModel


class AnalyticsSummary(BaseModel):
    perfect_days: int
    avg_completion: float
    total_xp: int
    days_tracked: int
    longest_streak: int


class CapsuleHistoryItem(BaseModel):
    id: uuid.UUID
    reward_title: str
    reward_rarity: str
    habit_title: str
    dropped_at: datetime


class WishHistoryItem(BaseModel):
    id: uuid.UUID
    wish_title: str
    granted_at: datetime


class ContributionDay(BaseModel):
    date: str
    completed: bool


class CalendarDay(BaseModel):
    date: str
    is_perfect_day: bool
    completion_tier: str
    xp_earned: int
    is_off_day: bool
