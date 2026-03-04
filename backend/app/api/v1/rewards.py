"""Reward CRUD endpoints."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.reward import Reward
from app.models.user import User
from app.schemas.reward import RewardCreate, RewardUpdate, RewardResponse

router = APIRouter(prefix="/rewards", tags=["rewards"])


@router.post("/", response_model=RewardResponse, status_code=201)
def create_reward(
    body: RewardCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    reward = Reward(
        id=uuid.uuid4(),
        user_id=user.id,
        **body.model_dump(),
    )
    db.add(reward)
    db.commit()
    db.refresh(reward)
    return reward


@router.get("/", response_model=list[RewardResponse])
def list_rewards(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return db.query(Reward).filter(Reward.user_id == user.id).all()


@router.get("/{reward_id}", response_model=RewardResponse)
def get_reward(
    reward_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    reward = db.query(Reward).filter(
        Reward.id == reward_id, Reward.user_id == user.id
    ).first()
    if reward is None:
        raise HTTPException(status_code=404, detail="Reward not found")
    return reward


@router.put("/{reward_id}", response_model=RewardResponse)
def update_reward(
    reward_id: uuid.UUID,
    body: RewardUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    reward = db.query(Reward).filter(
        Reward.id == reward_id, Reward.user_id == user.id
    ).first()
    if reward is None:
        raise HTTPException(status_code=404, detail="Reward not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(reward, key, value)
    db.commit()
    db.refresh(reward)
    return reward


@router.delete("/{reward_id}", status_code=204)
def delete_reward(
    reward_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    reward = db.query(Reward).filter(
        Reward.id == reward_id, Reward.user_id == user.id
    ).first()
    if reward is None:
        raise HTTPException(status_code=404, detail="Reward not found")
    db.delete(reward)
    db.commit()
    return Response(status_code=204)
