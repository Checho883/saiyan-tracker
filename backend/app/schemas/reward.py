"""Pydantic schemas for Reward endpoints."""

import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict


class RewardCreate(BaseModel):
    title: str
    rarity: Literal["common", "rare", "epic"] = "common"


class RewardUpdate(BaseModel):
    title: str | None = None
    rarity: Literal["common", "rare", "epic"] | None = None
    is_active: bool | None = None


class RewardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    rarity: str
    is_active: bool
    created_at: datetime
