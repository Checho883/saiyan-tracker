"""API tests for GET /api/v1/status endpoint."""

import uuid

import pytest

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
