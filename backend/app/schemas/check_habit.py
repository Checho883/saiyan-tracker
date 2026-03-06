"""Pydantic schemas for check/uncheck habit endpoint (used by Plan 03-02)."""

import uuid

from pydantic import BaseModel, Field


class CheckHabitRequest(BaseModel):
    local_date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")


class QuoteDetail(BaseModel):
    character: str
    quote_text: str
    source_saga: str
    avatar_path: str


class CapsuleDropDetail(BaseModel):
    id: uuid.UUID
    reward_id: uuid.UUID
    reward_title: str
    reward_rarity: str


class DailyLogSummary(BaseModel):
    habits_due: int
    habits_completed: int
    completion_rate: float
    completion_tier: str
    xp_earned: int
    streak_multiplier: float
    zenkai_bonus_applied: bool
    dragon_ball_earned: bool


class StreakInfo(BaseModel):
    current_streak: int
    best_streak: int


class TransformChange(BaseModel):
    key: str
    name: str
    threshold: int


class DragonBallInfo(BaseModel):
    dragon_balls_collected: int
    wish_available: bool


class CheckHabitResponse(BaseModel):
    is_checking: bool
    habit_id: uuid.UUID
    log_date: str
    attribute_xp_awarded: int
    is_perfect_day: bool
    zenkai_activated: bool
    daily_log: DailyLogSummary
    streak: StreakInfo
    habit_streak: StreakInfo
    power_level: int
    transformation: str
    transform_change: TransformChange | None = None
    dragon_ball: DragonBallInfo | None = None
    capsule: CapsuleDropDetail | None = None
    quote: QuoteDetail | None = None
    events: list[dict] = []
