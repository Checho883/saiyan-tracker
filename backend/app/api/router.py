from fastapi import APIRouter
from app.api.v1 import tasks, completions, power, quotes, off_days, analytics, settings, categories

api_router = APIRouter()
api_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(completions.router, prefix="/completions", tags=["completions"])
api_router.include_router(power.router, prefix="/power", tags=["power"])
api_router.include_router(quotes.router, prefix="/quotes", tags=["quotes"])
api_router.include_router(off_days.router, prefix="/off-days", tags=["off-days"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
