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
