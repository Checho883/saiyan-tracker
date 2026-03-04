"""Tests for streak_service — overall streak, habit streak, Zenkai recovery."""

import uuid
from datetime import date, timedelta

import pytest

from app.models.off_day import OffDay
from app.models.streak import Streak
from app.models.habit_streak import HabitStreak
from app.services.streak_service import (
    get_or_create_streak,
    get_or_create_habit_streak,
    update_overall_streak,
    update_habit_streak,
    check_zenkai_recovery,
)


class TestGetOrCreateStreak:
    def test_creates_new_streak(self, db, sample_user):
        streak = get_or_create_streak(db, sample_user.id)
        assert streak.current_streak == 0
        assert streak.best_streak == 0
        assert streak.user_id == sample_user.id

    def test_returns_existing_streak(self, db, sample_user):
        s1 = get_or_create_streak(db, sample_user.id)
        s1.current_streak = 5
        db.flush()
        s2 = get_or_create_streak(db, sample_user.id)
        assert s2.current_streak == 5
        assert s1.id == s2.id


class TestGetOrCreateHabitStreak:
    def test_creates_new_habit_streak(self, db, sample_user, sample_habit):
        hs = get_or_create_habit_streak(db, sample_user.id, sample_habit.id)
        assert hs.current_streak == 0
        assert hs.best_streak == 0
        assert hs.habit_id == sample_habit.id

    def test_returns_existing_habit_streak(self, db, sample_user, sample_habit):
        hs1 = get_or_create_habit_streak(db, sample_user.id, sample_habit.id)
        hs1.current_streak = 3
        db.flush()
        hs2 = get_or_create_habit_streak(db, sample_user.id, sample_habit.id)
        assert hs2.current_streak == 3
        assert hs1.id == hs2.id


class TestUpdateOverallStreak:
    def test_increments_at_80_percent(self, db, sample_user):
        zenkai_info = {"zenkai_activated": False}
        result = update_overall_streak(db, sample_user.id, "2026-03-01", 0.8, zenkai_info)
        assert result["current_streak"] == 1
        assert result["best_streak"] == 1

    def test_increments_at_100_percent(self, db, sample_user):
        zenkai_info = {"zenkai_activated": False}
        result = update_overall_streak(db, sample_user.id, "2026-03-01", 1.0, zenkai_info)
        assert result["current_streak"] == 1

    def test_does_not_increment_below_80(self, db, sample_user):
        zenkai_info = {"zenkai_activated": False}
        result = update_overall_streak(db, sample_user.id, "2026-03-01", 0.79, zenkai_info)
        assert result["current_streak"] == 0

    def test_updates_best_streak(self, db, sample_user):
        zenkai_info = {"zenkai_activated": False}
        # Build up to streak 3
        update_overall_streak(db, sample_user.id, "2026-03-01", 1.0, zenkai_info)
        update_overall_streak(db, sample_user.id, "2026-03-02", 1.0, zenkai_info)
        result = update_overall_streak(db, sample_user.id, "2026-03-03", 1.0, zenkai_info)
        assert result["current_streak"] == 3
        assert result["best_streak"] == 3

    def test_sets_last_active_date(self, db, sample_user):
        zenkai_info = {"zenkai_activated": False}
        update_overall_streak(db, sample_user.id, "2026-03-05", 0.5, zenkai_info)
        streak = get_or_create_streak(db, sample_user.id)
        assert streak.last_active_date == "2026-03-05"

    def test_zenkai_halves_streak_before_increment(self, db, sample_user):
        # First build a streak of 10
        streak = get_or_create_streak(db, sample_user.id)
        streak.current_streak = 10
        streak.best_streak = 10
        db.flush()
        zenkai_info = {"zenkai_activated": True, "halved_from": 10, "new_streak": 5}
        result = update_overall_streak(db, sample_user.id, "2026-03-10", 1.0, zenkai_info)
        # Halved to 5, then incremented to 6
        assert result["current_streak"] == 6
        assert result["zenkai_activated"] is True
        assert result["halved_from"] == 10


