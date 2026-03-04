"""Integration tests for habit_service — check_habit() atomic transaction and helpers."""

import uuid
from datetime import date, datetime
from unittest.mock import patch

import pytest

from app.models.daily_log import DailyLog
from app.models.habit import Habit
from app.models.habit_log import HabitLog
from app.models.off_day import OffDay
from app.models.streak import Streak
from app.services.habit_service import check_habit, get_habits_due_on_date


# ── Fixtures ───────────────────────────────────────────────────────────────


@pytest.fixture()
def daily_habit(db, sample_user):
    """A daily habit starting Jan 1."""
    habit = Habit(
        id=uuid.uuid4(),
        user_id=sample_user.id,
        title="Daily Push-ups",
        attribute="str",
        importance="normal",
        frequency="daily",
        start_date="2026-01-01",
    )
    db.add(habit)
    db.flush()
    return habit


@pytest.fixture()
def weekday_habit(db, sample_user):
    """A weekday-only habit."""
    habit = Habit(
        id=uuid.uuid4(),
        user_id=sample_user.id,
        title="Study",
        attribute="int",
        importance="important",
        frequency="weekdays",
        start_date="2026-01-01",
    )
    db.add(habit)
    db.flush()
    return habit


@pytest.fixture()
def custom_habit(db, sample_user):
    """A custom-days habit (Mon=1, Wed=3, Fri=5)."""
    habit = Habit(
        id=uuid.uuid4(),
        user_id=sample_user.id,
        title="Yoga",
        attribute="vit",
        importance="critical",
        frequency="custom",
        custom_days=[1, 3, 5],
        start_date="2026-01-01",
    )
    db.add(habit)
    db.flush()
    return habit


@pytest.fixture()
def inactive_habit(db, sample_user):
    """An inactive habit that should be excluded."""
    habit = Habit(
        id=uuid.uuid4(),
        user_id=sample_user.id,
        title="Inactive",
        attribute="ki",
        importance="normal",
        frequency="daily",
        start_date="2026-01-01",
        is_active=False,
    )
    db.add(habit)
    db.flush()
    return habit


@pytest.fixture()
def future_habit(db, sample_user):
    """A habit that hasn't started yet."""
    habit = Habit(
        id=uuid.uuid4(),
        user_id=sample_user.id,
        title="Future Habit",
        attribute="ki",
        importance="normal",
        frequency="daily",
        start_date="2027-01-01",
    )
    db.add(habit)
    db.flush()
    return habit


@pytest.fixture()
def ended_habit(db, sample_user):
    """A habit that already ended."""
    habit = Habit(
        id=uuid.uuid4(),
        user_id=sample_user.id,
        title="Ended Habit",
        attribute="ki",
        importance="normal",
        frequency="daily",
        start_date="2025-01-01",
        end_date="2025-12-31",
    )
    db.add(habit)
    db.flush()
    return habit


# ── get_habits_due_on_date ─────────────────────────────────────────────────


class TestGetHabitsDueOnDate:
    def test_daily_habit_always_due(self, db, sample_user, daily_habit):
        habits = get_habits_due_on_date(db, sample_user.id, "2026-03-04")
        assert daily_habit in habits

    def test_weekday_habit_due_on_weekday(self, db, sample_user, weekday_habit):
        # 2026-03-04 is a Wednesday (weekday)
        habits = get_habits_due_on_date(db, sample_user.id, "2026-03-04")
        assert weekday_habit in habits

    def test_weekday_habit_not_due_on_weekend(self, db, sample_user, weekday_habit):
        # 2026-03-07 is a Saturday
        habits = get_habits_due_on_date(db, sample_user.id, "2026-03-07")
        assert weekday_habit not in habits

    def test_custom_habit_due_on_matching_day(self, db, sample_user, custom_habit):
        # 2026-03-04 is Wednesday = isoweekday 3
        habits = get_habits_due_on_date(db, sample_user.id, "2026-03-04")
        assert custom_habit in habits

    def test_custom_habit_not_due_on_non_matching_day(self, db, sample_user, custom_habit):
        # 2026-03-05 is Thursday = isoweekday 4 (not in [1,3,5])
        habits = get_habits_due_on_date(db, sample_user.id, "2026-03-05")
        assert custom_habit not in habits

    def test_excludes_inactive_habits(self, db, sample_user, daily_habit, inactive_habit):
        habits = get_habits_due_on_date(db, sample_user.id, "2026-03-04")
        assert inactive_habit not in habits

    def test_excludes_future_habits(self, db, sample_user, daily_habit, future_habit):
        habits = get_habits_due_on_date(db, sample_user.id, "2026-03-04")
        assert future_habit not in habits

    def test_excludes_ended_habits(self, db, sample_user, daily_habit, ended_habit):
        habits = get_habits_due_on_date(db, sample_user.id, "2026-03-04")
        assert ended_habit not in habits


