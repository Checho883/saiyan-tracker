"""Tests for Reward CRUD endpoints."""

import pytest


class TestRewardCreate:
    def test_create_reward(self, client):
        resp = client.post("/api/v1/rewards/", json={
            "title": "New Headphones",
            "rarity": "rare",
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["title"] == "New Headphones"
        assert data["rarity"] == "rare"
        assert data["is_active"] is True

    def test_create_reward_default_rarity(self, client):
        resp = client.post("/api/v1/rewards/", json={"title": "Snack"})
        assert resp.status_code == 201
        assert resp.json()["rarity"] == "common"


class TestRewardList:
    def test_list_rewards(self, client):
        client.post("/api/v1/rewards/", json={"title": "R1"})
        client.post("/api/v1/rewards/", json={"title": "R2"})
        resp = client.get("/api/v1/rewards/")
        assert resp.status_code == 200
        assert len(resp.json()) == 2


class TestRewardGet:
    def test_get_reward(self, client):
        create = client.post("/api/v1/rewards/", json={"title": "GetR"})
        rid = create.json()["id"]
        resp = client.get(f"/api/v1/rewards/{rid}")
        assert resp.status_code == 200
        assert resp.json()["title"] == "GetR"

    def test_get_nonexistent(self, client):
        resp = client.get("/api/v1/rewards/00000000-0000-0000-0000-000000000000")
        assert resp.status_code == 404


class TestRewardUpdate:
    def test_update_reward(self, client):
        create = client.post("/api/v1/rewards/", json={"title": "Old", "rarity": "common"})
        rid = create.json()["id"]
        resp = client.put(f"/api/v1/rewards/{rid}", json={"rarity": "epic"})
        assert resp.status_code == 200
        assert resp.json()["rarity"] == "epic"
        assert resp.json()["title"] == "Old"


class TestRewardDelete:
    def test_delete_reward(self, client):
        create = client.post("/api/v1/rewards/", json={"title": "Del"})
        rid = create.json()["id"]
        resp = client.delete(f"/api/v1/rewards/{rid}")
        assert resp.status_code == 204

    def test_delete_nonexistent(self, client):
        resp = client.delete("/api/v1/rewards/00000000-0000-0000-0000-000000000000")
        assert resp.status_code == 404
