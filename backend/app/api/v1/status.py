"""Status endpoint — welcome-back and roast detection on app load."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.status import StatusResponse
from app.services.roast_service import get_welcome_status

router = APIRouter(prefix="/status", tags=["status"])


@router.get("/", response_model=StatusResponse)
def get_status(
    local_date: str = Query(..., pattern=r"^\d{4}-\d{2}-\d{2}$"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Return welcome-back and roast data for the current user.

    Called by frontend on app load. Returns both null when no absence gap.
    """
    result = get_welcome_status(db, user.id, local_date)

    # Build response - handle the nested dict structure
    welcome_back = None
    roast = None

    if result.get("welcome_back"):
        welcome_back = result["welcome_back"]

    if result.get("roast"):
        roast = result["roast"]

    return StatusResponse(welcome_back=welcome_back, roast=roast)
