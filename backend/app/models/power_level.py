"""PowerLevel model — daily snapshot of cumulative power level."""

import uuid

from sqlalchemy import String, ForeignKey, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class PowerLevel(Base):
    __tablename__ = "power_levels"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    log_date: Mapped[str] = mapped_column(String(10))  # YYYY-MM-DD
    total_points: Mapped[int] = mapped_column(default=0)
    transformation_level: Mapped[str] = mapped_column(String(20), default="base")

    # Relationships
    user: Mapped["User"] = relationship()
