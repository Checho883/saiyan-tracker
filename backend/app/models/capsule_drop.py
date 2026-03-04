"""CapsuleDrop model — history of capsule loot box drops."""

import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class CapsuleDrop(Base):
    __tablename__ = "capsule_drops"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    reward_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("rewards.id"))
    habit_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("habits.id"))
    dropped_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    claimed: Mapped[bool] = mapped_column(default=False)

    # Relationships
    user: Mapped["User"] = relationship()
    reward: Mapped["Reward"] = relationship(back_populates="capsule_drops")
    habit: Mapped["Habit"] = relationship()
