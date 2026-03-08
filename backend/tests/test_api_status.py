"""API tests for GET /api/v1/status endpoint."""

import uuid

import pytest

from app.models.habit import Habit
from app.models.habit_streak import HabitStreak
from app.models.off_day import OffDay
from app.models.quote import Quote
from app.models.streak import Streak


@pytest.fixture()
def seeded_status_quotes(db):
    """Seed welcome_back and roast quotes for testing."""
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
        quote_text="Pathetic.",
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
        quote_text="Disgraceful!",
        source_saga="Buu Saga",
        trigger_event="roast",
        severity="savage",
    ))
    db.flush()


class TestGetStatus:
    def test_no_gap_returns_null(self, client, db, sample_user, seeded_status_quotes):
        # Set up streak with last_active_date = yesterday
        streak = Streak(
            id=uuid.uuid4(),
            user_id=sample_user.id,
            current_streak=5,
            best_streak=5,
            last_active_date="2026-01-09",
        )
        db.add(streak)
        db.flush()

        response = client.get("/api/v1/status/?local_date=2026-01-10")
        assert response.status_code == 200
        data = response.json()
        assert data["welcome_back"] is None
        assert data["roast"] is None

    def test_gap_returns_welcome_and_roast(self, client, db, sample_user, seeded_status_quotes):
        # 5-day gap -> effective = 4 -> medium severity
        streak = Streak(
            id=uuid.uuid4(),
            user_id=sample_user.id,
            current_streak=5,
            best_streak=5,
            last_active_date="2026-01-05",
        )
        db.add(streak)
        db.flush()

        response = client.get("/api/v1/status/?local_date=2026-01-10")
        assert response.status_code == 200
        data = response.json()
        assert data["welcome_back"] is not None
        assert data["welcome_back"]["character"] == "goku"
        assert data["roast"] is not None
        assert data["roast"]["severity"] == "medium"
        assert data["roast"]["quote"]["character"] == "vegeta"

    def test_missing_local_date_returns_422(self, client):
        response = client.get("/api/v1/status/")
        assert response.status_code == 422

    def test_invalid_date_format_returns_422(self, client):
        response = client.get("/api/v1/status/?local_date=not-a-date")
        assert response.status_code == 422

    def test_new_user_no_gap(self, client, db, sample_user, seeded_status_quotes):
        # No streak record at all -> no gap
        response = client.get("/api/v1/status/?local_date=2026-01-10")
        assert response.status_code == 200
        data = response.json()
        assert data["welcome_back"] is None
        assert data["roast"] is None

    def test_streak_breaks_empty_by_default(self, client, db, sample_user, seeded_status_quotes):
        """Status response includes streak_breaks as empty list when no breaks."""
        response = client.get("/api/v1/status/?local_date=2026-01-10")
        assert response.status_code == 200
        data = response.json()
        assert data["streak_breaks"] == []


