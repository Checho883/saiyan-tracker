"""Tests for seed data — DB-07 (quotes), idempotency, default data."""

from sqlalchemy import func

from app.models.quote import Quote
from app.models.user import User
from app.models.category import Category
from app.models.reward import Reward
from app.models.wish import Wish
from app.database.seed import (
    seed_all,
    seed_default_user,
    seed_default_categories,
    seed_default_rewards,
    seed_default_wishes,
    seed_quotes,
)


# ---------------------------------------------------------------------------
# Quote seed tests (DB-07)
# ---------------------------------------------------------------------------

def test_seed_quotes(db):
    """seed_quotes creates 100+ quotes."""
    seed_quotes(db)
    count = db.query(Quote).count()
    assert count >= 100, f"Expected 100+ quotes, got {count}"


def test_seed_quotes_fields(db):
    """All quotes have character, quote_text, source_saga, trigger_event."""
    seed_quotes(db)
    quotes = db.query(Quote).all()
    for q in quotes:
        assert q.character, f"Quote missing character: {q.id}"
        assert q.quote_text, f"Quote missing quote_text: {q.id}"
        assert q.source_saga, f"Quote missing source_saga: {q.id}"
        assert q.trigger_event, f"Quote missing trigger_event: {q.id}"


def test_seed_character_distribution(db):
    """Goku >= 25, Vegeta >= 20, Piccolo >= 10."""
    seed_quotes(db)
    counts = dict(
        db.query(Quote.character, func.count())
        .group_by(Quote.character)
        .all()
    )
    assert counts.get("goku", 0) >= 25, f"Goku: {counts.get('goku', 0)}"
    assert counts.get("vegeta", 0) >= 20, f"Vegeta: {counts.get('vegeta', 0)}"
    assert counts.get("piccolo", 0) >= 10, f"Piccolo: {counts.get('piccolo', 0)}"


def test_seed_trigger_coverage(db):
    """All 7 trigger events have at least 1 quote."""
    seed_quotes(db)
    triggers = {
        row[0]
        for row in db.query(Quote.trigger_event).distinct().all()
    }
    expected = {
        "habit_complete",
        "perfect_day",
        "streak_milestone",
        "transformation",
        "zenkai",
        "roast",
        "welcome_back",
    }
    assert expected.issubset(triggers), f"Missing triggers: {expected - triggers}"


def test_seed_roast_severities(db):
    """At least 5 quotes per severity (mild, medium, savage)."""
    seed_quotes(db)
    for severity in ("mild", "medium", "savage"):
        count = (
            db.query(Quote)
            .filter(Quote.trigger_event == "roast", Quote.severity == severity)
            .count()
        )
        assert count >= 5, f"Severity '{severity}' has {count} quotes, expected >= 5"


# ---------------------------------------------------------------------------
# Default data seed tests
# ---------------------------------------------------------------------------

def test_seed_default_user(db):
    """seed_default_user creates user with correct defaults."""
    user = seed_default_user(db)
    assert user.username == "default-user"
    assert user.display_name == "Saiyan"
    assert user.sound_enabled is True
    assert user.theme == "dark"


def test_seed_default_categories(db):
    """6 categories with correct names."""
    user = seed_default_user(db)
    seed_default_categories(db, user.id)
    cats = db.query(Category).filter(Category.user_id == user.id).all()
    assert len(cats) == 6
    names = {c.name for c in cats}
    assert names == {"Health", "Mind", "Body", "Family", "Skills", "Discipline"}


def test_seed_default_rewards(db):
    """~10 rewards across 3 rarities."""
    user = seed_default_user(db)
    seed_default_rewards(db, user.id)
    rewards = db.query(Reward).filter(Reward.user_id == user.id).all()
    assert len(rewards) == 10
    rarities = {r.rarity for r in rewards}
    assert rarities == {"common", "rare", "epic"}


def test_seed_default_wishes(db):
    """3-5 wishes."""
    user = seed_default_user(db)
    seed_default_wishes(db, user.id)
    wishes = db.query(Wish).filter(Wish.user_id == user.id).all()
    assert 3 <= len(wishes) <= 5


def test_seed_idempotent(db):
    """Running seed_all twice produces same record counts."""
    seed_all(db)
    count1_quotes = db.query(Quote).count()
    count1_users = db.query(User).count()
    count1_cats = db.query(Category).count()
    count1_rewards = db.query(Reward).count()
    count1_wishes = db.query(Wish).count()

    seed_all(db)
    assert db.query(Quote).count() == count1_quotes
    assert db.query(User).count() == count1_users
    assert db.query(Category).count() == count1_cats
    assert db.query(Reward).count() == count1_rewards
    assert db.query(Wish).count() == count1_wishes
