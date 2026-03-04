"""FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.core.config import settings
from app.database.base import Base
from app.database.session import engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create tables on startup."""
    import app.models  # noqa: F401 — register all models with Base.metadata
    Base.metadata.create_all(bind=engine)

    # Seed default data on startup (idempotent)
    from app.database.seed import seed_all
    from app.database.session import SessionLocal
    db = SessionLocal()
    try:
        seed_all(db)
    finally:
        db.close()

    yield


app = FastAPI(title=settings.APP_TITLE, lifespan=lifespan)

# Wire API routes
from app.api.router import api_router  # noqa: E402

app.include_router(api_router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
