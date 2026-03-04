"""Tests for capsule_service — RNG drop with rarity fallback."""

import uuid
from unittest.mock import patch

import pytest

from app.models.reward import Reward
from app.services.capsule_service import roll_capsule_drop, select_rarity_tier


class TestSelectRarityTier:
    """select_rarity_tier picks from weighted distribution."""

    @patch("app.services.capsule_service.random")
    def test_returns_common_when_weighted(self, mock_random):
        mock_random.choices.return_value = ["common"]
        assert select_rarity_tier() == "common"

    @patch("app.services.capsule_service.random")
    def test_returns_rare_when_weighted(self, mock_random):
        mock_random.choices.return_value = ["rare"]
        assert select_rarity_tier() == "rare"

    @patch("app.services.capsule_service.random")
    def test_returns_epic_when_weighted(self, mock_random):
        mock_random.choices.return_value = ["epic"]
        assert select_rarity_tier() == "epic"


class TestRollCapsuleDrop:
    """roll_capsule_drop respects 25% chance, rarity fallback, and no-rewards."""

    def test_returns_none_when_no_active_rewards(self, db, sample_user, sample_habit):
        """No rewards in DB -> returns None immediately, skips RNG."""
        result = roll_capsule_drop(db, sample_user.id, sample_habit.id)
        assert result is None

    @patch("app.services.capsule_service.random")
    def test_returns_none_when_rng_fails(self, mock_random, db, sample_user, sample_habit, sample_reward):
        """random.random() > 0.25 -> no drop."""
        mock_random.random.return_value = 0.50
        result = roll_capsule_drop(db, sample_user.id, sample_habit.id)
        assert result is None

    @patch("app.services.capsule_service.random")
    def test_returns_capsule_drop_when_rng_succeeds(self, mock_random, db, sample_user, sample_habit, sample_reward):
        """random.random() <= 0.25 -> drop with matching reward."""
        mock_random.random.return_value = 0.10
        mock_random.choices.return_value = ["common"]
        mock_random.choice.return_value = sample_reward

        result = roll_capsule_drop(db, sample_user.id, sample_habit.id)
        assert result is not None
        assert result.reward_id == sample_reward.id
        assert result.user_id == sample_user.id
        assert result.habit_id == sample_habit.id

    @patch("app.services.capsule_service.random")
    def test_rarity_fallback_epic_to_common(self, mock_random, db, sample_user, sample_habit, sample_reward):
        """Rolled epic but only common rewards exist -> falls back to common."""
        mock_random.random.return_value = 0.10
        mock_random.choices.return_value = ["epic"]
        mock_random.choice.return_value = sample_reward

        result = roll_capsule_drop(db, sample_user.id, sample_habit.id)
        assert result is not None
        assert result.reward_id == sample_reward.id

    @patch("app.services.capsule_service.random")
    def test_returns_none_when_all_tiers_empty(self, mock_random, db, sample_user, sample_habit):
        """RNG says drop but no rewards at any tier -> None."""
        mock_random.random.return_value = 0.10
        mock_random.choices.return_value = ["epic"]

        result = roll_capsule_drop(db, sample_user.id, sample_habit.id)
        assert result is None

    @patch("app.services.capsule_service.random")
    def test_picks_rare_reward_when_available(self, mock_random, db, sample_user, sample_habit):
        """Rolled rare, rare reward exists -> picks rare reward."""
        rare_reward = Reward(
            id=uuid.uuid4(),
            user_id=sample_user.id,
            title="Rare Reward",
            rarity="rare",
            is_active=True,
        )
        db.add(rare_reward)
        db.flush()

        mock_random.random.return_value = 0.10
        mock_random.choices.return_value = ["rare"]
        mock_random.choice.return_value = rare_reward

        result = roll_capsule_drop(db, sample_user.id, sample_habit.id)
        assert result is not None
        assert result.reward_id == rare_reward.id
