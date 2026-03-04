"""WishLog model — records when wishes were granted."""

import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class WishLog(Base):
    __tablename__ = "wish_logs"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    wish_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("wishes.id", ondelete="CASCADE"))
    granted_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    # Relationships
    user: Mapped["User"] = relationship()
    wish: Mapped["Wish"] = relationship(back_populates="wish_logs")
