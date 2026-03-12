"""Tests for SQLite WAL mode and pragma configuration."""

import os

import pytest
from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import sessionmaker


def _apply_sqlite_pragmas(dbapi_connection, connection_record):
    """Mirror the pragma handler from app.database.session."""
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.close()


@pytest.fixture()
def wal_engine(tmp_path):
    """Create a file-based SQLite engine with pragma event handler."""
    db_path = os.path.join(str(tmp_path), "test.db")
    url = f"sqlite:///{db_path}"
    eng = create_engine(url, echo=False)
    event.listen(eng, "connect", _apply_sqlite_pragmas)
    return eng


def test_wal_mode_active(wal_engine):
    """WAL journal mode should be set on file-based databases."""
    with wal_engine.connect() as conn:
        result = conn.execute(text("PRAGMA journal_mode")).scalar()
        assert result == "wal"


def test_foreign_keys_enabled(wal_engine):
    """Foreign key enforcement should remain active alongside WAL."""
    with wal_engine.connect() as conn:
        result = conn.execute(text("PRAGMA foreign_keys")).scalar()
        assert result == 1
