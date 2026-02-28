from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.quote_service import QuoteService
from app.services.power_service import PowerService

router = APIRouter()
DEFAULT_USER_ID = "default-user"

@router.get("/vegeta/roast")
def get_vegeta_roast(missed_days: int = 1, db: Session = Depends(get_db)):
    return QuoteService.get_vegeta_roast(db, missed_days)

@router.get("/goku/motivation")
def get_goku_motivation(context: str = "motivation", db: Session = Depends(get_db)):
    return QuoteService.get_goku_motivation(db, context)

@router.get("/contextual")
def get_contextual_quote(db: Session = Depends(get_db)):
    power = PowerService.get_current_power(db, DEFAULT_USER_ID)
    if not power:
        return QuoteService.get_goku_motivation(db, "motivation")
    return QuoteService.get_contextual_quote(
        db, DEFAULT_USER_ID,
        power["daily_minimum_met"],
        power["current_streak"]
    )
