"""Pydantic schemas for achievements endpoint."""

import uuid
from datetime import datetime

from pydantic import BaseModel


class AchievementResponse(BaseModel):
    id: uuid.UUID
    achievement_type: str
    achievement_key: str
    milestone_type: str | None = None
    unlocked_at: datetime
    metadata_json: dict | None = None
