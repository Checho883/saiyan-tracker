"""Shared test fixtures — in-memory SQLite with FK pragma enforcement."""

import uuid

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database.base import Base

# Import all models so Base.metadata.create_all discovers them
import app.models  # noqa: F401


@pytest.fixture(scope="session")
def engine():
    """Create an in-memory SQLite engine with FK enforcement."""
    eng = create_engine(
        "sqlite:///:memory:",
        echo=False,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    @event.listens_for(eng, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    Base.metadata.create_all(bind=eng)
    return eng


@pytest.fixture()
def db(engine):
    """Yield a fresh database session; rollback after each test.

    Uses nested transactions so that db.commit() inside route handlers
    releases a savepoint instead of the outer transaction.
    """
    connection = engine.connect()
    transaction = connection.begin()
    Session = sessionmaker(bind=connection, join_transaction_mode="create_savepoint")
    session = Session()

    # Use SAVEPOINT so route-level commit() doesn't end the outer txn
    session.begin_nested()

    @event.listens_for(session, "after_transaction_end")
    def restart_savepoint(sess, trans):
        if trans.nested and not trans._parent.nested:
            sess.begin_nested()

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


@pytest.fixture()
def client(db, sample_user):
    """Yield a TestClient with dependency overrides for get_db and get_current_user."""
    from fastapi.testclient import TestClient

    from app.api.deps import get_current_user, get_db
    from app.main import app

    def override_get_db():
        yield db

    def override_get_current_user():
        return sample_user

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()


@pytest.fixture()
def seeded_db(db):
    """Seed quotes and default data into the test database."""
    from app.database.seed import seed_all

    seed_all(db)
    return db
