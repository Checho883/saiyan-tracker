"""Dragon Ball awards and wish granting — earn Dragon Balls on Perfect Days."""

import uuid
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.constants import DRAGON_BALLS_REQUIRED
from app.models.user import User
from app.models.wish import Wish
from app.models.wish_log import WishLog


def award_dragon_ball(user: User) -> dict:
    """Increment dragon_balls_collected by 1. Returns status dict.

    Does NOT commit — caller manages the session.
    """
    user.dragon_balls_collected += 1
    return {
        "dragon_balls_collected": user.dragon_balls_collected,
        "wish_available": user.dragon_balls_collected >= DRAGON_BALLS_REQUIRED,
    }


def revoke_dragon_ball(user: User) -> None:
    """Decrement dragon_balls_collected by 1 (for uncheck clawback). Floor at 0."""
    user.dragon_balls_collected = max(0, user.dragon_balls_collected - 1)


def grant_wish(db: Session, user: User, wish_id: UUID) -> dict:
    """Grant a Shenron wish. Resets dragon balls, creates WishLog.

    Raises ValueError if not enough Dragon Balls or wish not found/inactive.
    """
    if user.dragon_balls_collected < DRAGON_BALLS_REQUIRED:
        raise ValueError(
            f"Not enough Dragon Balls: {user.dragon_balls_collected}/{DRAGON_BALLS_REQUIRED}"
        )

    wish = (
        db.query(Wish)
        .filter(Wish.id == wish_id, Wish.is_active == True)  # noqa: E712
        .first()
    )
    if wish is None:
        raise ValueError("Wish not found or inactive")

    # Reset and increment counters
    user.dragon_balls_collected = 0
    user.wishes_granted += 1
    wish.times_wished += 1

    # Create wish log entry
    wish_log = WishLog(
        id=uuid.uuid4(),
        user_id=user.id,
        wish_id=wish.id,
    )
    db.add(wish_log)
    db.flush()

    return {
        "wish_title": wish.title,
        "times_wished": wish.times_wished,
        "wishes_granted": user.wishes_granted,
    }
