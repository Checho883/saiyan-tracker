"""Pydantic schemas for Wish endpoints."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class WishCreate(BaseModel):
    title: str


class WishUpdate(BaseModel):
    title: str | None = None
    is_active: bool | None = None


class WishResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    is_active: bool
    times_wished: int
    created_at: datetime


class WishGrantRequest(BaseModel):
    wish_id: uuid.UUID


class WishGrantResponse(BaseModel):
    wish_title: str
    times_wished: int
    wishes_granted: int
