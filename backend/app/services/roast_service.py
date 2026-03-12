"""Roast service — absence gap detection, severity mapping, welcome-back status."""

from datetime import date
from uuid import UUID

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.off_day import OffDay
from app.models.quote import Quote
from app.services.streak_service import get_or_create_streak


def calc_roast_severity(effective_gap: int) -> str | None:
    """Map effective gap days to roast severity tier.

    Pure function.
    Thresholds: 1-2 = mild, 3-6 = medium, 7+ = savage.
    """
    if effective_gap <= 0:
        return None
    if effective_gap <= 2:
        return "mild"
    if effective_gap <= 6:
        return "medium"
    return "savage"


def detect_absence_gap(db: Session, user_id: UUID, today_str: str) -> dict:
    """Detect how long the user has been absent, subtracting off-days.

    Returns dict with gap_days, off_days_in_gap, effective_gap, severity.
    Reuses off-day gap subtraction pattern from check_zenkai_recovery().
    """
    streak = get_or_create_streak(db, user_id)

    if streak.last_active_date is None:
        return {"gap_days": 0, "off_days_in_gap": 0, "effective_gap": 0, "severity": None}

    last_date = date.fromisoformat(streak.last_active_date)
    today = date.fromisoformat(today_str)
    gap_days = (today - last_date).days

    if gap_days <= 1:
        return {"gap_days": 0, "off_days_in_gap": 0, "effective_gap": 0, "severity": None}

    # Count off-days in the gap (exclusive of both endpoints)
    off_day_count = (
        db.query(OffDay)
        .filter(
            OffDay.user_id == user_id,
            OffDay.off_date > streak.last_active_date,
            OffDay.off_date < today_str,
        )
        .count()
    )

    # effective_gap subtracts 1 (the day after last active is expected gap start)
    # and subtracts off-days
    effective_gap = max(0, gap_days - 1 - off_day_count)
    severity = calc_roast_severity(effective_gap)

    return {
        "gap_days": gap_days,
        "off_days_in_gap": off_day_count,
        "effective_gap": effective_gap,
        "severity": severity,
    }


def get_welcome_status(db: Session, user_id: UUID, today_str: str) -> dict:
    """Get welcome-back status for app load.

    Returns dict with welcome_back (Goku quote) and roast (Vegeta quote + severity).
    Both null when no gap exists.
    """
    gap_info = detect_absence_gap(db, user_id, today_str)

    if gap_info["severity"] is None:
        return {"welcome_back": None, "roast": None}

    # Fetch Goku welcome_back quote
    welcome_quote = (
        db.query(Quote)
        .filter(Quote.trigger_event == "welcome_back", Quote.character == "goku")
        .order_by(func.random())
        .first()
    )

    # Fetch Vegeta roast quote with matching severity
    roast_quote = (
        db.query(Quote)
        .filter(
            Quote.trigger_event == "roast",
            Quote.character == "vegeta",
            Quote.severity == gap_info["severity"],
        )
        .order_by(func.random())
        .first()
    )

    welcome_data = None
    if welcome_quote:
        welcome_data = {
            "character": welcome_quote.character,
            "quote_text": welcome_quote.quote_text,
            "source_saga": welcome_quote.source_saga,
            "avatar_path": f"/assets/avatars/{welcome_quote.character}.webp",
        }

    roast_data = None
    if roast_quote:
        roast_data = {
            "quote": {
                "character": roast_quote.character,
                "quote_text": roast_quote.quote_text,
                "source_saga": roast_quote.source_saga,
                "avatar_path": f"/assets/avatars/{roast_quote.character}.webp",
            },
            "severity": gap_info["severity"],
            "gap_days": gap_info["effective_gap"],
        }

    return {"welcome_back": welcome_data, "roast": roast_data}
