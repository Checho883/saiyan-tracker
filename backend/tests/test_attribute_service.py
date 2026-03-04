"""Tests for attribute leveling service — level calculation, title lookup, next-level XP."""

import pytest

from app.services.attribute_service import (
    calc_attribute_level,
    get_attribute_title,
    get_xp_for_next_level,
)


# --- calc_attribute_level ---


class TestCalcAttributeLevel:
    """Level from cumulative XP using 100 * level^1.5 formula per level."""

    @pytest.mark.parametrize(
        "total_xp, expected_level",
        [
            (0, 0),
            (99, 0),       # level 1 needs 100 XP
            (100, 1),      # exactly 100 XP = level 1
            (382, 2),      # level 2 needs 100*2^1.5 = 282 more, total = 100+282 = 382
            (10000, None),  # sanity: high XP gives level > 0 (checked separately)
        ],
        ids=["zero-xp", "just-below-level-1", "exactly-level-1", "exactly-level-2", "high-xp"],
    )
    def test_level_from_xp(self, total_xp, expected_level):
        if expected_level is None:
            # Sanity check: high XP should produce a positive level
            assert calc_attribute_level(total_xp) > 0
        else:
            assert calc_attribute_level(total_xp) == expected_level

    def test_returns_int(self):
        assert isinstance(calc_attribute_level(500), int)

    def test_level_increases_monotonically(self):
        """More XP should never produce a lower level."""
        prev_level = 0
        for xp in range(0, 5000, 50):
            level = calc_attribute_level(xp)
            assert level >= prev_level, f"Level decreased at XP={xp}"
            prev_level = level


# --- get_attribute_title ---


class TestGetAttributeTitle:
    """Title lookup returns highest unlocked title for attribute + level."""

    @pytest.mark.parametrize(
        "attribute, level, expected_title",
        [
            ("str", 0, None),
            ("str", 4, None),
            ("str", 5, "Fighter"),
            ("str", 7, "Fighter"),       # between thresholds
            ("str", 10, "Warrior"),
            ("str", 25, "Elite Warrior"),
            ("str", 50, "Super Elite"),
            ("str", 100, "Legendary"),
            ("str", 200, "Legendary"),   # above max threshold
            ("ki", 10, "Apprentice"),
            ("vit", 25, "Defender"),
            ("int", 50, "Mastermind"),
        ],
        ids=[
            "str-0-none",
            "str-4-none",
            "str-5-fighter",
            "str-7-fighter-between",
            "str-10-warrior",
            "str-25-elite",
            "str-50-super-elite",
            "str-100-legendary",
            "str-200-above-max",
            "ki-10-apprentice",
            "vit-25-defender",
            "int-50-mastermind",
        ],
    )
    def test_title_lookup(self, attribute, level, expected_title):
        assert get_attribute_title(attribute, level) == expected_title


# --- get_xp_for_next_level ---


class TestGetXpForNextLevel:
    """XP cost for the next level: floor(100 * (current_level + 1)^1.5)."""

    @pytest.mark.parametrize(
        "current_level, expected_xp",
        [
            (0, 100),   # level 1 costs 100 * 1^1.5 = 100
            (1, 282),   # level 2 costs 100 * 2^1.5 = 282.84 -> 282
        ],
        ids=["next-is-level-1", "next-is-level-2"],
    )
    def test_xp_for_next_level(self, current_level, expected_xp):
        assert get_xp_for_next_level(current_level) == expected_xp

    def test_returns_int(self):
        assert isinstance(get_xp_for_next_level(5), int)

    def test_cost_increases_with_level(self):
        """Higher levels should cost more XP."""
        prev_cost = 0
        for level in range(20):
            cost = get_xp_for_next_level(level)
            assert cost > prev_cost, f"Cost did not increase at level {level}"
            prev_cost = cost
