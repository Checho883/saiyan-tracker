import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Date, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database.base import Base


class HabitLog(Base):
    __tablename__ = "habit_logs"
    __table_args__ = (
        UniqueConstraint("habit_id", "log_date", name="uq_habit_log_date"),
    )

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    habit_id = Column(String, ForeignKey("habits.id"), nullable=False)
    log_date = Column(Date, nullable=False, default=date.today)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    points_awarded = Column(Integer, default=0)
    notes = Column(Text, nullable=True)

    user = relationship("User")
    habit = relationship("Habit", back_populates="logs")
