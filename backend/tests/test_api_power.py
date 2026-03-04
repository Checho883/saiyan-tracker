"""Tests for Power and Attributes endpoints."""

import uuid

import pytest


class TestPowerCurrent:
    def test_power_current_default(self, client, sample_user):
        """Fresh user has power_level=0, base transformation, all attrs at level 0."""
        resp = client.get("/api/v1/power/current")
        assert resp.status_code == 200
        data = resp.json()
        assert data["power_level"] == 0
        assert data["transformation"] == "base"
        assert data["transformation_name"] == "Base Saiyan"
        assert data["dragon_balls_collected"] == 0
        assert data["wishes_granted"] == 0
        assert len(data["attributes"]) == 4
        attr_names = [a["attribute"] for a in data["attributes"]]
        assert set(attr_names) == {"str", "vit", "int", "ki"}
        for attr in data["attributes"]:
            assert attr["raw_xp"] == 0
            assert attr["level"] == 0
            assert attr["progress_percent"] == 0.0

    def test_power_current_with_xp(self, client, db, sample_user):
        """User with XP has level > 0 and progress_percent in 0-100."""
        sample_user.str_xp = 500
        db.flush()
        resp = client.get("/api/v1/power/current")
        assert resp.status_code == 200
        data = resp.json()
        str_attr = [a for a in data["attributes"] if a["attribute"] == "str"][0]
        assert str_attr["raw_xp"] == 500
        assert str_attr["level"] > 0
        assert str_attr["title"] is not None or str_attr["level"] < 5
        assert 0 <= str_attr["progress_percent"] <= 100


class TestAttributes:
    def test_attributes_list(self, client, sample_user):
        """Returns exactly 4 attributes."""
        resp = client.get("/api/v1/attributes/")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 4
        names = [a["attribute"] for a in data]
        assert set(names) == {"str", "vit", "int", "ki"}
        for attr in data:
            assert "raw_xp" in attr
            assert "level" in attr
            assert "xp_for_current_level" in attr
            assert "xp_for_next_level" in attr
            assert "progress_percent" in attr
