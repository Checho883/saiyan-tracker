"""Achievement model — transformation unlocks, streak milestones, etc."""

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import String, JSON, ForeignKey, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Achievement(Base):
    __tablename__ = "achievements"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    achievement_type: Mapped[str] = mapped_column(String(50))
    achievement_key: Mapped[str] = mapped_column(String(50))
    milestone_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    unlocked_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    metadata_json: Mapped[Optional[dict]] = mapped_column(
        "metadata", JSON, nullable=True
    )

    # Relationships
    user: Mapped["User"] = relationship(back_populates="achievements")
