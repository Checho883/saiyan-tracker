"""User model — single-user app, stores cumulative XP, power level, settings."""

import uuid
from datetime import datetime

from sqlalchemy import String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    username: Mapped[str] = mapped_column(String(100), default="default-user")
    display_name: Mapped[str] = mapped_column(String(100), default="Saiyan")
    dragon_balls_collected: Mapped[int] = mapped_column(default=0)
    wishes_granted: Mapped[int] = mapped_column(default=0)
    str_xp: Mapped[int] = mapped_column(default=0)
    vit_xp: Mapped[int] = mapped_column(default=0)
    int_xp: Mapped[int] = mapped_column(default=0)
    ki_xp: Mapped[int] = mapped_column(default=0)
    power_level: Mapped[int] = mapped_column(default=0)
    current_transformation: Mapped[str] = mapped_column(String(20), default="base")
    sound_enabled: Mapped[bool] = mapped_column(default=True)
    theme: Mapped[str] = mapped_column(String(10), default="dark")
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    # Relationships
    habits: Mapped[list["Habit"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    categories: Mapped[list["Category"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    habit_logs: Mapped[list["HabitLog"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    daily_logs: Mapped[list["DailyLog"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    streaks: Mapped[list["Streak"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    rewards: Mapped[list["Reward"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    wishes: Mapped[list["Wish"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    off_days: Mapped[list["OffDay"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    achievements: Mapped[list["Achievement"]] = relationship(back_populates="user", cascade="all, delete-orphan")
