"""Pydantic schemas for Settings endpoints."""

from typing import Literal

from pydantic import BaseModel


class SettingsResponse(BaseModel):
    display_name: str
    sound_enabled: bool
    theme: str


class SettingsUpdate(BaseModel):
    display_name: str | None = None
    sound_enabled: bool | None = None
    theme: Literal["dark", "light"] | None = None
