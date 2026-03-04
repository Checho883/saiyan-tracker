"""Tests for Analytics endpoints — summary, capsule-history, wish-history."""

import uuid
from datetime import date, datetime, timedelta

import pytest


class TestAnalyticsSummary:
    def test_summary_empty(self, client, sample_user):
        """No logs → all zeros."""
        resp = client.get("/api/v1/analytics/summary?period=all")
        assert resp.status_code == 200
        data = resp.json()
        assert data["perfect_days"] == 0
        assert data["avg_completion"] == 0.0
        assert data["total_xp"] == 0
        assert data["days_tracked"] == 0
        assert data["longest_streak"] == 0

    def test_summary_with_data(self, client, db, sample_user):
        """Create DailyLog entries, verify correct counts."""
        from app.models.daily_log import DailyLog

        today = date.today().isoformat()
        dl = DailyLog(
            id=uuid.uuid4(),
            user_id=sample_user.id,
            log_date=today,
            habits_due=3,
            habits_completed=3,
            habit_completion_rate=1.0,
            is_perfect_day=True,
            completion_tier="kaio_x20",
            xp_earned=200,
        )
        db.add(dl)
        db.flush()

        resp = client.get("/api/v1/analytics/summary?period=all")
        assert resp.status_code == 200
        data = resp.json()
        assert data["perfect_days"] == 1
        assert data["avg_completion"] == 1.0
        assert data["total_xp"] == 200
        assert data["days_tracked"] == 1

    def test_summary_period_filter(self, client, db, sample_user):
        """Logs at different dates should be filtered by period."""
        from app.models.daily_log import DailyLog

        today = date.today()
        # Recent log (within week)
        dl1 = DailyLog(
            id=uuid.uuid4(),
            user_id=sample_user.id,
            log_date=today.isoformat(),
            habits_due=2,
            habits_completed=2,
            habit_completion_rate=1.0,
            is_perfect_day=True,
            xp_earned=100,
        )
        # Old log (40 days ago)
        old_date = (today - timedelta(days=40)).isoformat()
        dl2 = DailyLog(
            id=uuid.uuid4(),
            user_id=sample_user.id,
            log_date=old_date,
            habits_due=2,
            habits_completed=1,
            habit_completion_rate=0.5,
            is_perfect_day=False,
            xp_earned=50,
        )
        db.add_all([dl1, dl2])
        db.flush()

        # Week filter should only show recent
        resp = client.get("/api/v1/analytics/summary?period=week")
        data = resp.json()
        assert data["days_tracked"] == 1
        assert data["total_xp"] == 100

        # Month filter should only show recent (40 days ago is outside 30-day window)
        resp = client.get("/api/v1/analytics/summary?period=month")
        data = resp.json()
        assert data["days_tracked"] == 1

        # All should show both
        resp = client.get("/api/v1/analytics/summary?period=all")
        data = resp.json()
        assert data["days_tracked"] == 2
        assert data["total_xp"] == 150


class TestCapsuleHistory:
    def test_capsule_history(self, client, db, sample_user, sample_habit, sample_reward):
        """Create capsule drop, verify response includes reward and habit titles."""
        from app.models.capsule_drop import CapsuleDrop

        drop = CapsuleDrop(
            id=uuid.uuid4(),
            user_id=sample_user.id,
            reward_id=sample_reward.id,
            habit_id=sample_habit.id,
        )
        db.add(drop)
        db.flush()

        resp = client.get("/api/v1/analytics/capsule-history")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) >= 1
        item = data[0]
        assert item["reward_title"] == "Test Reward"
        assert item["reward_rarity"] == "common"
        assert item["habit_title"] == "Test Habit"
        assert "dropped_at" in item


class TestWishHistory:
    def test_wish_history(self, client, db, sample_user, sample_wish):
        """Create wish log, verify response includes wish title."""
        from app.models.wish_log import WishLog

        log = WishLog(
            id=uuid.uuid4(),
            user_id=sample_user.id,
            wish_id=sample_wish.id,
        )
        db.add(log)
        db.flush()

        resp = client.get("/api/v1/analytics/wish-history")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) >= 1
        item = data[0]
        assert item["wish_title"] == "Test Wish"
        assert "granted_at" in item
