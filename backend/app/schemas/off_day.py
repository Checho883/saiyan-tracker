"""Pydantic schemas for Off-Day endpoints."""

import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class OffDayCreate(BaseModel):
    local_date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    reason: Literal["sick", "vacation", "rest", "injury", "other"] = "rest"
    notes: str | None = None


class OffDayResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    off_date: str
    reason: str
    notes: str | None
    created_at: datetime


class OffDayMarkResponse(BaseModel):
    off_date: str
    habits_reversed: int
    xp_clawed_back: int
