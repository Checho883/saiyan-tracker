"""Tests for game constants — values, types, and importability."""

from app.core.constants import (
    TRANSFORMATIONS,
    IMPORTANCE_XP,
    COMPLETION_TIERS,
    STREAK_BONUS_PER_DAY,
    STREAK_BONUS_CAP,
    CAPSULE_DROP_CHANCE,
    CAPSULE_RARITY_WEIGHTS,
    DRAGON_BALLS_REQUIRED,
    ATTRIBUTE_TITLES,
    VALID_IMPORTANCES,
    VALID_ATTRIBUTES,
    VALID_FREQUENCIES,
    VALID_TRANSFORMATIONS,
    VALID_OFF_DAY_REASONS,
    VALID_RARITIES,
    VALID_CHARACTERS,
    VALID_TRIGGER_EVENTS,
    VALID_SEVERITIES,
    VALID_THEMES,
    VALID_COMPLETION_TIERS,
)


def test_transformations_count():
    """10 transformations defined."""
    assert len(TRANSFORMATIONS) == 10


def test_transformation_thresholds():
    """First threshold is 0, last is 150000."""
    assert TRANSFORMATIONS[0]["threshold"] == 0
    assert TRANSFORMATIONS[-1]["threshold"] == 150_000


def test_importance_xp_values():
    """normal=15, important=22, critical=30."""
    assert IMPORTANCE_XP["normal"] == 15
    assert IMPORTANCE_XP["important"] == 22
    assert IMPORTANCE_XP["critical"] == 30


def test_completion_tiers():
    """4 tiers, highest multiplier is 2.0."""
    assert len(COMPLETION_TIERS) == 4
    multipliers = [t["multiplier"] for t in COMPLETION_TIERS]
    assert max(multipliers) == 2.0


def test_streak_constants():
    """STREAK_BONUS_PER_DAY=0.05, cap=1.0."""
    assert STREAK_BONUS_PER_DAY == 0.05
    assert STREAK_BONUS_CAP == 1.0


def test_capsule_constants():
    """drop_chance=0.25, rarity weights sum to 1.0."""
    assert CAPSULE_DROP_CHANCE == 0.25
    total = sum(CAPSULE_RARITY_WEIGHTS.values())
    assert abs(total - 1.0) < 0.001


def test_valid_enums():
    """All VALID_* lists are non-empty."""
    for name, values in [
        ("VALID_IMPORTANCES", VALID_IMPORTANCES),
        ("VALID_ATTRIBUTES", VALID_ATTRIBUTES),
        ("VALID_FREQUENCIES", VALID_FREQUENCIES),
        ("VALID_TRANSFORMATIONS", VALID_TRANSFORMATIONS),
        ("VALID_OFF_DAY_REASONS", VALID_OFF_DAY_REASONS),
        ("VALID_RARITIES", VALID_RARITIES),
        ("VALID_CHARACTERS", VALID_CHARACTERS),
        ("VALID_TRIGGER_EVENTS", VALID_TRIGGER_EVENTS),
        ("VALID_SEVERITIES", VALID_SEVERITIES),
        ("VALID_THEMES", VALID_THEMES),
        ("VALID_COMPLETION_TIERS", VALID_COMPLETION_TIERS),
    ]:
        assert len(values) > 0, f"{name} is empty"


def test_dragon_balls_required():
    """Dragon Balls required == 7."""
    assert DRAGON_BALLS_REQUIRED == 7


def test_attribute_titles():
    """All 4 attributes have title entries."""
    for attr in ("str", "vit", "int", "ki"):
        assert attr in ATTRIBUTE_TITLES, f"Missing attribute titles for '{attr}'"
        assert len(ATTRIBUTE_TITLES[attr]) > 0
