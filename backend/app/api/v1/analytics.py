"""Analytics endpoints — summary stats, capsule history, wish history, off-day summary, completion trends."""

from datetime import date, timedelta
from typing import Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.capsule_drop import CapsuleDrop
from app.models.daily_log import DailyLog
from app.models.habit import Habit
from app.models.off_day import OffDay
from app.models.reward import Reward
from app.models.streak import Streak
from app.models.user import User
from app.models.wish import Wish
from app.models.wish_log import WishLog
from app.schemas.analytics import (
    AnalyticsSummary,
    CapsuleHistoryItem,
    CompletionTrend,
    OffDaySummary,
    WishHistoryItem,
)

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


@router.get("/off-day-summary", response_model=OffDaySummary)
def off_day_summary(
    period: Literal["week", "month", "all"] = Query(default="all"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Return off-day analytics: totals, XP impact, streaks preserved, reason breakdown."""
    today = date.today()

    # Build off-day query with period filter
    od_query = db.query(OffDay).filter(OffDay.user_id == user.id)
    if period == "week":
        start = (today - timedelta(days=7)).isoformat()
        od_query = od_query.filter(OffDay.off_date >= start)
    elif period == "month":
        start = (today - timedelta(days=30)).isoformat()
        od_query = od_query.filter(OffDay.off_date >= start)

    off_days = od_query.all()
    total_off_days = len(off_days)

    # XP impact estimate: avg daily XP * off-day count
    all_logs = db.query(DailyLog).filter(DailyLog.user_id == user.id).all()
    avg_daily_xp = sum(dl.xp_earned for dl in all_logs) / len(all_logs) if all_logs else 0
    xp_impact_estimate = int(avg_daily_xp * total_off_days)

    # Streaks preserved: off-days that fell between two active days
    # An off-day "preserved" a streak if there's a DailyLog on the day before OR the day after
    streaks_preserved = 0
    for od in off_days:
        od_date = date.fromisoformat(od.off_date)
        day_before = (od_date - timedelta(days=1)).isoformat()
        day_after = (od_date + timedelta(days=1)).isoformat()
        has_before = (
            db.query(DailyLog)
            .filter(DailyLog.user_id == user.id, DailyLog.log_date == day_before)
            .first()
            is not None
        )
        has_after = (
            db.query(DailyLog)
            .filter(DailyLog.user_id == user.id, DailyLog.log_date == day_after)
            .first()
            is not None
        )
        if has_before or has_after:
            streaks_preserved += 1

    # Reason breakdown: dynamic GROUP BY
    reason_counts = (
        db.query(OffDay.reason, func.count(OffDay.id))
        .filter(OffDay.user_id == user.id)
    )
    if period == "week":
        start = (today - timedelta(days=7)).isoformat()
        reason_counts = reason_counts.filter(OffDay.off_date >= start)
    elif period == "month":
        start = (today - timedelta(days=30)).isoformat()
        reason_counts = reason_counts.filter(OffDay.off_date >= start)
    reason_counts = reason_counts.group_by(OffDay.reason).all()
    reason_breakdown = {reason: count for reason, count in reason_counts}

    return OffDaySummary(
        total_off_days=total_off_days,
        xp_impact_estimate=xp_impact_estimate,
        streaks_preserved=streaks_preserved,
        reason_breakdown=reason_breakdown,
    )


@router.get("/completion-trend", response_model=CompletionTrend)
def completion_trend(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Return weekly and monthly completion rates with period-over-period deltas."""
    today = date.today()

    def _aggregate_period(start_str: str, end_str: str) -> tuple[int, int, float]:
        """Sum habits_due and habits_completed for a date range, return (due, completed, rate)."""
        logs = (
            db.query(DailyLog)
            .filter(
                DailyLog.user_id == user.id,
                DailyLog.log_date >= start_str,
                DailyLog.log_date < end_str,
            )
            .all()
        )
        due = sum(dl.habits_due for dl in logs)
        completed = sum(dl.habits_completed for dl in logs)
        rate = completed / due if due > 0 else 0.0
        return due, completed, rate

    # Weekly: last 7 days
    week_start = (today - timedelta(days=7)).isoformat()
    today_str = today.isoformat()
    # Use today + 1 day as end to include today
    tomorrow_str = (today + timedelta(days=1)).isoformat()

    w_due, w_completed, w_rate = _aggregate_period(week_start, tomorrow_str)

    # Previous week: 14-7 days ago
    prev_week_start = (today - timedelta(days=14)).isoformat()
    pw_due, pw_completed, pw_rate = _aggregate_period(prev_week_start, week_start)

    weekly_delta = round(w_rate - pw_rate, 4)

    # Monthly: last 30 days
    month_start = (today - timedelta(days=30)).isoformat()
    m_due, m_completed, m_rate = _aggregate_period(month_start, tomorrow_str)

    # Previous month: 60-30 days ago
    prev_month_start = (today - timedelta(days=60)).isoformat()
    pm_due, pm_completed, pm_rate = _aggregate_period(prev_month_start, month_start)

    monthly_delta = round(m_rate - pm_rate, 4)

    return CompletionTrend(
        weekly_rate=round(w_rate, 4),
        weekly_delta=weekly_delta,
        weekly_habits_due=w_due,
        weekly_habits_completed=w_completed,
        monthly_rate=round(m_rate, 4),
        monthly_delta=monthly_delta,
        monthly_habits_due=m_due,
        monthly_habits_completed=m_completed,
    )
