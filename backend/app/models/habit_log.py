"""HabitLog model — one entry per habit per day with UniqueConstraint."""

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import String, Text, ForeignKey, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class HabitLog(Base):
    __tablename__ = "habit_logs"
    __table_args__ = (
        UniqueConstraint("habit_id", "log_date", name="uq_habit_log_date"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    habit_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("habits.id"))
    log_date: Mapped[str] = mapped_column(String(10))  # YYYY-MM-DD
    completed: Mapped[bool] = mapped_column(default=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    attribute_xp_awarded: Mapped[int] = mapped_column(default=0)
    capsule_dropped: Mapped[bool] = mapped_column(default=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    user: Mapped["User"] = relationship(back_populates="habit_logs")
    habit: Mapped["Habit"] = relationship(back_populates="logs")
