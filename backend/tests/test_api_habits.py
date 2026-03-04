"""Tests for Habit endpoints — CRUD, check, today/list, calendar, contribution-graph."""

import uuid
from datetime import date, timedelta

import pytest


class TestHabitCRUD:
    def test_create_habit(self, client):
        resp = client.post("/api/v1/habits/", json={
            "title": "Morning Training",
            "attribute": "str",
            "importance": "critical",
            "start_date": "2026-01-01",
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["title"] == "Morning Training"
        assert data["attribute"] == "str"
        assert data["importance"] == "critical"
        assert data["is_active"] is True
        assert "id" in data

    def test_list_habits(self, client):
        client.post("/api/v1/habits/", json={
            "title": "Habit A",
            "attribute": "str",
            "start_date": "2026-01-01",
        })
        client.post("/api/v1/habits/", json={
            "title": "Habit B",
            "attribute": "vit",
            "start_date": "2026-01-01",
        })
        resp = client.get("/api/v1/habits/")
        assert resp.status_code == 200
        # At least 2 plus any from conftest sample_habit
        titles = [h["title"] for h in resp.json()]
        assert "Habit A" in titles
        assert "Habit B" in titles

    def test_get_habit(self, client):
        create_resp = client.post("/api/v1/habits/", json={
            "title": "Solo Habit",
            "attribute": "ki",
            "start_date": "2026-01-01",
        })
        habit_id = create_resp.json()["id"]
        resp = client.get(f"/api/v1/habits/{habit_id}")
        assert resp.status_code == 200
        assert resp.json()["title"] == "Solo Habit"

    def test_get_habit_not_found(self, client):
        fake_id = str(uuid.uuid4())
        resp = client.get(f"/api/v1/habits/{fake_id}")
        assert resp.status_code == 404

    def test_update_habit(self, client):
        create_resp = client.post("/api/v1/habits/", json={
            "title": "Old Title",
            "attribute": "int",
            "start_date": "2026-01-01",
        })
        habit_id = create_resp.json()["id"]
        resp = client.put(f"/api/v1/habits/{habit_id}", json={
            "title": "New Title",
        })
        assert resp.status_code == 200
        assert resp.json()["title"] == "New Title"

    def test_delete_habit_soft(self, client):
        create_resp = client.post("/api/v1/habits/", json={
            "title": "To Delete",
            "attribute": "vit",
            "start_date": "2026-01-01",
        })
        habit_id = create_resp.json()["id"]
        resp = client.delete(f"/api/v1/habits/{habit_id}")
        assert resp.status_code == 204
        # Soft-deleted habit should not appear in list or get
        get_resp = client.get(f"/api/v1/habits/{habit_id}")
        assert get_resp.status_code == 404


class TestCheckHabit:
    def test_check_habit(self, client, db, sample_user):
        """Create a daily habit and check it — verify full composite response."""
        today = date.today().isoformat()
        create_resp = client.post("/api/v1/habits/", json={
            "title": "Check Me",
            "attribute": "str",
            "importance": "critical",
            "start_date": "2026-01-01",
        })
        habit_id = create_resp.json()["id"]

        resp = client.post(f"/api/v1/habits/{habit_id}/check", json={
            "local_date": today,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["is_checking"] is True
        assert data["habit_id"] == habit_id
        assert data["log_date"] == today
        assert "attribute_xp_awarded" in data
        assert data["attribute_xp_awarded"] > 0
        assert "daily_log" in data
        assert "habits_due" in data["daily_log"]
        assert "completion_rate" in data["daily_log"]
        assert "streak" in data
        assert "current_streak" in data["streak"]
        assert "habit_streak" in data
        assert "power_level" in data
        assert "transformation" in data

    def test_check_habit_off_day(self, client, db, sample_user):
        """Checking on off day returns 409."""
        today = date.today().isoformat()
        # Mark off day
        client.post("/api/v1/off-days/", json={"local_date": today})

        create_resp = client.post("/api/v1/habits/", json={
            "title": "Off Day Test",
            "attribute": "str",
            "start_date": "2026-01-01",
        })
        habit_id = create_resp.json()["id"]

        resp = client.post(f"/api/v1/habits/{habit_id}/check", json={
            "local_date": today,
        })
        assert resp.status_code == 409

    def test_check_habit_not_due(self, client, db, sample_user):
        """Checking a weekday habit on weekend returns 422."""
        # Create weekdays-only habit
        create_resp = client.post("/api/v1/habits/", json={
            "title": "Weekday Only",
            "attribute": "str",
            "frequency": "weekdays",
            "start_date": "2026-01-01",
        })
        habit_id = create_resp.json()["id"]

        # Find a Saturday
        today = date.today()
        days_until_sat = (5 - today.weekday()) % 7
        if days_until_sat == 0 and today.weekday() != 5:
            days_until_sat = 7
        # If today is already Saturday, use today; otherwise advance
        if today.weekday() == 5:
            saturday = today
        else:
            saturday = today + timedelta(days=days_until_sat)
        sat_str = saturday.isoformat()

        resp = client.post(f"/api/v1/habits/{habit_id}/check", json={
            "local_date": sat_str,
        })
        assert resp.status_code == 422

    def test_uncheck_habit(self, client, db, sample_user):
        """Check then check again toggles to unchecked."""
        today = date.today().isoformat()
        create_resp = client.post("/api/v1/habits/", json={
            "title": "Toggle Me",
            "attribute": "vit",
            "start_date": "2026-01-01",
        })
        habit_id = create_resp.json()["id"]

        # First check
        client.post(f"/api/v1/habits/{habit_id}/check", json={"local_date": today})
        # Second check (uncheck)
        resp = client.post(f"/api/v1/habits/{habit_id}/check", json={"local_date": today})
        data = resp.json()
        assert data["is_checking"] is False


class TestTodayList:
    def test_today_list(self, client, db, sample_user):
        today = date.today().isoformat()
        create_resp = client.post("/api/v1/habits/", json={
            "title": "Today Habit",
            "attribute": "str",
            "start_date": "2026-01-01",
        })
        habit_id = create_resp.json()["id"]

        # Check the habit
        client.post(f"/api/v1/habits/{habit_id}/check", json={"local_date": today})

        resp = client.get(f"/api/v1/habits/today/list?local_date={today}")
        assert resp.status_code == 200
        habits = resp.json()
        assert len(habits) >= 1
        matched = [h for h in habits if h["id"] == habit_id]
        assert len(matched) == 1
        assert matched[0]["completed"] is True
        assert "streak_current" in matched[0]
        assert "streak_best" in matched[0]


class TestCalendar:
    def test_calendar(self, client, db, sample_user):
        today = date.today()
        today_str = today.isoformat()
        month_str = today_str[:7]  # YYYY-MM

        # Create habit and check it
        create_resp = client.post("/api/v1/habits/", json={
            "title": "Calendar Habit",
            "attribute": "ki",
            "start_date": "2026-01-01",
        })
        habit_id = create_resp.json()["id"]
        client.post(f"/api/v1/habits/{habit_id}/check", json={"local_date": today_str})

        resp = client.get(f"/api/v1/habits/calendar/all?month={month_str}")
        assert resp.status_code == 200
        days = resp.json()
        assert len(days) >= 1
        today_entry = [d for d in days if d["date"] == today_str]
        assert len(today_entry) == 1
        assert "is_perfect_day" in today_entry[0]
        assert "completion_tier" in today_entry[0]
        assert "xp_earned" in today_entry[0]
        assert "is_off_day" in today_entry[0]


class TestContributionGraph:
    def test_contribution_graph(self, client, db, sample_user):
        today = date.today()
        today_str = today.isoformat()

        create_resp = client.post("/api/v1/habits/", json={
            "title": "Graph Habit",
            "attribute": "int",
            "start_date": "2026-01-01",
        })
        habit_id = create_resp.json()["id"]

        # Check habit for today
        client.post(f"/api/v1/habits/{habit_id}/check", json={"local_date": today_str})

        resp = client.get(f"/api/v1/habits/{habit_id}/contribution-graph?days=90")
        assert resp.status_code == 200
        days = resp.json()
        assert len(days) == 90
        today_entry = [d for d in days if d["date"] == today_str]
        assert len(today_entry) == 1
        assert today_entry[0]["completed"] is True

    def test_contribution_graph_not_found(self, client):
        fake_id = str(uuid.uuid4())
        resp = client.get(f"/api/v1/habits/{fake_id}/contribution-graph?days=30")
        assert resp.status_code == 404
