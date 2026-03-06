"""Tests for achievement_service — milestone detection, level-up detection, achievement recording."""

import uuid

import pytest

from app.core.constants import STREAK_MILESTONES
from app.services.achievement_service import (
    calc_attribute_level_from_xp,
    detect_attribute_level_change,
    detect_streak_milestones,
    get_milestone_badge_name,
    record_achievement,
)


# ── Pure function tests ───────────────────────────────────────────────────


class TestDetectStreakMilestones:
    def test_crossing_single_milestone(self):
        assert detect_streak_milestones(5, 7) == [7]

    def test_crossing_multiple_milestones(self):
        assert detect_streak_milestones(2, 7) == [3, 7]

    def test_no_change(self):
        assert detect_streak_milestones(7, 7) == []

    def test_decrease_no_milestone(self):
        assert detect_streak_milestones(8, 5) == []

    def test_crossing_first_milestone(self):
        assert detect_streak_milestones(0, 3) == [3]

    def test_crossing_all_milestones(self):
        result = detect_streak_milestones(0, 365)
        assert result == [3, 7, 21, 30, 60, 90, 365]

    def test_just_below_milestone(self):
        assert detect_streak_milestones(6, 6) == []

    def test_from_zero_to_one(self):
        assert detect_streak_milestones(0, 1) == []

    def test_custom_milestones(self):
        assert detect_streak_milestones(0, 10, [5, 10, 15]) == [5, 10]


class TestGetMilestoneBadgeName:
    def test_first_step(self):
        assert get_milestone_badge_name(3) == "First Step"

    def test_warrior_spirit(self):
        assert get_milestone_badge_name(7) == "Warrior Spirit"

    def test_saiyan_pride(self):
        assert get_milestone_badge_name(21) == "Saiyan Pride"

    def test_elite_fighter(self):
        assert get_milestone_badge_name(30) == "Elite Fighter"

    def test_super_saiyan(self):
        assert get_milestone_badge_name(60) == "Super Saiyan"

    def test_ascended_warrior(self):
        assert get_milestone_badge_name(90) == "Ascended Warrior"

    def test_legend(self):
        assert get_milestone_badge_name(365) == "Legend"

    def test_unknown_returns_milestone_label(self):
        assert get_milestone_badge_name(999) == "Milestone 999"


class TestDetectAttributeLevelChange:
    def test_no_level_change(self):
        # Level 0 to level 0 (XP below first level threshold)
        result = detect_attribute_level_change(0, 50, "str")
        assert result is None

    def test_level_up_detected(self):
        # Level 0 requires 0 XP, level 1 costs floor(100 * 1^1.5) = 100 XP
        result = detect_attribute_level_change(0, 150, "str")
        assert result is not None
        assert result["old_level"] == 0
        assert result["new_level"] == 1
        assert result["title"] is None  # Title unlocks at level 5

    def test_level_up_with_title(self):
        # Get enough XP for level 5 (str -> "Fighter")
        # Need to find XP for level 5: sum of costs 1..5
        # Level 1: floor(100 * 1^1.5) = 100
        # Level 2: floor(100 * 2^1.5) = 282
        # Level 3: floor(100 * 3^1.5) = 519
        # Level 4: floor(100 * 4^1.5) = 800
        # Level 5: floor(100 * 5^1.5) = 1118
        # Total for level 5: 100 + 282 + 519 + 800 + 1118 = 2819
        # old_xp at level 4: 100 + 282 + 519 + 800 = 1701
        result = detect_attribute_level_change(1701, 2820, "str")
        assert result is not None
        assert result["old_level"] == 4
        assert result["new_level"] == 5
        assert result["title"] == "Fighter"

    def test_same_xp_no_change(self):
        result = detect_attribute_level_change(100, 100, "str")
        assert result is None

    def test_decrease_no_change(self):
        result = detect_attribute_level_change(200, 50, "str")
        assert result is None


# ── DB-dependent tests ────────────────────────────────────────────────────


class TestRecordAchievement:
    def test_records_new_achievement(self, db, sample_user):
        result = record_achievement(
            db, sample_user.id, "streak_milestone", "overall_streak_7",
            milestone_type="streak", metadata={"streak": 7}
        )
        assert result is not None
        assert result.achievement_type == "streak_milestone"
        assert result.achievement_key == "overall_streak_7"
        assert result.milestone_type == "streak"

    def test_deduplicates_existing(self, db, sample_user):
        # First record
        record_achievement(
            db, sample_user.id, "streak_milestone", "overall_streak_7"
        )
        # Second record (same type + key) should return None
        result = record_achievement(
            db, sample_user.id, "streak_milestone", "overall_streak_7"
        )
        assert result is None

    def test_different_keys_both_recorded(self, db, sample_user):
        r1 = record_achievement(
            db, sample_user.id, "streak_milestone", "overall_streak_3"
        )
        r2 = record_achievement(
            db, sample_user.id, "streak_milestone", "overall_streak_7"
        )
        assert r1 is not None
        assert r2 is not None

    def test_different_types_both_recorded(self, db, sample_user):
        r1 = record_achievement(
            db, sample_user.id, "streak_milestone", "overall_streak_7"
        )
        r2 = record_achievement(
            db, sample_user.id, "transformation", "ssj"
        )
        assert r1 is not None
        assert r2 is not None
