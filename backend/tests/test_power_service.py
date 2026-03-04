"""Tests for power_service — power level calculation and transformation lookup."""

import uuid

import pytest

from app.models.daily_log import DailyLog
from app.services.power_service import (
    check_transformation_change,
    get_transformation_for_power,
    recalculate_power_level,
)


class TestGetTransformationForPower:
    """get_transformation_for_power returns correct form for power level."""

    def test_base_at_zero(self):
        result = get_transformation_for_power(0)
        assert result["key"] == "base"

    def test_ssj_at_threshold(self):
        result = get_transformation_for_power(1000)
        assert result["key"] == "ssj"

    def test_ssj2_at_threshold(self):
        result = get_transformation_for_power(3000)
        assert result["key"] == "ssj2"

    def test_beast_at_threshold(self):
        result = get_transformation_for_power(150_000)
        assert result["key"] == "beast"

    def test_base_just_below_ssj(self):
        result = get_transformation_for_power(999)
        assert result["key"] == "base"

    def test_ssj_between_thresholds(self):
        result = get_transformation_for_power(1500)
        assert result["key"] == "ssj"

    def test_beast_above_max(self):
        result = get_transformation_for_power(999_999)
        assert result["key"] == "beast"

    def test_returns_full_dict(self):
        result = get_transformation_for_power(1000)
        assert result == {"key": "ssj", "name": "Super Saiyan", "threshold": 1000}


class TestCheckTransformationChange:
    """check_transformation_change detects threshold crossings."""

    def test_detects_new_transformation(self):
        result = check_transformation_change("base", 1000)
        assert result is not None
        assert result["key"] == "ssj"
        assert result["name"] == "Super Saiyan"
        assert result["threshold"] == 1000

    def test_returns_none_when_same(self):
        result = check_transformation_change("ssj", 1500)
        assert result is None

    def test_detects_beast_from_ue(self):
        result = check_transformation_change("ue", 150_000)
        assert result is not None
        assert result["key"] == "beast"


class TestRecalculatePowerLevel:
    """recalculate_power_level sums all DailyLog.xp_earned."""

    def test_sums_all_daily_xp(self, db, sample_user):
        for i, xp in enumerate([100, 200, 300]):
            log = DailyLog(
                id=uuid.uuid4(),
                user_id=sample_user.id,
                log_date=f"2026-01-0{i + 1}",
                xp_earned=xp,
            )
            db.add(log)
        db.flush()

        total = recalculate_power_level(db, sample_user)
        assert total == 600
        assert sample_user.power_level == 600

    def test_returns_zero_with_no_logs(self, db, sample_user):
        total = recalculate_power_level(db, sample_user)
        assert total == 0
        assert sample_user.power_level == 0

    def test_updates_user_power_level(self, db, sample_user):
        log = DailyLog(
            id=uuid.uuid4(),
            user_id=sample_user.id,
            log_date="2026-01-01",
            xp_earned=5000,
        )
        db.add(log)
        db.flush()

        recalculate_power_level(db, sample_user)
        assert sample_user.power_level == 5000
