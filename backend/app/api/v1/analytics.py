from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.analytics_service import AnalyticsService

router = APIRouter()
DEFAULT_USER_ID = "default-user"

@router.get("/weekly")
def get_weekly(db: Session = Depends(get_db)):
    return AnalyticsService.get_weekly(db, DEFAULT_USER_ID)

@router.get("/category-breakdown")
def get_category_breakdown(days: int = 30, db: Session = Depends(get_db)):
    return AnalyticsService.get_category_breakdown(db, DEFAULT_USER_ID, days)
