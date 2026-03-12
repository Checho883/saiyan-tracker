"""Tests for Settings configuration with pydantic-settings."""

import os

import pytest


class TestSettings:
    """Test pydantic-settings BaseSettings behavior."""

    def _make_settings(self, monkeypatch, env_overrides: dict | None = None):
        """Create a fresh Settings instance with optional env var overrides."""
        # Clear any cached settings by removing env vars that might interfere
        for key in ("APP_TITLE", "DATABASE_URL", "CORS_ORIGINS"):
            monkeypatch.delenv(key, raising=False)

        # Apply overrides
        if env_overrides:
            for key, value in env_overrides.items():
                monkeypatch.setenv(key, value)

        # Import Settings class fresh (not the singleton)
        from app.core.config import Settings

        return Settings()

    def test_database_url_default(self, monkeypatch):
        """DATABASE_URL defaults to relative SQLite path for dev."""
        settings = self._make_settings(monkeypatch)
        assert settings.DATABASE_URL == "sqlite:///saiyan_tracker.db"

    def test_database_url_from_env(self, monkeypatch):
        """DATABASE_URL reads from environment variable (absolute path)."""
        settings = self._make_settings(
            monkeypatch,
            {"DATABASE_URL": "sqlite:////var/lib/saiyan-tracker/saiyan_tracker.db"},
        )
        assert settings.DATABASE_URL == "sqlite:////var/lib/saiyan-tracker/saiyan_tracker.db"

    def test_cors_origins_empty_default(self, monkeypatch):
        """CORS_ORIGINS defaults to empty string, parsed as empty list."""
        settings = self._make_settings(monkeypatch)
        assert settings.CORS_ORIGINS == ""
        assert settings.cors_origin_list == []

    def test_cors_origins_single(self, monkeypatch):
        """CORS_ORIGINS with single origin parses to one-item list."""
        settings = self._make_settings(
            monkeypatch,
            {"CORS_ORIGINS": "https://example.com"},
        )
        assert settings.cors_origin_list == ["https://example.com"]

    def test_cors_origins_multiple_with_whitespace(self, monkeypatch):
        """CORS_ORIGINS with comma-separated origins trims whitespace."""
        settings = self._make_settings(
            monkeypatch,
            {"CORS_ORIGINS": "https://a.com, https://b.com"},
        )
        assert settings.cors_origin_list == ["https://a.com", "https://b.com"]

    def test_app_title_default(self, monkeypatch):
        """APP_TITLE defaults to 'Saiyan Tracker'."""
        settings = self._make_settings(monkeypatch)
        assert settings.APP_TITLE == "Saiyan Tracker"