class TestUpdateHabitStreak:
    def test_increments_on_check(self, db, sample_user, sample_habit):
        result = update_habit_streak(db, sample_user.id, sample_habit.id, "2026-03-01", True)
        assert result["current_streak"] == 1

    def test_resets_on_uncheck(self, db, sample_user, sample_habit):
        # Build streak
        update_habit_streak(db, sample_user.id, sample_habit.id, "2026-03-01", True)
        result = update_habit_streak(db, sample_user.id, sample_habit.id, "2026-03-01", False)
        assert result["current_streak"] == 0

    def test_updates_best_streak(self, db, sample_user, sample_habit):
        update_habit_streak(db, sample_user.id, sample_habit.id, "2026-03-01", True)
        update_habit_streak(db, sample_user.id, sample_habit.id, "2026-03-02", True)
        result = update_habit_streak(db, sample_user.id, sample_habit.id, "2026-03-03", True)
        assert result["current_streak"] == 3
        assert result["best_streak"] == 3

    def test_sets_last_completed_date(self, db, sample_user, sample_habit):
        update_habit_streak(db, sample_user.id, sample_habit.id, "2026-03-04", True)
        hs = get_or_create_habit_streak(db, sample_user.id, sample_habit.id)
        assert hs.last_completed_date == "2026-03-04"


class TestCheckZenkaiRecovery:
    def test_no_gap_consecutive_days(self, db, sample_user):
        streak = get_or_create_streak(db, sample_user.id)
        streak.current_streak = 5
        streak.last_active_date = "2026-03-03"
        db.flush()
        result = check_zenkai_recovery(db, sample_user.id, "2026-03-04", streak)
        assert result["zenkai_activated"] is False

    def test_gap_with_no_off_days_activates_zenkai(self, db, sample_user):
        streak = get_or_create_streak(db, sample_user.id)
        streak.current_streak = 10
        streak.last_active_date = "2026-03-01"
        db.flush()
        # 3-day gap (March 2, 3 missed)
        result = check_zenkai_recovery(db, sample_user.id, "2026-03-04", streak)
        assert result["zenkai_activated"] is True
        assert result["halved_from"] == 10
        assert result["new_streak"] == 5

    def test_gap_all_off_days_no_zenkai(self, db, sample_user):
        streak = get_or_create_streak(db, sample_user.id)
        streak.current_streak = 10
        streak.last_active_date = "2026-03-01"
        db.flush()
        # Fill gap with off days
        for d in ["2026-03-02", "2026-03-03"]:
            db.add(OffDay(id=uuid.uuid4(), user_id=sample_user.id, off_date=d))
        db.flush()
        result = check_zenkai_recovery(db, sample_user.id, "2026-03-04", streak)
        assert result["zenkai_activated"] is False

    def test_zenkai_halves_streak_of_1_to_0(self, db, sample_user):
        streak = get_or_create_streak(db, sample_user.id)
        streak.current_streak = 1
        streak.last_active_date = "2026-03-01"
        db.flush()
        result = check_zenkai_recovery(db, sample_user.id, "2026-03-04", streak)
        assert result["zenkai_activated"] is True
        assert result["halved_from"] == 1
        assert result["new_streak"] == 0

    def test_zenkai_halves_streak_of_3_to_1(self, db, sample_user):
        streak = get_or_create_streak(db, sample_user.id)
        streak.current_streak = 3
        streak.last_active_date = "2026-03-01"
        db.flush()
        result = check_zenkai_recovery(db, sample_user.id, "2026-03-04", streak)
        assert result["zenkai_activated"] is True
        assert result["halved_from"] == 3
        assert result["new_streak"] == 1

    def test_no_last_active_date(self, db, sample_user):
        streak = get_or_create_streak(db, sample_user.id)
        result = check_zenkai_recovery(db, sample_user.id, "2026-03-04", streak)
        assert result["zenkai_activated"] is False

    def test_zero_streak_no_zenkai(self, db, sample_user):
        streak = get_or_create_streak(db, sample_user.id)
        streak.current_streak = 0
        streak.last_active_date = "2026-03-01"
        db.flush()
        result = check_zenkai_recovery(db, sample_user.id, "2026-03-04", streak)
        assert result["zenkai_activated"] is False

    def test_multiple_missed_days_halve_once(self, db, sample_user):
        streak = get_or_create_streak(db, sample_user.id)
        streak.current_streak = 8
        streak.last_active_date = "2026-02-25"
        db.flush()
        # 7-day gap, halve ONCE
        result = check_zenkai_recovery(db, sample_user.id, "2026-03-04", streak)
        assert result["zenkai_activated"] is True
        assert result["halved_from"] == 8
        assert result["new_streak"] == 4
