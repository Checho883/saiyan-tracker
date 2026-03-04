"""Tests for XP calculation service — daily XP, tier lookup, attribute XP, streak bonus."""

import pytest

from app.services.xp_service import (
    calc_daily_xp,
    calc_streak_bonus,
    get_attribute_xp,
    get_completion_tier,
)


# --- calc_daily_xp ---


class TestCalcDailyXp:
    """Daily XP formula: floor(BASE_DAILY_XP * rate * tier_mult * (1 + streak_bonus) [* zenkai])."""

    @pytest.mark.parametrize(
        "rate, streak, zenkai, expected",
        [
            # 100% completion, no streak, no zenkai => 100 * 1.0 * 2.0 * 1.0 = 200
            (1.0, 0, False, 200),
            # 80% completion, 10-day streak (+50%), no zenkai => 100 * 0.8 * 1.5 * 1.5 = 180
            (0.8, 10, False, 180),
            # 50% completion, no streak => 100 * 0.5 * 1.2 * 1.0 = 60
            (0.5, 0, False, 60),
            # 30% completion, no streak => 100 * 0.3 * 1.0 * 1.0 = 30
            (0.3, 0, False, 30),
            # 100% + 20-day streak (capped 100%) + zenkai => 100 * 1.0 * 2.0 * 2.0 * 1.5 = 600
            (1.0, 20, True, 600),
            # Zero completion = zero XP
            (0.0, 0, False, 0),
        ],
        ids=[
            "perfect-no-streak",
            "80pct-10day-streak",
            "50pct-no-streak",
            "30pct-no-streak",
            "perfect-capped-streak-zenkai",
            "zero-completion",
        ],
    )
    def test_calc_daily_xp(self, rate, streak, zenkai, expected):
        assert calc_daily_xp(rate, streak, zenkai) == expected

    def test_returns_int(self):
        result = calc_daily_xp(0.73, 3, False)
        assert isinstance(result, int)


# --- get_completion_tier ---


class TestGetCompletionTier:
    """Tier lookup returns the highest matching tier by min_rate."""

    @pytest.mark.parametrize(
        "rate, expected_name, expected_mult",
        [
            (1.0, "kaio_x20", 2.0),
            (0.8, "kaio_x10", 1.5),
            (0.5, "kaio_x3", 1.2),
            (0.3, "base", 1.0),
            (0.0, "base", 1.0),
        ],
        ids=["100pct", "80pct", "50pct", "30pct", "0pct"],
    )
    def test_tier_lookup(self, rate, expected_name, expected_mult):
        tier = get_completion_tier(rate)
        assert tier["name"] == expected_name
        assert tier["multiplier"] == expected_mult

    def test_returns_dict_with_required_keys(self):
        tier = get_completion_tier(0.9)
        assert "min_rate" in tier
        assert "multiplier" in tier
        assert "name" in tier
        assert "label" in tier


# --- get_attribute_xp ---


class TestGetAttributeXp:
    """Attribute XP lookup by importance level."""

    @pytest.mark.parametrize(
        "importance, expected",
        [
            ("normal", 15),
            ("important", 22),
            ("critical", 30),
        ],
    )
    def test_attribute_xp(self, importance, expected):
        assert get_attribute_xp(importance) == expected

    def test_invalid_importance_raises(self):
        with pytest.raises(KeyError):
            get_attribute_xp("legendary")


# --- calc_streak_bonus ---


class TestCalcStreakBonus:
    """Streak bonus: +5% per day, capped at +100%."""

    @pytest.mark.parametrize(
        "streak, expected",
        [
            (0, 0.0),
            (10, 0.5),
            (20, 1.0),
            (100, 1.0),
        ],
        ids=["zero", "10days", "20days-capped", "100days-still-capped"],
    )
    def test_streak_bonus(self, streak, expected):
        assert calc_streak_bonus(streak) == expected
