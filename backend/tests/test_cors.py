"""Tests for CORS middleware configuration."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.testclient import TestClient


def _make_app(origins: list[str]) -> FastAPI:
    """Create a minimal FastAPI app with CORS middleware for testing."""
    app = FastAPI()

    if origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=origins,
            allow_credentials=False,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    @app.get("/health")
    def health():
        return {"status": "ok"}

    return app


class TestCORSMiddleware:
    """Test CORS header behavior with configured origins."""

    def test_preflight_with_allowed_origin(self):
        """OPTIONS preflight from allowed origin returns CORS headers."""
        app = _make_app(["https://saiyan-tracker.vercel.app"])
        client = TestClient(app)

        response = client.options(
            "/health",
            headers={
                "Origin": "https://saiyan-tracker.vercel.app",
                "Access-Control-Request-Method": "GET",
            },
        )
        assert response.status_code == 200
        assert (
            response.headers["access-control-allow-origin"]
            == "https://saiyan-tracker.vercel.app"
        )

    def test_get_with_allowed_origin(self):
        """GET from allowed origin includes Access-Control-Allow-Origin header."""
        app = _make_app(["https://saiyan-tracker.vercel.app"])
        client = TestClient(app)

        response = client.get(
            "/health",
            headers={"Origin": "https://saiyan-tracker.vercel.app"},
        )
        assert response.status_code == 200
        assert (
            response.headers["access-control-allow-origin"]
            == "https://saiyan-tracker.vercel.app"
        )

    def test_no_cors_headers_when_origins_empty(self):
        """No CORS headers when no origins configured (dev mode)."""
        app = _make_app([])
        client = TestClient(app)

        response = client.get(
            "/health",
            headers={"Origin": "http://localhost:5173"},
        )
        assert response.status_code == 200
        assert "access-control-allow-origin" not in response.headers
