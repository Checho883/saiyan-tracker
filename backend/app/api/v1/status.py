"""Status endpoint — welcome-back, roast detection, and streak-break detection on app load."""

from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.habit import Habit
from app.models.habit_streak import HabitStreak
from app.models.off_day import OffDay
from app.models.user import User
from app.schemas.status import StatusResponse, StreakBreak
from app.services.roast_service import get_welcome_status

router = APIRouter(prefix="/status", tags=["status"])


def detect_streak_breaks(
    db: Session, user_id, local_date: str
) -> list[StreakBreak]:
    """Detect per-habit streak breaks by comparing last_completed_date to today.

    Stateless — does NOT mutate HabitStreak records. Detection only.
    Accounts for off-days in the gap (off-days don't break streaks).
    """
    today_date = date.fromisoformat(local_date)
    breaks = []

    # Batch-load all habit streaks with active streaks
    streaks_with_habits = (
        db.query(HabitStreak, Habit)
        .join(Habit, HabitStreak.habit_id == Habit.id)
        .filter(
            HabitStreak.user_id == user_id,
            HabitStreak.current_streak > 0,
            HabitStreak.last_completed_date.isnot(None),
        )
        .all()
    )

    for hs, habit in streaks_with_habits:
        last_completed = date.fromisoformat(hs.last_completed_date)
        gap_days = (today_date - last_completed).days

        if gap_days <= 1:
            # Consecutive days or same day — no break
            continue

        # Count off-days in the gap (exclusive of both endpoints)
        off_day_count = (
            db.query(OffDay)
            .filter(
                OffDay.user_id == user_id,
                OffDay.off_date > hs.last_completed_date,
                OffDay.off_date < local_date,
            )
            .count()
        )

        if off_day_count >= gap_days - 1:
            # All gap days are off-days — streak continues unbroken
            continue

        # Streak break detected
        old_streak = hs.current_streak
        halved_value = max(old_streak // 2, 0)
        breaks.append(StreakBreak(
            habit_id=str(habit.id),
            habit_title=habit.title,
            old_streak=old_streak,
            halved_value=halved_value,
        ))

    return breaks


@router.get("/", response_model=StatusResponse)
def get_status(
    local_date: str = Query(..., pattern=r"^\d{4}-\d{2}-\d{2}$"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Return welcome-back, roast data, and streak-break detection for the current user.

    Called by frontend on app load. Returns nulls/empty when no absence gap or breaks.
    """
    result = get_welcome_status(db, user.id, local_date)

    # Build response - handle the nested dict structure
    welcome_back = None
    roast = None

    if result.get("welcome_back"):
        welcome_back = result["welcome_back"]

    if result.get("roast"):
        roast = result["roast"]

    # Detect per-habit streak breaks
    streak_breaks = detect_streak_breaks(db, user.id, local_date)

    return StatusResponse(
        welcome_back=welcome_back,
        roast=roast,
        streak_breaks=streak_breaks,
    )