class TestStreakBreaks:
    def test_no_breaks_when_no_habits(self, client, db, sample_user):
        """No habits → empty streak_breaks."""
        response = client.get("/api/v1/status/?local_date=2026-01-10")
        assert response.status_code == 200
        data = response.json()
        assert data["streak_breaks"] == []

    def test_break_detected(self, client, db, sample_user):
        """Habit with streak gap > 1 day (no off-days) → break detected."""
        habit = Habit(
            id=uuid.uuid4(),
            user_id=sample_user.id,
            title="Broken Streak Habit",
            attribute="str",
            start_date="2026-01-01",
        )
        db.add(habit)
        db.flush()

        hs = HabitStreak(
            id=uuid.uuid4(),
            user_id=sample_user.id,
            habit_id=habit.id,
            current_streak=10,
            best_streak=10,
            last_completed_date="2026-01-07",  # 3-day gap to 2026-01-10
        )
        db.add(hs)
        db.flush()

        response = client.get("/api/v1/status/?local_date=2026-01-10")
        assert response.status_code == 200
        data = response.json()
        assert len(data["streak_breaks"]) == 1
        brk = data["streak_breaks"][0]
        assert brk["habit_id"] == str(habit.id)
        assert brk["habit_title"] == "Broken Streak Habit"
        assert brk["old_streak"] == 10
        assert brk["halved_value"] == 5

    def test_no_break_when_consecutive(self, client, db, sample_user):
        """Habit completed yesterday → no break."""
        habit = Habit(
            id=uuid.uuid4(),
            user_id=sample_user.id,
            title="Active Habit",
            attribute="vit",
            start_date="2026-01-01",
        )
        db.add(habit)
        db.flush()

        hs = HabitStreak(
            id=uuid.uuid4(),
            user_id=sample_user.id,
            habit_id=habit.id,
            current_streak=5,
            best_streak=5,
            last_completed_date="2026-01-09",  # yesterday
        )
        db.add(hs)
        db.flush()

        response = client.get("/api/v1/status/?local_date=2026-01-10")
        data = response.json()
        assert len(data["streak_breaks"]) == 0

    def test_off_days_prevent_break(self, client, db, sample_user):
        """Off-days filling the gap → no break detected."""
        habit = Habit(
            id=uuid.uuid4(),
            user_id=sample_user.id,
            title="Off Day Habit",
            attribute="ki",
            start_date="2026-01-01",
        )
        db.add(habit)
        db.flush()

        hs = HabitStreak(
            id=uuid.uuid4(),
            user_id=sample_user.id,
            habit_id=habit.id,
            current_streak=7,
            best_streak=7,
            last_completed_date="2026-01-07",  # 3-day gap to 2026-01-10
        )
        db.add(hs)

        # Fill gap with off-days (Jan 8 and Jan 9)
        od1 = OffDay(
            id=uuid.uuid4(),
            user_id=sample_user.id,
            off_date="2026-01-08",
            reason="rest",
        )
        od2 = OffDay(
            id=uuid.uuid4(),
            user_id=sample_user.id,
            off_date="2026-01-09",
            reason="rest",
        )
        db.add_all([od1, od2])
        db.flush()

        response = client.get("/api/v1/status/?local_date=2026-01-10")
        data = response.json()
        assert len(data["streak_breaks"]) == 0

    def test_halved_value_calculation(self, client, db, sample_user):
        """Verify halved_value = old_streak // 2 for various values."""
        test_cases = [(10, 5), (7, 3), (1, 0), (3, 1)]

        for old_streak, expected_halved in test_cases:
            habit = Habit(
                id=uuid.uuid4(),
                user_id=sample_user.id,
                title=f"Streak {old_streak}",
                attribute="str",
                start_date="2026-01-01",
            )
            db.add(habit)
            db.flush()

            hs = HabitStreak(
                id=uuid.uuid4(),
                user_id=sample_user.id,
                habit_id=habit.id,
                current_streak=old_streak,
                best_streak=old_streak,
                last_completed_date="2026-01-05",  # 5-day gap
            )
            db.add(hs)
            db.flush()

        response = client.get("/api/v1/status/?local_date=2026-01-10")
        data = response.json()
        breaks_by_title = {b["habit_title"]: b for b in data["streak_breaks"]}

        for old_streak, expected_halved in test_cases:
            title = f"Streak {old_streak}"
            assert title in breaks_by_title, f"Expected break for {title}"
            assert breaks_by_title[title]["old_streak"] == old_streak
            assert breaks_by_title[title]["halved_value"] == expected_halved

    def test_zero_streak_not_included(self, client, db, sample_user):
        """Habits with current_streak=0 should not appear in streak_breaks."""
        habit = Habit(
            id=uuid.uuid4(),
            user_id=sample_user.id,
            title="Zero Streak",
            attribute="int",
            start_date="2026-01-01",
        )
        db.add(habit)
        db.flush()

        hs = HabitStreak(
            id=uuid.uuid4(),
            user_id=sample_user.id,
            habit_id=habit.id,
            current_streak=0,
            best_streak=5,
            last_completed_date="2026-01-05",
        )
        db.add(hs)
        db.flush()

        response = client.get("/api/v1/status/?local_date=2026-01-10")
        data = response.json()
        assert len(data["streak_breaks"]) == 0
