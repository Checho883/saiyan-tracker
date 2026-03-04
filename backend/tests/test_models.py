"""Tests for model definitions — DB-01, DB-02, DB-03, DB-04, DB-05, DB-06, DB-08."""

import uuid

from app.database.base import Base
from app.models.user import User
from app.models.category import Category
from app.models.habit import Habit
from app.models.habit_log import HabitLog
from app.models.daily_log import DailyLog


# --- DB-01: All 15 tables ---

EXPECTED_TABLES = {
    "users",
    "categories",
    "habits",
    "habit_logs",
    "habit_streaks",
    "daily_logs",
    "streaks",
    "power_levels",
    "rewards",
    "capsule_drops",
    "wishes",
    "wish_logs",
    "off_days",
    "achievements",
    "quotes",
}


def test_create_all_tables():
    """All 15 tables are registered in Base.metadata."""
    actual = set(Base.metadata.tables.keys())
    assert EXPECTED_TABLES.issubset(actual), f"Missing tables: {EXPECTED_TABLES - actual}"
    assert len(EXPECTED_TABLES) == 15


def test_all_model_tables():
    """Each expected table name exists in metadata."""
    for table in EXPECTED_TABLES:
        assert table in Base.metadata.tables, f"Table '{table}' not found"


# --- DB-02: User defaults ---

def test_user_defaults(db):
    """User model has correct default values for all XP and setting fields."""
    user = User(username="test-defaults")
    db.add(user)
    db.flush()

    assert user.str_xp == 0
    assert user.vit_xp == 0
    assert user.int_xp == 0
    assert user.ki_xp == 0
    assert user.power_level == 0
    assert user.current_transformation == "base"
    assert user.dragon_balls_collected == 0
    assert user.wishes_granted == 0
    assert user.sound_enabled is True
    assert user.theme == "dark"


# --- DB-03: Habit fields ---

def test_habit_fields(db, sample_user):
    """Habit has importance and attribute fields; no base_points column."""
    habit = Habit(
        user_id=sample_user.id,
        title="Test Habit",
        importance="critical",
        attribute="str",
        start_date="2026-03-04",
    )
    db.add(habit)
    db.flush()

    assert habit.importance == "critical"
    assert habit.attribute == "str"

    # No base_points column
    column_names = [c.name for c in Habit.__table__.columns]
    assert "base_points" not in column_names


# --- DB-04: HabitLog fields ---

def test_habit_log_fields(db, sample_user):
    """HabitLog has attribute_xp_awarded and capsule_dropped."""
    habit = Habit(
        user_id=sample_user.id,
        title="Log Test",
        attribute="vit",
        start_date="2026-03-04",
    )
    db.add(habit)
    db.flush()

    log = HabitLog(
        user_id=sample_user.id,
        habit_id=habit.id,
        log_date="2026-03-04",
    )
    db.add(log)
    db.flush()

    assert log.attribute_xp_awarded == 0
    assert log.capsule_dropped is False


# --- DB-05: DailyLog fields ---

def test_daily_log_fields(db, sample_user):
    """DailyLog has all 6 required fields with correct defaults."""
    dl = DailyLog(
        user_id=sample_user.id,
        log_date="2026-03-04",
    )
    db.add(dl)
    db.flush()

    assert dl.is_perfect_day is False
    assert dl.completion_tier == "base"
    assert dl.xp_earned == 0
    assert dl.streak_multiplier == 1.0
    assert dl.zenkai_bonus_applied is False
    assert dl.dragon_ball_earned is False


# --- DB-06: Date columns are strings ---

def test_date_columns_are_strings(db, sample_user):
    """log_date, start_date, end_date stored as strings, not datetime."""
    habit = Habit(
        user_id=sample_user.id,
        title="Date Test",
        attribute="ki",
        start_date="2026-03-04",
        end_date="2026-12-31",
    )
    db.add(habit)
    db.flush()

    log = HabitLog(
        user_id=sample_user.id,
        habit_id=habit.id,
        log_date="2026-03-04",
    )
    db.add(log)
    db.flush()

    # Read back and verify they're strings
    db.refresh(log)
    assert isinstance(log.log_date, str)
    assert log.log_date == "2026-03-04"

    db.refresh(habit)
    assert isinstance(habit.start_date, str)
    assert isinstance(habit.end_date, str)


# --- DB-08: Category fields ---

def test_category_fields(db, sample_user):
    """Category has name, color_code, icon; no point_multiplier."""
    cat = Category(
        user_id=sample_user.id,
        name="Test Category",
        color_code="#FF0000",
        icon="\U0001f525",
    )
    db.add(cat)
    db.flush()

    assert cat.name == "Test Category"
    assert cat.color_code == "#FF0000"
    assert cat.icon == "\U0001f525"

    column_names = [c.name for c in Category.__table__.columns]
    assert "point_multiplier" not in column_names
