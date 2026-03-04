"""Off-day service — mark, cancel, and full reversal of completed habits."""

import uuid
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.daily_log import DailyLog
from app.models.habit_log import HabitLog
from app.models.off_day import OffDay
from app.models.user import User
from app.services.dragon_ball_service import revoke_dragon_ball
from app.services.power_service import recalculate_power_level, check_transformation_change


def is_off_day(db: Session, user_id: UUID, local_date: str) -> bool:
    """Return True if an OffDay record exists for user on the given date."""
    return (
        db.query(OffDay)
        .filter(OffDay.user_id == user_id, OffDay.off_date == local_date)
        .first()
        is not None
    )


def mark_off_day(
    db: Session,
    user_id: UUID,
    local_date: str,
    reason: str = "rest",
    notes: str | None = None,
) -> dict:
    """Mark a day as off. Reverses all completed habits for that date.

    - Deletes all HabitLogs for the date, clawing back attribute XP.
    - Deletes DailyLog, revoking Dragon Ball if earned.
    - Recalculates power level after reversal.
    """
    user = db.query(User).filter(User.id == user_id).one()

    # Create OffDay record
    off_day = OffDay(
        id=uuid.uuid4(),
        user_id=user_id,
        off_date=local_date,
        reason=reason,
        notes=notes,
    )
    db.add(off_day)

    # Reverse all habit logs for this date
    habit_logs = (
        db.query(HabitLog)
        .filter(HabitLog.user_id == user_id, HabitLog.log_date == local_date)
        .all()
    )

    total_xp_reversed = 0
    habits_reversed = 0

    for log in habit_logs:
        if log.completed and log.attribute_xp_awarded > 0:
            # Claw back attribute XP
            habit = log.habit
            attr = habit.attribute
            current_xp = getattr(user, f"{attr}_xp")
            setattr(user, f"{attr}_xp", max(0, current_xp - log.attribute_xp_awarded))
            total_xp_reversed += log.attribute_xp_awarded
            habits_reversed += 1
        db.delete(log)

    # Handle DailyLog
    daily_log = (
        db.query(DailyLog)
        .filter(DailyLog.user_id == user_id, DailyLog.log_date == local_date)
        .first()
    )

    if daily_log is not None:
        if daily_log.dragon_ball_earned:
            revoke_dragon_ball(user)
        db.delete(daily_log)

    # Recalculate power level
    db.flush()
    new_power = recalculate_power_level(db, user)

    # Check transformation change
    new_form = check_transformation_change(user.current_transformation, new_power)
    if new_form is not None:
        user.current_transformation = new_form["key"]

    db.flush()

    return {
        "off_date": local_date,
        "habits_reversed": habits_reversed,
        "xp_clawed_back": total_xp_reversed,
    }


def cancel_off_day(db: Session, user_id: UUID, local_date: str) -> bool:
    """Cancel an off day. Returns True if deleted, False if not found."""
    off_day = (
        db.query(OffDay)
        .filter(OffDay.user_id == user_id, OffDay.off_date == local_date)
        .first()
    )
    if off_day is None:
        return False
    db.delete(off_day)
    db.flush()
    return True
