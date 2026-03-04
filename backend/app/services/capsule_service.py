"""Capsule drop RNG with rarity fallback — rolls for capsule loot on habit completion."""

import random
import uuid
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.constants import CAPSULE_DROP_CHANCE, CAPSULE_RARITY_WEIGHTS
from app.models.capsule_drop import CapsuleDrop
from app.models.reward import Reward

# Fallback order: try rolled tier, then descend through lower tiers
RARITY_FALLBACK_ORDER = ["epic", "rare", "common"]


def select_rarity_tier() -> str:
    """Pick a rarity tier using weighted distribution."""
    return random.choices(
        list(CAPSULE_RARITY_WEIGHTS.keys()),
        weights=list(CAPSULE_RARITY_WEIGHTS.values()),
        k=1,
    )[0]


def roll_capsule_drop(
    db: Session, user_id: UUID, habit_id: UUID
) -> CapsuleDrop | None:
    """Roll for a capsule drop. Returns CapsuleDrop or None.

    - Skips RNG entirely if no active rewards exist.
    - 25% chance to trigger a drop.
    - Picks rarity tier with weighted distribution, falls back to lower tiers.
    - Does NOT add to session — caller manages the transaction.
    """
    # Short-circuit: no active rewards -> no drop possible
    reward_count = (
        db.query(Reward)
        .filter(Reward.user_id == user_id, Reward.is_active == True)  # noqa: E712
        .count()
    )
    if reward_count == 0:
        return None

    # Roll the dice
    if random.random() > CAPSULE_DROP_CHANCE:
        return None

    # Pick rarity tier
    rolled_rarity = select_rarity_tier()

    # Fallback: start from rolled rarity's index, iterate downward
    start_index = RARITY_FALLBACK_ORDER.index(rolled_rarity)
    for tier in RARITY_FALLBACK_ORDER[start_index:]:
        rewards = (
            db.query(Reward)
            .filter(
                Reward.user_id == user_id,
                Reward.is_active == True,  # noqa: E712
                Reward.rarity == tier,
            )
            .all()
        )
        if rewards:
            chosen_reward = random.choice(rewards)
            return CapsuleDrop(
                id=uuid.uuid4(),
                user_id=user_id,
                reward_id=chosen_reward.id,
                habit_id=habit_id,
            )

    # No rewards at any tier (shouldn't happen given count check, but defensive)
    return None
