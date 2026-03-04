"""Off-day management endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.off_day import OffDay
from app.models.user import User
from app.schemas.off_day import OffDayCreate, OffDayResponse, OffDayMarkResponse
from app.services.off_day_service import cancel_off_day, is_off_day, mark_off_day

router = APIRouter(prefix="/off-days", tags=["off-days"])


@router.post("/", response_model=OffDayMarkResponse)
def mark_off_day_endpoint(
    body: OffDayCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if is_off_day(db, user.id, body.local_date):
        raise HTTPException(status_code=409, detail="Already an off day")
    result = mark_off_day(db, user.id, body.local_date, body.reason, body.notes)
    db.commit()
    return result


@router.get("/", response_model=list[OffDayResponse])
def list_off_days(
    month: str | None = Query(None, description="Filter by month (YYYY-MM)"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    query = db.query(OffDay).filter(OffDay.user_id == user.id)
    if month:
        query = query.filter(OffDay.off_date.startswith(month))
    return query.all()


@router.delete("/{off_date}", status_code=204)
def cancel_off_day_endpoint(
    off_date: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if not cancel_off_day(db, user.id, off_date):
        raise HTTPException(status_code=404, detail="Off day not found")
    db.commit()
    return Response(status_code=204)