# ── check_habit: checking ──────────────────────────────────────────────────


class TestCheckHabitChecking:
    @patch("app.services.habit_service.roll_capsule_drop", return_value=None)
    def test_creates_habit_log(self, mock_capsule, db, sample_user, daily_habit):
        result = check_habit(db, sample_user.id, daily_habit.id, "2026-03-04")
        log = db.query(HabitLog).filter(
            HabitLog.habit_id == daily_habit.id,
            HabitLog.log_date == "2026-03-04",
        ).first()
        assert log is not None
        assert log.completed is True
        assert result["is_checking"] is True

    @patch("app.services.habit_service.roll_capsule_drop", return_value=None)
    def test_awards_attribute_xp(self, mock_capsule, db, sample_user, daily_habit):
        check_habit(db, sample_user.id, daily_habit.id, "2026-03-04")
        # normal importance = 15 XP, attribute = str
        assert sample_user.str_xp == 15

    @patch("app.services.habit_service.roll_capsule_drop", return_value=None)
    def test_creates_daily_log(self, mock_capsule, db, sample_user, daily_habit):
        result = check_habit(db, sample_user.id, daily_habit.id, "2026-03-04")
        daily = db.query(DailyLog).filter(
            DailyLog.user_id == sample_user.id,
            DailyLog.log_date == "2026-03-04",
        ).first()
        assert daily is not None
        assert daily.habits_completed == 1
        assert daily.habits_due >= 1

    @patch("app.services.habit_service.roll_capsule_drop", return_value=None)
    def test_updates_power_level(self, mock_capsule, db, sample_user, daily_habit):
        result = check_habit(db, sample_user.id, daily_habit.id, "2026-03-04")
        assert sample_user.power_level > 0

    @patch("app.services.habit_service.roll_capsule_drop", return_value=None)
    def test_increments_overall_streak(self, mock_capsule, db, sample_user, daily_habit):
        result = check_habit(db, sample_user.id, daily_habit.id, "2026-03-04")
        # 1 of 1 habit = 100% >= 80% -> streak increments
        assert result["streak"]["current_streak"] >= 1

    @patch("app.services.habit_service.roll_capsule_drop", return_value=None)
    def test_increments_habit_streak(self, mock_capsule, db, sample_user, daily_habit):
        result = check_habit(db, sample_user.id, daily_habit.id, "2026-03-04")
        assert result["habit_streak"]["current_streak"] == 1


class TestCheckHabitPerfectDay:
    @patch("app.services.habit_service.roll_capsule_drop", return_value=None)
    def test_awards_dragon_ball_on_perfect_day(self, mock_capsule, db, sample_user, daily_habit):
        result = check_habit(db, sample_user.id, daily_habit.id, "2026-03-04")
        # Single habit, checking it = 100% = Perfect Day
        assert result["is_perfect_day"] is True
        assert sample_user.dragon_balls_collected == 1
        daily = db.query(DailyLog).filter(
            DailyLog.user_id == sample_user.id,
            DailyLog.log_date == "2026-03-04",
        ).first()
        assert daily.dragon_ball_earned is True


# ── check_habit: unchecking ────────────────────────────────────────────────


