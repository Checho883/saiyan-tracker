"""DailyLog model — one entry per user per day with UniqueConstraint."""

import uuid

from sqlalchemy import String, Float, ForeignKey, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class DailyLog(Base):
    __tablename__ = "daily_logs"
    __table_args__ = (
        UniqueConstraint("user_id", "log_date", name="uq_user_log_date"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    log_date: Mapped[str] = mapped_column(String(10))  # YYYY-MM-DD
    habits_due: Mapped[int] = mapped_column(default=0)
    habits_completed: Mapped[int] = mapped_column(default=0)
    habit_completion_rate: Mapped[float] = mapped_column(Float, default=0.0)
    is_perfect_day: Mapped[bool] = mapped_column(default=False)
    completion_tier: Mapped[str] = mapped_column(String(20), default="base")
    xp_earned: Mapped[int] = mapped_column(default=0)
    streak_multiplier: Mapped[float] = mapped_column(Float, default=1.0)
    zenkai_bonus_applied: Mapped[bool] = mapped_column(default=False)
    dragon_ball_earned: Mapped[bool] = mapped_column(default=False)

    # Relationships
    user: Mapped["User"] = relationship(back_populates="daily_logs")
