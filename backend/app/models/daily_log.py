import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Integer, Boolean, Float, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.base import Base

class DailyLog(Base):
    __tablename__ = "daily_logs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    log_date = Column(Date, nullable=False, default=date.today)
    total_points_earned = Column(Integer, default=0)
    daily_minimum_met = Column(Boolean, default=False)
    is_off_day = Column(Boolean, default=False)
    off_day_reason = Column(String(100), nullable=True)
    tasks_completed = Column(Integer, default=0)
    completion_percentage = Column(Float, default=0.0)
    login_bonus_earned = Column(Boolean, default=False)
    habits_due = Column(Integer, default=0)
    habits_completed = Column(Integer, default=0)
    habit_completion_rate = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="daily_logs")
