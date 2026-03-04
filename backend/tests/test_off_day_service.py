"""Tests for off_day_service — mark, cancel, and reversal behavior."""

import uuid

import pytest

from app.models.daily_log import DailyLog
from app.models.habit_log import HabitLog
from app.models.off_day import OffDay
from app.services.off_day_service import (
    mark_off_day,
    cancel_off_day,
    is_off_day,
)


class TestIsOffDay:
    def test_returns_false_when_no_off_day(self, db, sample_user):
        assert is_off_day(db, sample_user.id, "2026-03-01") is False

    def test_returns_true_when_off_day_exists(self, db, sample_user):
        db.add(OffDay(id=uuid.uuid4(), user_id=sample_user.id, off_date="2026-03-01"))
        db.flush()
        assert is_off_day(db, sample_user.id, "2026-03-01") is True


class TestMarkOffDay:
    def test_creates_off_day_record(self, db, sample_user):
        result = mark_off_day(db, sample_user.id, "2026-03-01")
        assert result["off_date"] == "2026-03-01"
        assert is_off_day(db, sample_user.id, "2026-03-01") is True

    def test_no_habits_completed_clean_mark(self, db, sample_user):
        result = mark_off_day(db, sample_user.id, "2026-03-01")
        assert result["habits_reversed"] == 0
        assert result["xp_clawed_back"] == 0

    def test_reverses_completed_habits(self, db, sample_user, sample_habit):
        # Simulate completed habit log
        log = HabitLog(
            id=uuid.uuid4(),
            user_id=sample_user.id,
            habit_id=sample_habit.id,
            log_date="2026-03-01",
            completed=True,
            attribute_xp_awarded=15,
        )
        db.add(log)
        # Set user attribute XP
        sample_user.str_xp = 15
        db.flush()

        result = mark_off_day(db, sample_user.id, "2026-03-01")
        assert result["habits_reversed"] == 1
        assert result["xp_clawed_back"] == 15
        assert sample_user.str_xp == 0
        # Habit log deleted
        remaining = db.query(HabitLog).filter(
            HabitLog.user_id == sample_user.id,
            HabitLog.log_date == "2026-03-01",
        ).count()
        assert remaining == 0

    def test_deletes_daily_log(self, db, sample_user):
        daily = DailyLog(
            id=uuid.uuid4(),
            user_id=sample_user.id,
            log_date="2026-03-01",
            xp_earned=200,
        )
        db.add(daily)
        db.flush()
        mark_off_day(db, sample_user.id, "2026-03-01")
        remaining = db.query(DailyLog).filter(
            DailyLog.user_id == sample_user.id,
            DailyLog.log_date == "2026-03-01",
        ).count()
        assert remaining == 0

    def test_revokes_dragon_ball_if_earned(self, db, sample_user):
        sample_user.dragon_balls_collected = 3
        daily = DailyLog(
            id=uuid.uuid4(),
            user_id=sample_user.id,
            log_date="2026-03-01",
            dragon_ball_earned=True,
        )
        db.add(daily)
        db.flush()
        mark_off_day(db, sample_user.id, "2026-03-01")
        assert sample_user.dragon_balls_collected == 2

    def test_recalculates_power_level(self, db, sample_user):
        sample_user.power_level = 500
        # No daily logs left after off day, power should drop to 0
        mark_off_day(db, sample_user.id, "2026-03-01")
        assert sample_user.power_level == 0


class TestCancelOffDay:
    def test_cancel_existing_off_day(self, db, sample_user):
        db.add(OffDay(id=uuid.uuid4(), user_id=sample_user.id, off_date="2026-03-01"))
        db.flush()
        result = cancel_off_day(db, sample_user.id, "2026-03-01")
        assert result is True
        assert is_off_day(db, sample_user.id, "2026-03-01") is False

    def test_cancel_nonexistent_off_day(self, db, sample_user):
        result = cancel_off_day(db, sample_user.id, "2026-03-01")
        assert result is False
