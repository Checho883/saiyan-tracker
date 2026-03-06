"""Achievements endpoint — list all user achievements."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.achievement import Achievement
from app.models.user import User
from app.schemas.achievement import AchievementResponse

router = APIRouter(prefix="/achievements", tags=["achievements"])


@router.get("/", response_model=list[AchievementResponse])
def list_achievements(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Return all achievements for the current user, ordered by unlock date descending."""
    achievements = (
        db.query(Achievement)
        .filter(Achievement.user_id == user.id)
        .order_by(Achievement.unlocked_at.desc())
        .all()
    )
    return achievements
