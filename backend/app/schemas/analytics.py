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


class OffDaySummary(BaseModel):
    total_off_days: int
    xp_impact_estimate: int  # avg_daily_xp * total_off_days
    streaks_preserved: int  # off-days that fell in active streak gaps
    reason_breakdown: dict[str, int]  # {"rest": 2, "sick": 1}


class CompletionTrend(BaseModel):
    weekly_rate: float  # completion rate for last 7 days
    weekly_delta: float  # current - previous week (percentage points)
    weekly_habits_due: int  # raw count for last 7 days
    weekly_habits_completed: int
    monthly_rate: float  # completion rate for last 30 days
    monthly_delta: float  # current - previous month (percentage points)
    monthly_habits_due: int  # raw count for last 30 days
    monthly_habits_completed: int
