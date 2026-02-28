from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from app.database.session import get_db
from app.models.off_day import OffDay
from app.models.daily_log import DailyLog
from app.schemas.off_day import OffDayCreate

router = APIRouter()
DEFAULT_USER_ID = "default-user"

@router.get("/")
def list_off_days(db: Session = Depends(get_db)):
    return db.query(OffDay).filter(OffDay.user_id == DEFAULT_USER_ID).order_by(OffDay.off_day_date.desc()).all()

@router.post("/")
def create_off_day(data: OffDayCreate, db: Session = Depends(get_db)):
    off_date = data.off_day_date or date.today()
    
    existing = db.query(OffDay).filter(
        OffDay.user_id == DEFAULT_USER_ID,
        OffDay.off_day_date == off_date
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Off day already exists for this date")
    
    off_day = OffDay(
        user_id=DEFAULT_USER_ID,
        off_day_date=off_date,
        reason=data.reason,
        notes=data.notes,
    )
    db.add(off_day)
    
    # Update daily log
    daily_log = db.query(DailyLog).filter(
        DailyLog.user_id == DEFAULT_USER_ID,
        DailyLog.log_date == off_date
    ).first()
    if not daily_log:
        daily_log = DailyLog(user_id=DEFAULT_USER_ID, log_date=off_date)
        db.add(daily_log)
    daily_log.is_off_day = True
    daily_log.off_day_reason = data.reason
    
    db.commit()
    db.refresh(off_day)
    return off_day

@router.delete("/{off_day_id}")
def delete_off_day(off_day_id: str, db: Session = Depends(get_db)):
    off_day = db.query(OffDay).filter(OffDay.id == off_day_id).first()
    if not off_day:
        raise HTTPException(status_code=404, detail="Off day not found")
    db.delete(off_day)
    db.commit()
    return {"message": "Off day removed"}
