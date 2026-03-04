"""API dependencies — user resolution and database session."""

from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db  # re-export
from app.models.user import User


def get_current_user(db: Session = Depends(get_db)) -> User:
    """Return the single default user. Swap for auth later."""
    user = db.query(User).first()
    if user is None:
        raise HTTPException(status_code=500, detail="No default user found. Run seed.")
    return user
