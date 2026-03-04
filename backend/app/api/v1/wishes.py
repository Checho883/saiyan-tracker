"""Wish CRUD + grant endpoints."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.models.wish import Wish
from app.schemas.wish import (
    WishCreate, WishUpdate, WishResponse,
    WishGrantRequest, WishGrantResponse,
)
from app.services.dragon_ball_service import grant_wish

router = APIRouter(prefix="/wishes", tags=["wishes"])


@router.post("/", response_model=WishResponse, status_code=201)
def create_wish(
    body: WishCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    wish = Wish(
        id=uuid.uuid4(),
        user_id=user.id,
        **body.model_dump(),
    )
    db.add(wish)
    db.commit()
    db.refresh(wish)
    return wish


@router.get("/", response_model=list[WishResponse])
def list_wishes(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return db.query(Wish).filter(Wish.user_id == user.id).all()


@router.get("/{wish_id}", response_model=WishResponse)
def get_wish(
    wish_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    wish = db.query(Wish).filter(
        Wish.id == wish_id, Wish.user_id == user.id
    ).first()
    if wish is None:
        raise HTTPException(status_code=404, detail="Wish not found")
    return wish


@router.put("/{wish_id}", response_model=WishResponse)
def update_wish(
    wish_id: uuid.UUID,
    body: WishUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    wish = db.query(Wish).filter(
        Wish.id == wish_id, Wish.user_id == user.id
    ).first()
    if wish is None:
        raise HTTPException(status_code=404, detail="Wish not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(wish, key, value)
    db.commit()
    db.refresh(wish)
    return wish


@router.delete("/{wish_id}", status_code=204)
def delete_wish(
    wish_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    wish = db.query(Wish).filter(
        Wish.id == wish_id, Wish.user_id == user.id
    ).first()
    if wish is None:
        raise HTTPException(status_code=404, detail="Wish not found")
    db.delete(wish)
    db.commit()
    return Response(status_code=204)


@router.post("/grant", response_model=WishGrantResponse)
def grant_wish_endpoint(
    body: WishGrantRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        result = grant_wish(db, user, body.wish_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    db.commit()
    return result
