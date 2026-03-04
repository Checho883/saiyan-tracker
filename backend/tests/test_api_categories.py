"""Tests for Category CRUD endpoints."""

import pytest


class TestCategoryCreate:
    def test_create_category(self, client):
        resp = client.post("/api/v1/categories/", json={
            "name": "Fitness",
            "color_code": "#FF5733",
            "icon": "dumbbell",
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "Fitness"
        assert data["color_code"] == "#FF5733"
        assert data["icon"] == "dumbbell"
        assert data["sort_order"] == 0
        assert "id" in data
        assert "created_at" in data


class TestCategoryList:
    def test_list_categories(self, client):
        client.post("/api/v1/categories/", json={
            "name": "Cat1", "color_code": "#000", "icon": "a",
        })
        client.post("/api/v1/categories/", json={
            "name": "Cat2", "color_code": "#111", "icon": "b",
        })
        resp = client.get("/api/v1/categories/")
        assert resp.status_code == 200
        assert len(resp.json()) == 2


class TestCategoryGet:
    def test_get_category(self, client):
        create = client.post("/api/v1/categories/", json={
            "name": "GetMe", "color_code": "#222", "icon": "c",
        })
        cat_id = create.json()["id"]
        resp = client.get(f"/api/v1/categories/{cat_id}")
        assert resp.status_code == 200
        assert resp.json()["name"] == "GetMe"

    def test_get_nonexistent_category(self, client):
        resp = client.get("/api/v1/categories/00000000-0000-0000-0000-000000000000")
        assert resp.status_code == 404


class TestCategoryUpdate:
    def test_update_category(self, client):
        create = client.post("/api/v1/categories/", json={
            "name": "Old", "color_code": "#333", "icon": "d",
        })
        cat_id = create.json()["id"]
        resp = client.put(f"/api/v1/categories/{cat_id}", json={"name": "New"})
        assert resp.status_code == 200
        assert resp.json()["name"] == "New"
        assert resp.json()["color_code"] == "#333"  # unchanged

    def test_update_nonexistent(self, client):
        resp = client.put(
            "/api/v1/categories/00000000-0000-0000-0000-000000000000",
            json={"name": "X"},
        )
        assert resp.status_code == 404


class TestCategoryDelete:
    def test_delete_category(self, client):
        create = client.post("/api/v1/categories/", json={
            "name": "Del", "color_code": "#444", "icon": "e",
        })
        cat_id = create.json()["id"]
        resp = client.delete(f"/api/v1/categories/{cat_id}")
        assert resp.status_code == 204

    def test_delete_nonexistent(self, client):
        resp = client.delete("/api/v1/categories/00000000-0000-0000-0000-000000000000")
        assert resp.status_code == 404
