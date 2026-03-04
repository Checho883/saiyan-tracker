"""Power and Attributes endpoints — power level, transformation, attribute breakdown."""

import math

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.constants import (
    ATTRIBUTE_LEVEL_BASE_XP,
    ATTRIBUTE_LEVEL_FORMULA_EXPONENT,
    TRANSFORMATIONS,
    VALID_ATTRIBUTES,
)
from app.models.user import User
from app.schemas.power import AttributeDetail, PowerResponse
from app.services.attribute_service import (
    calc_attribute_level,
    get_attribute_title,
    get_xp_for_next_level,
)
from app.services.power_service import get_transformation_for_power

router = APIRouter(tags=["power"])


def _build_attribute_details(user: User) -> list[AttributeDetail]:
    """Build AttributeDetail list for all 4 attributes."""
    details = []
    for attr in VALID_ATTRIBUTES:
        raw_xp = getattr(user, f"{attr}_xp")
        level = calc_attribute_level(raw_xp)
        title = get_attribute_title(attr, level)
        xp_for_next = get_xp_for_next_level(level)

        # Compute xp consumed up to current level
        xp_consumed = 0
        for lv in range(1, level + 1):
            xp_consumed += math.floor(
                ATTRIBUTE_LEVEL_BASE_XP * (lv ** ATTRIBUTE_LEVEL_FORMULA_EXPONENT)
            )

        xp_into_current = raw_xp - xp_consumed
        progress_percent = (xp_into_current / xp_for_next * 100) if xp_for_next > 0 else 0.0

        details.append(
            AttributeDetail(
                attribute=attr,
                raw_xp=raw_xp,
                level=level,
                title=title,
                xp_for_current_level=xp_consumed,
                xp_for_next_level=xp_for_next,
                progress_percent=round(progress_percent, 2),
            )
        )
    return details


@router.get("/power/current", response_model=PowerResponse)
def power_current(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    current_form = get_transformation_for_power(user.power_level)

    # Find next transformation
    next_transformation = None
    next_threshold = None
    found_current = False
    for form in TRANSFORMATIONS:
        if found_current:
            next_transformation = form["key"]
            next_threshold = form["threshold"]
            break
        if form["key"] == current_form["key"]:
            found_current = True

    attributes = _build_attribute_details(user)

    return PowerResponse(
        power_level=user.power_level,
        transformation=current_form["key"],
        transformation_name=current_form["name"],
        next_transformation=next_transformation,
        next_threshold=next_threshold,
        dragon_balls_collected=user.dragon_balls_collected,
        wishes_granted=user.wishes_granted,
        attributes=attributes,
    )


@router.get("/attributes/", response_model=list[AttributeDetail])
def list_attributes(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return _build_attribute_details(user)
