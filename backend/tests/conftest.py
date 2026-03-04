"""Shared test fixtures — in-memory SQLite with FK pragma enforcement."""

import uuid

import pytest
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker

from app.database.base import Base

# Import all models so Base.metadata.create_all discovers them
import app.models  # noqa: F401


@pytest.fixture(scope="session")
def engine():
    """Create an in-memory SQLite engine with FK enforcement."""
    eng = create_engine("sqlite:///:memory:", echo=False)

    @event.listens_for(eng, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    Base.metadata.create_all(bind=eng)
    return eng


@pytest.fixture()
def db(engine):
    """Yield a fresh database session; rollback after each test."""
    connection = engine.connect()
    transaction = connection.begin()
    Session = sessionmaker(bind=connection)
    session = Session()

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture()
def sample_user(db):
    """Create and return a test User."""
    from app.models.user import User

    user = User(
        id=uuid.uuid4(),
        username="test-user",
        display_name="Test Saiyan",
    )
    db.add(user)
    db.flush()
    return user


@pytest.fixture()
def sample_habit(db, sample_user):
    """Create and return a test Habit."""
    from app.models.habit import Habit

    habit = Habit(
        id=uuid.uuid4(),
        user_id=sample_user.id,
        title="Test Habit",
        attribute="str",
        importance="normal",
        start_date="2026-01-01",
    )
    db.add(habit)
    db.flush()
    return habit


@pytest.fixture()
def sample_reward(db, sample_user):
    """Create and return a test Reward."""
    from app.models.reward import Reward

    reward = Reward(
        id=uuid.uuid4(),
        user_id=sample_user.id,
        title="Test Reward",
        rarity="common",
        is_active=True,
    )
    db.add(reward)
    db.flush()
    return reward


@pytest.fixture()
def sample_wish(db, sample_user):
    """Create and return a test Wish."""
    from app.models.wish import Wish

    wish = Wish(
        id=uuid.uuid4(),
        user_id=sample_user.id,
        title="Test Wish",
        is_active=True,
    )
    db.add(wish)
    db.flush()
    return wish
