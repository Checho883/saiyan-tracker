"""Streak management — overall streak, per-habit streak, and Zenkai recovery detection."""

import uuid
from datetime import date, timedelta
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.constants import STREAK_MIN_COMPLETION
from app.models.off_day import OffDay
from app.models.streak import Streak
from app.models.habit_streak import HabitStreak


def get_or_create_streak(db: Session, user_id: UUID) -> Streak:
    """Return existing Streak for user or create a new one."""
    streak = db.query(Streak).filter(Streak.user_id == user_id).first()
    if streak is None:
        streak = Streak(
            id=uuid.uuid4(),
            user_id=user_id,
            current_streak=0,
            best_streak=0,
        )
        db.add(streak)
        db.flush()
    return streak


def get_or_create_habit_streak(
    db: Session, user_id: UUID, habit_id: UUID
) -> HabitStreak:
    """Return existing HabitStreak for habit or create a new one."""
    hs = (
        db.query(HabitStreak)
        .filter(HabitStreak.user_id == user_id, HabitStreak.habit_id == habit_id)
        .first()
    )
    if hs is None:
        hs = HabitStreak(
            id=uuid.uuid4(),
            user_id=user_id,
            habit_id=habit_id,
            current_streak=0,
            best_streak=0,
        )
        db.add(hs)
        db.flush()
    return hs


def check_zenkai_recovery(
    db: Session, user_id: UUID, local_date: str, streak: Streak
) -> dict:
    """Detect streak gap and calculate Zenkai recovery.

    Does NOT mutate streak — the caller decides when to apply.
    Returns dict with zenkai_activated, halved_from, new_streak.
    """
    if streak.last_active_date is None or streak.current_streak == 0:
        return {"zenkai_activated": False, "halved_from": 0, "new_streak": 0}

    last_date = date.fromisoformat(streak.last_active_date)
    today = date.fromisoformat(local_date)
    gap_days = (today - last_date).days

    if gap_days <= 1:
        # Consecutive days or same day — no gap
        return {"zenkai_activated": False}

    # Count off days in the gap (exclusive of both endpoints)
    off_day_count = (
        db.query(OffDay)
        .filter(
            OffDay.user_id == user_id,
            OffDay.off_date > streak.last_active_date,
            OffDay.off_date < local_date,
        )
        .count()
    )

    if off_day_count >= gap_days - 1:
        # All gap days are off days — streak continues unbroken
        return {"zenkai_activated": False}

    # Streak break detected — halve once
    old_streak = streak.current_streak
    new_streak = max(old_streak // 2, 0)
    return {
        "zenkai_activated": True,
        "halved_from": old_streak,
        "new_streak": new_streak,
    }


def update_overall_streak(
    db: Session,
    user_id: UUID,
    local_date: str,
    completion_rate: float,
    zenkai_info: dict,
) -> dict:
    """Update overall streak based on completion rate and Zenkai recovery.

    - If Zenkai activated, applies halved streak first.
    - Increments streak if completion_rate >= 80%.
    - Always sets last_active_date.
    """
    streak = get_or_create_streak(db, user_id)

    # Apply Zenkai halving if activated
    if zenkai_info.get("zenkai_activated"):
        streak.current_streak = zenkai_info["new_streak"]

    # Increment if threshold met
    if completion_rate >= STREAK_MIN_COMPLETION:
        streak.current_streak += 1
        streak.best_streak = max(streak.best_streak, streak.current_streak)

    streak.last_active_date = local_date

    return {
        "current_streak": streak.current_streak,
        "best_streak": streak.best_streak,
        "zenkai_activated": zenkai_info.get("zenkai_activated", False),
        "halved_from": zenkai_info.get("halved_from", 0),
    }


def update_habit_streak(
    db: Session,
    user_id: UUID,
    habit_id: UUID,
    local_date: str,
    is_checking: bool,
) -> dict:
    """Update per-habit streak on check/uncheck.

    - Checking: increment current_streak, update best, set last_completed_date.
    - Unchecking: reset current_streak to 0.
    """
    hs = get_or_create_habit_streak(db, user_id, habit_id)

    if is_checking:
        hs.current_streak += 1
        hs.best_streak = max(hs.best_streak, hs.current_streak)
        hs.last_completed_date = local_date
    else:
        hs.current_streak = 0

    return {
        "current_streak": hs.current_streak,
        "best_streak": hs.best_streak,
    }
