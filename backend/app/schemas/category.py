"""Pydantic schemas for Category endpoints."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CategoryCreate(BaseModel):
    name: str
    color_code: str
    icon: str
    sort_order: int = 0


class CategoryUpdate(BaseModel):
    name: str | None = None
    color_code: str | None = None
    icon: str | None = None
    sort_order: int | None = None


class CategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    color_code: str
    icon: str
    sort_order: int
    created_at: datetime
