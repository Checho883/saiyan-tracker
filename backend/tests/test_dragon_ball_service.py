"""Tests for dragon_ball_service — award, revoke, and wish granting."""

import uuid

import pytest

from app.models.wish import Wish
from app.models.wish_log import WishLog
from app.services.dragon_ball_service import (
    award_dragon_ball,
    grant_wish,
    revoke_dragon_ball,
)


class TestAwardDragonBall:
    """award_dragon_ball increments collected count."""

    def test_increments_by_one(self, db, sample_user):
        result = award_dragon_ball(sample_user)
        assert result["dragon_balls_collected"] == 1
        assert result["wish_available"] is False

    def test_wish_available_at_seven(self, db, sample_user):
        sample_user.dragon_balls_collected = 6
        result = award_dragon_ball(sample_user)
        assert result["dragon_balls_collected"] == 7
        assert result["wish_available"] is True

    def test_accumulates_correctly(self, db, sample_user):
        for i in range(1, 8):
            result = award_dragon_ball(sample_user)
            assert result["dragon_balls_collected"] == i


class TestRevokeDragonBall:
    """revoke_dragon_ball decrements collected count."""

    def test_decrements_by_one(self, db, sample_user):
        sample_user.dragon_balls_collected = 3
        revoke_dragon_ball(sample_user)
        assert sample_user.dragon_balls_collected == 2

    def test_cannot_go_below_zero(self, db, sample_user):
        sample_user.dragon_balls_collected = 0
        revoke_dragon_ball(sample_user)
        assert sample_user.dragon_balls_collected == 0


class TestGrantWish:
    """grant_wish resets dragon balls and creates WishLog."""

    def test_grants_wish_successfully(self, db, sample_user, sample_wish):
        sample_user.dragon_balls_collected = 7
        result = grant_wish(db, sample_user, sample_wish.id)

        assert sample_user.dragon_balls_collected == 0
        assert sample_user.wishes_granted == 1
        assert sample_wish.times_wished == 1
        assert result["wish_title"] == "Test Wish"
        assert result["times_wished"] == 1
        assert result["wishes_granted"] == 1

        # WishLog created
        log = db.query(WishLog).filter(WishLog.wish_id == sample_wish.id).first()
        assert log is not None
        assert log.user_id == sample_user.id

    def test_raises_if_not_enough_dragon_balls(self, db, sample_user, sample_wish):
        sample_user.dragon_balls_collected = 5
        with pytest.raises(ValueError, match="Not enough Dragon Balls"):
            grant_wish(db, sample_user, sample_wish.id)

    def test_raises_if_wish_not_found(self, db, sample_user):
        sample_user.dragon_balls_collected = 7
        with pytest.raises(ValueError, match="Wish not found"):
            grant_wish(db, sample_user, uuid.uuid4())

    def test_raises_if_wish_inactive(self, db, sample_user, sample_wish):
        sample_user.dragon_balls_collected = 7
        sample_wish.is_active = False
        db.flush()
        with pytest.raises(ValueError, match="Wish not found"):
            grant_wish(db, sample_user, sample_wish.id)

    def test_increments_wishes_granted_cumulatively(self, db, sample_user, sample_wish):
        """Multiple wish grants increment correctly."""
        sample_user.dragon_balls_collected = 7
        grant_wish(db, sample_user, sample_wish.id)

        sample_user.dragon_balls_collected = 7
        result = grant_wish(db, sample_user, sample_wish.id)
        assert sample_user.wishes_granted == 2
        assert sample_wish.times_wished == 2
        assert result["wishes_granted"] == 2