class TestCheckHabitUnchecking:
    @patch("app.services.habit_service.roll_capsule_drop", return_value=None)
    def test_claws_back_attribute_xp(self, mock_capsule, db, sample_user, daily_habit):
        check_habit(db, sample_user.id, daily_habit.id, "2026-03-04")
        assert sample_user.str_xp == 15
        # Uncheck
        result = check_habit(db, sample_user.id, daily_habit.id, "2026-03-04")
        assert sample_user.str_xp == 0
        assert result["is_checking"] is False

    @patch("app.services.habit_service.roll_capsule_drop", return_value=None)
    def test_revokes_dragon_ball_on_uncheck(self, mock_capsule, db, sample_user, daily_habit):
        check_habit(db, sample_user.id, daily_habit.id, "2026-03-04")
        assert sample_user.dragon_balls_collected == 1
        # Uncheck breaks perfect day
        check_habit(db, sample_user.id, daily_habit.id, "2026-03-04")
        assert sample_user.dragon_balls_collected == 0

    @patch("app.services.habit_service.roll_capsule_drop", return_value=None)
    def test_resets_habit_streak_on_uncheck(self, mock_capsule, db, sample_user, daily_habit):
        check_habit(db, sample_user.id, daily_habit.id, "2026-03-04")
        result = check_habit(db, sample_user.id, daily_habit.id, "2026-03-04")
        assert result["habit_streak"]["current_streak"] == 0

    @patch("app.services.habit_service.roll_capsule_drop", return_value=None)
    def test_capsule_not_removed_on_uncheck(self, mock_capsule, db, sample_user, daily_habit):
        # First check with a capsule drop
        from app.models.capsule_drop import CapsuleDrop
        from app.models.reward import Reward
        reward = Reward(
            id=uuid.uuid4(), user_id=sample_user.id,
            title="Test Reward", rarity="common", is_active=True,
        )
        db.add(reward)
        db.flush()
        capsule = CapsuleDrop(
            id=uuid.uuid4(), user_id=sample_user.id,
            reward_id=reward.id, habit_id=daily_habit.id,
        )
        mock_capsule.return_value = capsule
        check_habit(db, sample_user.id, daily_habit.id, "2026-03-04")
        log = db.query(HabitLog).filter(
            HabitLog.habit_id == daily_habit.id,
            HabitLog.log_date == "2026-03-04",
        ).first()
        assert log.capsule_dropped is True
        # Uncheck — capsule stays
        mock_capsule.return_value = None
        check_habit(db, sample_user.id, daily_habit.id, "2026-03-04")
        log = db.query(HabitLog).filter(
            HabitLog.habit_id == daily_habit.id,
            HabitLog.log_date == "2026-03-04",
        ).first()
        assert log.capsule_dropped is True


# ── check_habit: re-check ─────────────────────────────────────────────────


class TestCheckHabitRecheck:
    @patch("app.services.habit_service.roll_capsule_drop", return_value=None)
    def test_recheck_reawwards_xp(self, mock_capsule, db, sample_user, daily_habit):
        check_habit(db, sample_user.id, daily_habit.id, "2026-03-04")
        check_habit(db, sample_user.id, daily_habit.id, "2026-03-04")  # uncheck
        check_habit(db, sample_user.id, daily_habit.id, "2026-03-04")  # re-check
        assert sample_user.str_xp == 15

    def test_recheck_does_not_reroll_capsule(self, db, sample_user, daily_habit):
        from app.models.capsule_drop import CapsuleDrop
        from app.models.reward import Reward
        reward = Reward(
            id=uuid.uuid4(), user_id=sample_user.id,
            title="Test Reward", rarity="common", is_active=True,
        )
        db.add(reward)
        db.flush()
        capsule = CapsuleDrop(
            id=uuid.uuid4(), user_id=sample_user.id,
            reward_id=reward.id, habit_id=daily_habit.id,
        )
        with patch("app.services.habit_service.roll_capsule_drop", return_value=capsule) as mock_cap:
            check_habit(db, sample_user.id, daily_habit.id, "2026-03-04")
            assert mock_cap.call_count == 1

        with patch("app.services.habit_service.roll_capsule_drop", return_value=None) as mock_cap:
            check_habit(db, sample_user.id, daily_habit.id, "2026-03-04")  # uncheck
            check_habit(db, sample_user.id, daily_habit.id, "2026-03-04")  # re-check
            # Should not be called on re-check because capsule_dropped is already True
            assert mock_cap.call_count == 0


# ── check_habit: Zenkai ───────────────────────────────────────────────────


class TestCheckHabitZenkai:
    @patch("app.services.habit_service.roll_capsule_drop", return_value=None)
    def test_zenkai_activates_on_gap(self, mock_capsule, db, sample_user, daily_habit):
        # Build a streak then create a gap
        streak = Streak(
            id=uuid.uuid4(),
            user_id=sample_user.id,
            current_streak=10,
            best_streak=10,
            last_active_date="2026-03-01",
        )
        db.add(streak)
        db.flush()
        # Check on March 4 (gap of 2 days)
        result = check_habit(db, sample_user.id, daily_habit.id, "2026-03-04")
        assert result["zenkai_activated"] is True
        assert result["daily_log"]["zenkai_bonus_applied"] is True
