"""Quote model — global seed data, no user_id."""

import uuid
from typing import Optional

from sqlalchemy import String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Quote(Base):
    __tablename__ = "quotes"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    character: Mapped[str] = mapped_column(String(20))
    quote_text: Mapped[str] = mapped_column(Text)
    source_saga: Mapped[str] = mapped_column(String(100))
    trigger_event: Mapped[str] = mapped_column(String(30))
    transformation_level: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    severity: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
