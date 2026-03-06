"""Achievement service — milestone detection, level-up detection, achievement recording."""

import uuid
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.constants import MILESTONE_BADGE_NAMES, STREAK_MILESTONES
from app.models.achievement import Achievement
from app.services.attribute_service import calc_attribute_level, get_attribute_title


def record_achievement(
    db: Session,
    user_id: UUID,
    achievement_type: str,
    achievement_key: str,
    milestone_type: str | None = None,
    metadata: dict | None = None,
) -> Achievement | None:
    """Record an achievement with check-before-insert deduplication.

    Returns the new Achievement if created, None if already exists.
    Follows service convention: flush but don't commit.
    """
    existing = (
        db.query(Achievement)
        .filter(
            Achievement.user_id == user_id,
            Achievement.achievement_type == achievement_type,
            Achievement.achievement_key == achievement_key,
        )
        .first()
    )
    if existing is not None:
        return None

    achievement = Achievement(
        id=uuid.uuid4(),
        user_id=user_id,
        achievement_type=achievement_type,
        achievement_key=achievement_key,
        milestone_type=milestone_type,
        metadata_json=metadata,
    )
    db.add(achievement)
    db.flush()
    return achievement


def detect_streak_milestones(
    old_streak: int,
    new_streak: int,
    milestones: list[int] | None = None,
) -> list[int]:
    """Return all milestone thresholds crossed between old and new streak values.

    Pure function — no DB access.
    """
    if milestones is None:
        milestones = STREAK_MILESTONES
    return [m for m in milestones if old_streak < m <= new_streak]


def detect_attribute_level_change(
    old_xp: int, new_xp: int, attribute: str
) -> dict | None:
    """Detect if an attribute level-up occurred between old and new XP.

    Returns {"old_level", "new_level", "title"} if level increased, None otherwise.
    Pure function (uses other pure functions).
    """
    old_level = calc_attribute_level(old_xp)
    new_level = calc_attribute_level(new_xp)
    if new_level > old_level:
        title = get_attribute_title(attribute, new_level)
        return {
            "old_level": old_level,
            "new_level": new_level,
            "title": title,
        }
    return None


def calc_attribute_level_from_xp(total_xp: int) -> int:
    """Convenience wrapper around calc_attribute_level for external callers."""
    return calc_attribute_level(total_xp)


def get_milestone_badge_name(streak_count: int) -> str:
    """Return DBZ-themed badge name for a streak milestone.

    Pure function.
    """
    return MILESTONE_BADGE_NAMES.get(streak_count, f"Milestone {streak_count}")
