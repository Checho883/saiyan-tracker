"""Tests for Wish CRUD + grant endpoints."""

import pytest


class TestWishCreate:
    def test_create_wish(self, client):
        resp = client.post("/api/v1/wishes/", json={"title": "Trip to Japan"})
        assert resp.status_code == 201
        data = resp.json()
        assert data["title"] == "Trip to Japan"
        assert data["is_active"] is True
        assert data["times_wished"] == 0


class TestWishList:
    def test_list_wishes(self, client):
        client.post("/api/v1/wishes/", json={"title": "W1"})
        client.post("/api/v1/wishes/", json={"title": "W2"})
        resp = client.get("/api/v1/wishes/")
        assert resp.status_code == 200
        assert len(resp.json()) == 2


class TestWishGet:
    def test_get_wish(self, client):
        create = client.post("/api/v1/wishes/", json={"title": "GetW"})
        wid = create.json()["id"]
        resp = client.get(f"/api/v1/wishes/{wid}")
        assert resp.status_code == 200
        assert resp.json()["title"] == "GetW"

    def test_get_nonexistent(self, client):
        resp = client.get("/api/v1/wishes/00000000-0000-0000-0000-000000000000")
        assert resp.status_code == 404


class TestWishUpdate:
    def test_update_wish(self, client):
        create = client.post("/api/v1/wishes/", json={"title": "Old"})
        wid = create.json()["id"]
        resp = client.put(f"/api/v1/wishes/{wid}", json={"title": "New"})
        assert resp.status_code == 200
        assert resp.json()["title"] == "New"


class TestWishDelete:
    def test_delete_wish(self, client):
        create = client.post("/api/v1/wishes/", json={"title": "Del"})
        wid = create.json()["id"]
        resp = client.delete(f"/api/v1/wishes/{wid}")
        assert resp.status_code == 204

    def test_delete_nonexistent(self, client):
        resp = client.delete("/api/v1/wishes/00000000-0000-0000-0000-000000000000")
        assert resp.status_code == 404


class TestWishGrant:
    def test_grant_wish_success(self, client, sample_user, db):
        # Give user 7 dragon balls
        sample_user.dragon_balls_collected = 7
        db.flush()

        create = client.post("/api/v1/wishes/", json={"title": "Big Wish"})
        wid = create.json()["id"]

        resp = client.post("/api/v1/wishes/grant", json={"wish_id": wid})
        assert resp.status_code == 200
        data = resp.json()
        assert data["wish_title"] == "Big Wish"
        assert data["times_wished"] == 1
        assert data["wishes_granted"] == 1

    def test_grant_wish_insufficient_dragon_balls(self, client, sample_user, db):
        sample_user.dragon_balls_collected = 3
        db.flush()

        create = client.post("/api/v1/wishes/", json={"title": "No Balls"})
        wid = create.json()["id"]

        resp = client.post("/api/v1/wishes/grant", json={"wish_id": wid})
        assert resp.status_code == 400
