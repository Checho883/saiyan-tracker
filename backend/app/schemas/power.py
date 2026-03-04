"""Pydantic schemas for Power endpoint (used by Plan 03-02)."""

from pydantic import BaseModel


class AttributeDetail(BaseModel):
    attribute: str
    raw_xp: int
    level: int
    title: str | None
    xp_for_current_level: int
    xp_for_next_level: int
    progress_percent: float


class PowerResponse(BaseModel):
    power_level: int
    transformation: str
    transformation_name: str
    next_transformation: str | None
    next_threshold: int | None
    dragon_balls_collected: int
    wishes_granted: int
    attributes: list[AttributeDetail]
