"""Tests for Off-Day management endpoints."""

import pytest


class TestOffDayMark:
    def test_mark_off_day(self, client):
        resp = client.post("/api/v1/off-days/", json={
            "local_date": "2026-03-04",
            "reason": "rest",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["off_date"] == "2026-03-04"
        assert "habits_reversed" in data
        assert "xp_clawed_back" in data

    def test_mark_duplicate_off_day(self, client):
        client.post("/api/v1/off-days/", json={"local_date": "2026-03-05"})
        resp = client.post("/api/v1/off-days/", json={"local_date": "2026-03-05"})
        assert resp.status_code == 409


class TestOffDayList:
    def test_list_off_days(self, client):
        client.post("/api/v1/off-days/", json={"local_date": "2026-03-01"})
        client.post("/api/v1/off-days/", json={"local_date": "2026-03-02"})
        resp = client.get("/api/v1/off-days/")
        assert resp.status_code == 200
        assert len(resp.json()) == 2

    def test_list_off_days_by_month(self, client):
        client.post("/api/v1/off-days/", json={"local_date": "2026-03-10"})
        client.post("/api/v1/off-days/", json={"local_date": "2026-04-10"})
        resp = client.get("/api/v1/off-days/?month=2026-03")
        assert resp.status_code == 200
        assert len(resp.json()) == 1


class TestOffDayCancel:
    def test_cancel_off_day(self, client):
        client.post("/api/v1/off-days/", json={"local_date": "2026-03-06"})
        resp = client.delete("/api/v1/off-days/2026-03-06")
        assert resp.status_code == 204

    def test_cancel_nonexistent(self, client):
        resp = client.delete("/api/v1/off-days/2026-01-01")
        assert resp.status_code == 404
