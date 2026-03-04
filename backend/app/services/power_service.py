"""Power level calculation, transformation lookup and change detection."""

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.constants import TRANSFORMATIONS
from app.models.daily_log import DailyLog
from app.models.user import User


def get_transformation_for_power(power_level: int) -> dict:
    """Return the highest transformation form unlocked at given power level.

    Pure function — no DB access.
    """
    current = TRANSFORMATIONS[0]
    for form in TRANSFORMATIONS:
        if power_level >= form["threshold"]:
            current = form
        else:
            break
    return current


def check_transformation_change(
    old_transformation: str, new_power_level: int
) -> dict | None:
    """Detect if a transformation threshold was crossed.

    Returns new form dict if changed, None if same.
    Pure function — no DB access.
    """
    new_form = get_transformation_for_power(new_power_level)
    if new_form["key"] != old_transformation:
        return new_form
    return None


def recalculate_power_level(db: Session, user: User) -> int:
    """Sum all DailyLog.xp_earned for user and update User.power_level.

    Returns the new total.
    """
    total = (
        db.query(func.coalesce(func.sum(DailyLog.xp_earned), 0))
        .filter(DailyLog.user_id == user.id)
        .scalar()
    )
    user.power_level = total
    return total
