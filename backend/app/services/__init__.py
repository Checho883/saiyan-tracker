"""Game logic services — public API for all game mechanics."""

from app.services.xp_service import (
    calc_daily_xp,
    calc_streak_bonus,
    get_attribute_xp,
    get_completion_tier,
)
from app.services.attribute_service import (
    calc_attribute_level,
    get_attribute_title,
    get_xp_for_next_level,
)
from app.services.capsule_service import roll_capsule_drop
from app.services.dragon_ball_service import (
    award_dragon_ball,
    grant_wish,
    revoke_dragon_ball,
)
from app.services.power_service import (
    check_transformation_change,
    get_transformation_for_power,
    recalculate_power_level,
)
from app.services.streak_service import (
    check_zenkai_recovery,
    get_or_create_habit_streak,
    get_or_create_streak,
    update_habit_streak,
    update_overall_streak,
)
from app.services.off_day_service import (
    cancel_off_day,
    is_off_day,
    mark_off_day,
)
from app.services.habit_service import (
    check_habit,
    get_habits_due_on_date,
)

__all__ = [
    # XP
    "calc_daily_xp",
    "calc_streak_bonus",
    "get_attribute_xp",
    "get_completion_tier",
    # Attributes
    "calc_attribute_level",
    "get_attribute_title",
    "get_xp_for_next_level",
    # Capsule
    "roll_capsule_drop",
    # Dragon Ball
    "award_dragon_ball",
    "grant_wish",
    "revoke_dragon_ball",
    # Power / Transformation
    "check_transformation_change",
    "get_transformation_for_power",
    "recalculate_power_level",
    # Streak
    "check_zenkai_recovery",
    "get_or_create_habit_streak",
    "get_or_create_streak",
    "update_habit_streak",
    "update_overall_streak",
    # Off Day
    "cancel_off_day",
    "is_off_day",
    "mark_off_day",
    # Habit
    "check_habit",
    "get_habits_due_on_date",
]
