"""Random quote endpoint."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.quote import Quote
from app.schemas.quote import QuoteResponse

router = APIRouter(prefix="/quotes", tags=["quotes"])


@router.get("/random", response_model=QuoteResponse)
def get_random_quote(
    trigger_event: str | None = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Quote)
    if trigger_event:
        query = query.filter(Quote.trigger_event == trigger_event)
    quote = query.order_by(func.random()).first()
    if quote is None:
        raise HTTPException(status_code=404, detail="No quotes found")
    return QuoteResponse(
        character=quote.character,
        quote_text=quote.quote_text,
        source_saga=quote.source_saga,
        avatar_path=f"/assets/avatars/{quote.character}.webp",
    )
