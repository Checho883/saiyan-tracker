"""XP calculation service — pure functions for daily XP, tier lookup, and streaks."""

import math

from app.core.constants import (
    BASE_DAILY_XP,
    COMPLETION_TIERS,
    IMPORTANCE_XP,
    STREAK_BONUS_CAP,
    STREAK_BONUS_PER_DAY,
    ZENKAI_BONUS,
)


def calc_daily_xp(
    completion_rate: float,
    current_streak: int,
    zenkai_active: bool = False,
) -> int:
    """Calculate daily XP award.

    Formula: floor(BASE_DAILY_XP * completion_rate * tier_multiplier * (1 + streak_bonus) [* (1 + ZENKAI_BONUS)])
    """
    tier = get_completion_tier(completion_rate)
    streak_bonus = calc_streak_bonus(current_streak)
    xp = BASE_DAILY_XP * completion_rate * tier["multiplier"] * (1 + streak_bonus)
    if zenkai_active:
        xp *= 1 + ZENKAI_BONUS
    return math.floor(xp)


def get_completion_tier(completion_rate: float) -> dict:
    """Return the highest matching Kaio-ken tier for the given completion rate.

    COMPLETION_TIERS is sorted descending by min_rate. Returns the first tier
    where completion_rate >= tier min_rate. Falls back to base tier.
    """
    for tier in COMPLETION_TIERS:
        if completion_rate >= tier["min_rate"]:
            return tier
    return COMPLETION_TIERS[-1]


def get_attribute_xp(importance: str) -> int:
    """Return per-habit attribute XP for the given importance level.

    Raises KeyError for invalid importance values (validation at API layer).
    """
    return IMPORTANCE_XP[importance]


def calc_streak_bonus(current_streak: int) -> float:
    """Calculate streak bonus: +5% per day, capped at +100%."""
    return min(current_streak * STREAK_BONUS_PER_DAY, STREAK_BONUS_CAP)
