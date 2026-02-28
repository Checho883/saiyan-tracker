import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.orm import relationship
from app.database.base import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(255), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    daily_point_minimum = Column(Integer, default=100)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    tasks = relationship("Task", back_populates="user")
    categories = relationship("TaskCategory", back_populates="user")
    completions = relationship("TaskCompletion", back_populates="user")
    daily_logs = relationship("DailyLog", back_populates="user")
    streak = relationship("Streak", back_populates="user", uselist=False)
    power_levels = relationship("PowerLevel", back_populates="user")
    off_days = relationship("OffDay", back_populates="user")
    achievements = relationship("Achievement", back_populates="user")
    habits = relationship("Habit", back_populates="user")
