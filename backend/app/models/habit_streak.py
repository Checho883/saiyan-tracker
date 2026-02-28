import uuid
from datetime import date
from sqlalchemy import Column, String, Integer, Date, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database.base import Base


class HabitStreak(Base):
    __tablename__ = "habit_streaks"
    __table_args__ = (
        UniqueConstraint("user_id", "habit_id", name="uq_user_habit_streak"),
    )

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    habit_id = Column(String, ForeignKey("habits.id"), nullable=False)
    current_streak = Column(Integer, default=0)
    best_streak = Column(Integer, default=0)
    last_completed_date = Column(Date, nullable=True)

    habit = relationship("Habit", back_populates="streak")
