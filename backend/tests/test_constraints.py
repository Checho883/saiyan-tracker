"""Tests for database constraints — unique constraints, FK enforcement, cascades."""

import uuid

import pytest
from sqlalchemy.exc import IntegrityError

from app.models.habit import Habit
from app.models.habit_log import HabitLog
from app.models.daily_log import DailyLog
from app.models.category import Category
from app.models.wish import Wish
from app.models.wish_log import WishLog


def test_unique_habit_log(db, sample_user):
    """Duplicate (habit_id, log_date) raises IntegrityError."""
    habit = Habit(
        user_id=sample_user.id,
        title="Unique Test",
        attribute="str",
        start_date="2026-03-04",
    )
    db.add(habit)
    db.flush()

    log1 = HabitLog(
        user_id=sample_user.id,
        habit_id=habit.id,
        log_date="2026-03-04",
    )
    db.add(log1)
    db.flush()

    log2 = HabitLog(
        user_id=sample_user.id,
        habit_id=habit.id,
        log_date="2026-03-04",
    )
    db.add(log2)

    with pytest.raises(IntegrityError):
        db.flush()


def test_unique_daily_log(db, sample_user):
    """Duplicate (user_id, log_date) raises IntegrityError."""
    dl1 = DailyLog(user_id=sample_user.id, log_date="2026-03-04")
    db.add(dl1)
    db.flush()

    dl2 = DailyLog(user_id=sample_user.id, log_date="2026-03-04")
    db.add(dl2)

    with pytest.raises(IntegrityError):
        db.flush()


def test_fk_enforcement(db):
    """Invalid FK raises IntegrityError (proves PRAGMA foreign_keys=ON)."""
    fake_user_id = uuid.uuid4()
    fake_habit_id = uuid.uuid4()

    log = HabitLog(
        user_id=fake_user_id,
        habit_id=fake_habit_id,
        log_date="2026-03-04",
    )
    db.add(log)

    with pytest.raises(IntegrityError):
        db.flush()


def test_category_set_null(db, sample_user):
    """Deleting a category sets habit.category_id to NULL."""
    cat = Category(
        user_id=sample_user.id,
        name="Temp Category",
        color_code="#000000",
        icon="X",
    )
    db.add(cat)
    db.flush()

    habit = Habit(
        user_id=sample_user.id,
        category_id=cat.id,
        title="Cat Habit",
        attribute="int",
        start_date="2026-03-04",
    )
    db.add(habit)
    db.flush()

    assert habit.category_id == cat.id

    # Delete the category directly via SQL to trigger ON DELETE SET NULL
    db.execute(Category.__table__.delete().where(Category.id == cat.id))
    db.flush()

    # Expire cached state and re-read
    db.expire(habit)
    assert habit.category_id is None


def test_wish_log_cascade(db, sample_user):
    """Deleting a wish also deletes its wish_logs (CASCADE)."""
    wish = Wish(
        user_id=sample_user.id,
        title="Test Wish",
    )
    db.add(wish)
    db.flush()

    wl = WishLog(
        user_id=sample_user.id,
        wish_id=wish.id,
    )
    db.add(wl)
    db.flush()

    wish_log_id = wl.id

    # Delete wish via SQL to trigger ON DELETE CASCADE
    db.execute(Wish.__table__.delete().where(Wish.id == wish.id))
    db.flush()

    # Verify wish_log is gone
    remaining = db.query(WishLog).filter(WishLog.id == wish_log_id).first()
    assert remaining is None
