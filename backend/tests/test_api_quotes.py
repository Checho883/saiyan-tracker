"""Tests for Quote random endpoint."""

import pytest


class TestQuoteRandom:
    def test_random_quote(self, client, seeded_db):
        resp = client.get("/api/v1/quotes/random")
        assert resp.status_code == 200
        data = resp.json()
        assert "character" in data
        assert "quote_text" in data
        assert "source_saga" in data
        assert "avatar_path" in data
        assert data["avatar_path"].startswith("/assets/avatars/")
        assert data["avatar_path"].endswith(".webp")

    def test_random_quote_with_trigger(self, client, seeded_db):
        resp = client.get("/api/v1/quotes/random?trigger_event=habit_complete")
        assert resp.status_code == 200
        assert "quote_text" in resp.json()

    def test_random_quote_no_match(self, client, seeded_db):
        resp = client.get("/api/v1/quotes/random?trigger_event=nonexistent_event")
        assert resp.status_code == 404
