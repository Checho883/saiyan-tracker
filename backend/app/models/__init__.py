"""Import all models so Base.metadata.create_all() discovers them."""

from app.models.user import User
from app.models.category import Category
from app.models.habit import Habit
from app.models.habit_log import HabitLog
from app.models.habit_streak import HabitStreak
from app.models.daily_log import DailyLog
from app.models.streak import Streak
from app.models.power_level import PowerLevel
from app.models.reward import Reward
from app.models.capsule_drop import CapsuleDrop
from app.models.wish import Wish
from app.models.wish_log import WishLog
from app.models.off_day import OffDay
from app.models.achievement import Achievement
from app.models.quote import Quote

__all__ = [
    "User",
    "Category",
    "Habit",
    "HabitLog",
    "HabitStreak",
    "DailyLog",
    "Streak",
    "PowerLevel",
    "Reward",
    "CapsuleDrop",
    "Wish",
    "WishLog",
    "OffDay",
    "Achievement",
    "Quote",
]
