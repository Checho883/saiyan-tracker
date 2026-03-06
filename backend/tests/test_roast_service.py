"""Tests for roast_service — gap detection, severity mapping, welcome status."""

import uuid

import pytest

from app.models.off_day import OffDay
from app.models.quote import Quote
from app.models.streak import Streak
from app.services.roast_service import (
    calc_roast_severity,
    detect_absence_gap,
    get_welcome_status,
)


# ── Pure function tests ───────────────────────────────────────────────────


class TestCalcRoastSeverity:
    def test_zero_gap_returns_none(self):
        assert calc_roast_severity(0) is None

    def test_negative_gap_returns_none(self):
        assert calc_roast_severity(-1) is None

    def test_one_day_mild(self):
        assert calc_roast_severity(1) == "mild"

    def test_two_days_mild(self):
        assert calc_roast_severity(2) == "mild"

    def test_three_days_medium(self):
        assert calc_roast_severity(3) == "medium"

    def test_six_days_medium(self):
        assert calc_roast_severity(6) == "medium"

    def test_seven_days_savage(self):
        assert calc_roast_severity(7) == "savage"

    def test_thirty_days_savage(self):
        assert calc_roast_severity(30) == "savage"


# ── DB-dependent tests ────────────────────────────────────────────────────


class TestDetectAbsenceGap:
    def test_no_streak_record_returns_no_gap(self, db, sample_user):
        result = detect_absence_gap(db, sample_user.id, "2026-01-10")
        assert result["effective_gap"] == 0
        assert result["severity"] is None

    def test_last_active_yesterday_no_gap(self, db, sample_user):
        streak = Streak(
            id=uuid.uuid4(),
            user_id=sample_user.id,
            current_streak=5,
            best_streak=5,
            last_active_date="2026-01-09",
        )
        db.add(streak)
        db.flush()

        result = detect_absence_gap(db, sample_user.id, "2026-01-10")
        assert result["effective_gap"] == 0
        assert result["severity"] is None

    def test_same_day_no_gap(self, db, sample_user):
        streak = Streak(
            id=uuid.uuid4(),
            user_id=sample_user.id,
            current_streak=5,
            best_streak=5,
            last_active_date="2026-01-10",
        )
        db.add(streak)
        db.flush()

        result = detect_absence_gap(db, sample_user.id, "2026-01-10")
        assert result["effective_gap"] == 0
        assert result["severity"] is None

    def test_three_day_gap_medium(self, db, sample_user):
        # Last active Jan 5, today Jan 10 = 5 gap_days, effective = 5-1 = 4
        streak = Streak(
            id=uuid.uuid4(),
            user_id=sample_user.id,
            current_streak=5,
            best_streak=5,
            last_active_date="2026-01-05",
        )
        db.add(streak)
        db.flush()

        result = detect_absence_gap(db, sample_user.id, "2026-01-10")
        assert result["gap_days"] == 5
        assert result["effective_gap"] == 4
        assert result["severity"] == "medium"

    def test_off_days_subtracted(self, db, sample_user):
        # Last active Jan 5, today Jan 10 = 5 gap_days
        # 3 off-days in gap (Jan 6, 7, 8) -> effective = 5-1-3 = 1
        streak = Streak(
            id=uuid.uuid4(),
            user_id=sample_user.id,
            current_streak=5,
            best_streak=5,
            last_active_date="2026-01-05",
        )
        db.add(streak)
        db.flush()

        for d in ["2026-01-06", "2026-01-07", "2026-01-08"]:
            db.add(OffDay(
                id=uuid.uuid4(),
                user_id=sample_user.id,
                off_date=d,
                reason="rest",
            ))
        db.flush()

        result = detect_absence_gap(db, sample_user.id, "2026-01-10")
        assert result["off_days_in_gap"] == 3
        assert result["effective_gap"] == 1
        assert result["severity"] == "mild"

    def test_all_off_days_no_roast(self, db, sample_user):
        # Last active Jan 8, today Jan 10 = 2 gap_days
        # 1 off-day in gap (Jan 9) -> effective = 2-1-1 = 0
        streak = Streak(
            id=uuid.uuid4(),
            user_id=sample_user.id,
            current_streak=5,
            best_streak=5,
            last_active_date="2026-01-08",
        )
        db.add(streak)
        db.flush()

        db.add(OffDay(
            id=uuid.uuid4(),
            user_id=sample_user.id,
            off_date="2026-01-09",
            reason="vacation",
        ))
        db.flush()

        result = detect_absence_gap(db, sample_user.id, "2026-01-10")
        assert result["effective_gap"] == 0
        assert result["severity"] is None

    def test_null_last_active_no_gap(self, db, sample_user):
        streak = Streak(
            id=uuid.uuid4(),
            user_id=sample_user.id,
            current_streak=0,
            best_streak=0,
            last_active_date=None,
        )
        db.add(streak)
        db.flush()

        result = detect_absence_gap(db, sample_user.id, "2026-01-10")
        assert result["effective_gap"] == 0
        assert result["severity"] is None


class TestGetWelcomeStatus:
    @pytest.fixture()
    def seeded_quotes(self, db):
        """Add welcome_back and roast quotes for testing."""
        db.add(Quote(
            id=uuid.uuid4(),
            character="goku",
            quote_text="Hey, you're back!",
            source_saga="Saiyan Saga",
            trigger_event="welcome_back",
        ))
        db.add(Quote(
            id=uuid.uuid4(),
            character="vegeta",
            quote_text="Pathetic. Where were you?",
            source_saga="Saiyan Saga",
            trigger_event="roast",
            severity="mild",
        ))
        db.add(Quote(
            id=uuid.uuid4(),
            character="vegeta",
            quote_text="You call yourself a warrior?",
            source_saga="Cell Saga",
            trigger_event="roast",
            severity="medium",
        ))
        db.add(Quote(
            id=uuid.uuid4(),
            character="vegeta",
            quote_text="Absolutely disgraceful!",
            source_saga="Buu Saga",
            trigger_event="roast",
            severity="savage",
        ))
        db.flush()

    def test_no_gap_returns_both_null(self, db, sample_user, seeded_quotes):
        streak = Streak(
            id=uuid.uuid4(),
            user_id=sample_user.id,
            current_streak=5,
            best_streak=5,
            last_active_date="2026-01-09",
        )
        db.add(streak)
        db.flush()

        result = get_welcome_status(db, sample_user.id, "2026-01-10")
        assert result["welcome_back"] is None
        assert result["roast"] is None

    def test_gap_returns_welcome_and_roast(self, db, sample_user, seeded_quotes):
        # 4-day gap -> medium severity
        streak = Streak(
            id=uuid.uuid4(),
            user_id=sample_user.id,
            current_streak=5,
            best_streak=5,
            last_active_date="2026-01-05",
        )
        db.add(streak)
        db.flush()

        result = get_welcome_status(db, sample_user.id, "2026-01-10")
        assert result["welcome_back"] is not None
        assert result["welcome_back"]["character"] == "goku"
        assert result["roast"] is not None
        assert result["roast"]["severity"] == "medium"
        assert result["roast"]["quote"]["character"] == "vegeta"

    def test_large_gap_savage(self, db, sample_user, seeded_quotes):
        # 20-day gap -> savage
        streak = Streak(
            id=uuid.uuid4(),
            user_id=sample_user.id,
            current_streak=5,
            best_streak=5,
            last_active_date="2025-12-20",
        )
        db.add(streak)
        db.flush()

        result = get_welcome_status(db, sample_user.id, "2026-01-10")
        assert result["roast"] is not None
        assert result["roast"]["severity"] == "savage"
