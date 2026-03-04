"""User settings GET/PUT endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.settings import SettingsResponse, SettingsUpdate

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("/", response_model=SettingsResponse)
def get_settings(user: User = Depends(get_current_user)):
    return SettingsResponse(
        display_name=user.display_name,
        sound_enabled=user.sound_enabled,
        theme=user.theme,
    )


@router.put("/", response_model=SettingsResponse)
def update_settings(
    body: SettingsUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return SettingsResponse(
        display_name=user.display_name,
        sound_enabled=user.sound_enabled,
        theme=user.theme,
    )
