from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.power_service import PowerService
from app.services.analytics_service import AnalyticsService
from app.core.constants import TRANSFORMATIONS

router = APIRouter()
DEFAULT_USER_ID = "default-user"

@router.get("/current")
def get_current_power(db: Session = Depends(get_db)):
    return PowerService.get_current_power(db, DEFAULT_USER_ID)

@router.get("/transformations")
def get_transformations(db: Session = Depends(get_db)):
    from sqlalchemy import func
    from app.models import TaskCompletion, Achievement
    
    total = db.query(func.coalesce(func.sum(TaskCompletion.points_awarded), 0))\
        .filter(TaskCompletion.user_id == DEFAULT_USER_ID).scalar()
    
    achievements = db.query(Achievement).filter(
        Achievement.user_id == DEFAULT_USER_ID,
        Achievement.achievement_type == "transformation"
    ).all()
    
    unlocked_map = {a.transformation_level: a.achieved_at.isoformat() for a in achievements}
    
    result = []
    for t in TRANSFORMATIONS:
        result.append({
            "level": t["level"],
            "name": t["name"],
            "threshold": t["threshold"],
            "unlocked": total >= t["threshold"],
            "unlocked_at": unlocked_map.get(t["level"]),
        })
    return result

@router.get("/history")
def get_power_history(days: int = 30, db: Session = Depends(get_db)):
    return AnalyticsService.get_power_history(db, DEFAULT_USER_ID, days)
