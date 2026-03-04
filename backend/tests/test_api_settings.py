"""Tests for Settings GET/PUT endpoints."""

import pytest


class TestSettingsGet:
    def test_get_settings(self, client):
        resp = client.get("/api/v1/settings/")
        assert resp.status_code == 200
        data = resp.json()
        assert "display_name" in data
        assert "sound_enabled" in data
        assert "theme" in data


class TestSettingsUpdate:
    def test_partial_update(self, client):
        resp = client.put("/api/v1/settings/", json={"display_name": "Kakarot"})
        assert resp.status_code == 200
        assert resp.json()["display_name"] == "Kakarot"

    def test_full_update(self, client):
        resp = client.put("/api/v1/settings/", json={
            "display_name": "Vegeta",
            "sound_enabled": False,
            "theme": "light",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["display_name"] == "Vegeta"
        assert data["sound_enabled"] is False
        assert data["theme"] == "light"
