from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.schemas.user import UserSettings

router = APIRouter()
DEFAULT_USER_ID = "default-user"

@router.get("/")
def get_settings(db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == DEFAULT_USER_ID).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"daily_point_minimum": user.daily_point_minimum, "username": user.username, "email": user.email}

@router.put("/")
def update_settings(data: UserSettings, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == DEFAULT_USER_ID).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if data.daily_point_minimum is not None:
        user.daily_point_minimum = data.daily_point_minimum
    db.commit()
    db.refresh(user)
    return {"daily_point_minimum": user.daily_point_minimum}
