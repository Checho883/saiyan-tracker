"""Analytics endpoints — summary stats, capsule history, wish history."""

from datetime import date, timedelta
from typing import Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.capsule_drop import CapsuleDrop
from app.models.daily_log import DailyLog
from app.models.habit import Habit
from app.models.reward import Reward
from app.models.streak import Streak
from app.models.user import User
from app.models.wish import Wish
from app.models.wish_log import WishLog
from app.schemas.analytics import AnalyticsSummary, CapsuleHistoryItem, WishHistoryItem

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary", response_model=AnalyticsSummary)
def analytics_summary(
    period: Literal["week", "month", "all"] = Query(default="all"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    today = date.today()

    query = db.query(DailyLog).filter(DailyLog.user_id == user.id)

    if period == "week":
        start = (today - timedelta(days=7)).isoformat()
        query = query.filter(DailyLog.log_date >= start)
    elif period == "month":
        start = (today - timedelta(days=30)).isoformat()
        query = query.filter(DailyLog.log_date >= start)

    logs = query.all()

    perfect_days = sum(1 for dl in logs if dl.is_perfect_day)
    avg_completion = (
        sum(dl.habit_completion_rate for dl in logs) / len(logs) if logs else 0.0
    )
    total_xp = sum(dl.xp_earned for dl in logs)
    days_tracked = len(logs)

    # Longest streak
    streak = db.query(Streak).filter(Streak.user_id == user.id).first()
    longest_streak = streak.best_streak if streak else 0

    return AnalyticsSummary(
        perfect_days=perfect_days,
        avg_completion=round(avg_completion, 4),
        total_xp=total_xp,
        days_tracked=days_tracked,
        longest_streak=longest_streak,
    )


@router.get("/capsule-history", response_model=list[CapsuleHistoryItem])
def capsule_history(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    drops = (
        db.query(CapsuleDrop, Reward, Habit)
        .join(Reward, CapsuleDrop.reward_id == Reward.id)
        .join(Habit, CapsuleDrop.habit_id == Habit.id)
        .filter(CapsuleDrop.user_id == user.id)
        .order_by(CapsuleDrop.dropped_at.desc())
        .all()
    )

    return [
        CapsuleHistoryItem(
            id=drop.id,
            reward_title=reward.title,
            reward_rarity=reward.rarity,
            habit_title=habit.title,
            dropped_at=drop.dropped_at,
        )
        for drop, reward, habit in drops
    ]


@router.get("/wish-history", response_model=list[WishHistoryItem])
def wish_history(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    logs = (
        db.query(WishLog, Wish)
        .join(Wish, WishLog.wish_id == Wish.id)
        .filter(WishLog.user_id == user.id)
        .order_by(WishLog.granted_at.desc())
        .all()
    )

    return [
        WishHistoryItem(
            id=log.id,
            wish_title=wish.title,
            granted_at=log.granted_at,
        )
        for log, wish in logs
    ]
