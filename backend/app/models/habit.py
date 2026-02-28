import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Date, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database.base import Base


class Habit(Base):
    __tablename__ = "habits"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    category_id = Column(String, ForeignKey("task_categories.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    icon_emoji = Column(String(10), default="⭐")
    base_points = Column(Integer, default=10)
    frequency = Column(String(20), default="daily")  # daily, weekdays, custom
    custom_days = Column(JSON, nullable=True)  # e.g. ["mon","wed","fri"]
    target_time = Column(String(10), nullable=True)  # e.g. "22:00"
    is_temporary = Column(Boolean, default=False)
    start_date = Column(Date, nullable=True, default=date.today)
    end_date = Column(Date, nullable=True)
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="habits")
    category = relationship("TaskCategory", back_populates="habits")
    logs = relationship("HabitLog", back_populates="habit", cascade="all, delete-orphan")
    streak = relationship("HabitStreak", back_populates="habit", uselist=False, cascade="all, delete-orphan")
