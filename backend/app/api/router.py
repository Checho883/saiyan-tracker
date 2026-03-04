"""Master API router — assembles all v1 domain routers."""

from fastapi import APIRouter

from app.api.v1.categories import router as categories_router
from app.api.v1.rewards import router as rewards_router
from app.api.v1.wishes import router as wishes_router
from app.api.v1.off_days import router as off_days_router
from app.api.v1.settings import router as settings_router
from app.api.v1.quotes import router as quotes_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(categories_router)
api_router.include_router(rewards_router)
api_router.include_router(wishes_router)
api_router.include_router(off_days_router)
api_router.include_router(settings_router)
api_router.include_router(quotes_router)

# Plan 03-02 will add:
# api_router.include_router(habits_router)
# api_router.include_router(power_router)
# api_router.include_router(analytics_router)
