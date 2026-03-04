"""Habit model — importance and attribute fields, no base_points."""

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import String, Text, ForeignKey, JSON, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Habit(Base):
    __tablename__ = "habits"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    category_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("categories.id", ondelete="SET NULL"),
        nullable=True,
    )
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    icon_emoji: Mapped[str] = mapped_column(String(10), default="⭐")
    importance: Mapped[str] = mapped_column(String(10), default="normal")
    attribute: Mapped[str] = mapped_column(String(3))
    frequency: Mapped[str] = mapped_column(String(20), default="daily")
    custom_days: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    target_time: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    is_temporary: Mapped[bool] = mapped_column(default=False)
    start_date: Mapped[str] = mapped_column(String(10))
    end_date: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    sort_order: Mapped[int] = mapped_column(default=0)
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    # Relationships
    user: Mapped["User"] = relationship(back_populates="habits")
    category: Mapped[Optional["Category"]] = relationship(back_populates="habits")
    logs: Mapped[list["HabitLog"]] = relationship(back_populates="habit")
    habit_streak: Mapped[Optional["HabitStreak"]] = relationship(back_populates="habit", uselist=False)
