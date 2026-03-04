"""Attribute leveling service — level calculation, title lookup, XP thresholds."""

import math

from app.core.constants import (
    ATTRIBUTE_LEVEL_BASE_XP,
    ATTRIBUTE_LEVEL_FORMULA_EXPONENT,
    ATTRIBUTE_TITLES,
)


def calc_attribute_level(total_xp: int) -> int:
    """Calculate attribute level from cumulative XP.

    Each level N costs floor(ATTRIBUTE_LEVEL_BASE_XP * N^ATTRIBUTE_LEVEL_FORMULA_EXPONENT) XP.
    Iteratively sums costs until the next level would exceed remaining XP.
    """
    level = 0
    xp_consumed = 0
    while True:
        next_level = level + 1
        cost = math.floor(
            ATTRIBUTE_LEVEL_BASE_XP * (next_level ** ATTRIBUTE_LEVEL_FORMULA_EXPONENT)
        )
        if xp_consumed + cost > total_xp:
            break
        xp_consumed += cost
        level = next_level
    return level


def get_attribute_title(attribute: str, level: int) -> str | None:
    """Return the highest unlocked title for the given attribute and level.

    Iterates thresholds in ascending order. Returns None if below all thresholds.
    """
    titles = ATTRIBUTE_TITLES.get(attribute, {})
    current_title = None
    for threshold in sorted(titles.keys()):
        if level >= threshold:
            current_title = titles[threshold]
        else:
            break
    return current_title


def get_xp_for_next_level(current_level: int) -> int:
    """Return XP cost to reach the next level from current_level.

    Formula: floor(ATTRIBUTE_LEVEL_BASE_XP * (current_level + 1)^ATTRIBUTE_LEVEL_FORMULA_EXPONENT)
    """
    next_level = current_level + 1
    return math.floor(
        ATTRIBUTE_LEVEL_BASE_XP * (next_level ** ATTRIBUTE_LEVEL_FORMULA_EXPONENT)
    )
