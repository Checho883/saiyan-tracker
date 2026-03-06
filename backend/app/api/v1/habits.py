"""Habit endpoints — CRUD, check/uncheck, today/list, calendar, contribution-graph."""

import uuid
from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.daily_log import DailyLog
from app.models.habit import Habit
from app.models.habit_log import HabitLog
from app.models.habit_streak import HabitStreak
from app.models.off_day import OffDay
from app.models.quote import Quote
from app.models.reward import Reward
from app.models.user import User
from app.schemas.analytics import CalendarDay, ContributionDay
from app.schemas.check_habit import (
    CapsuleDropDetail,
    CheckHabitRequest,
    CheckHabitResponse,
    DailyLogSummary,
    DragonBallInfo,
    QuoteDetail,
    StreakInfo,
    TransformChange,
)
from app.schemas.habit import (
    DayDetailHabit,
    DayDetailResponse,
    HabitCalendarDay,
    HabitCreate,
    HabitResponse,
    HabitStatsResponse,
    HabitTodayResponse,
    HabitUpdate,
    ReorderRequest,
)
from app.services.habit_service import check_habit as svc_check_habit
from app.services.habit_service import get_habits_due_on_date
from app.services.off_day_service import is_off_day

router = APIRouter(prefix="/habits", tags=["habits"])


# ── Helpers ─────────────────────────────────────────────────────────────


def _get_active_habit(db: Session, habit_id: uuid.UUID, user_id: uuid.UUID) -> Habit:
    """Fetch a habit by id belonging to user. Raises 404 if missing or inactive."""
    habit = (
        db.query(Habit)
        .filter(Habit.id == habit_id, Habit.user_id == user_id, Habit.is_active == True)  # noqa: E712
        .first()
    )
    if habit is None:
        raise HTTPException(status_code=404, detail="Habit not found")
    return habit


def select_quote_for_context(db: Session, result: dict) -> QuoteDetail | None:
    """Pick a context-appropriate quote based on the check_habit result."""
    if not result["is_checking"]:
        return None

    # Priority: transformation > perfect_day > zenkai > habit_complete
    if result.get("transform_change") is not None:
        trigger = "transformation"
    elif result["is_perfect_day"] and result["is_checking"]:
        trigger = "perfect_day"
    elif result.get("zenkai_activated"):
        trigger = "zenkai"
    else:
        trigger = "habit_complete"

    quote = (
        db.query(Quote)
        .filter(Quote.trigger_event == trigger)
        .order_by(func.random())
        .first()
    )
    if quote is None:
        return None

    return QuoteDetail(
        character=quote.character,
        quote_text=quote.quote_text,
        source_saga=quote.source_saga,
        avatar_path=f"/avatars/{quote.character}.png",
    )


# ── CRUD ────────────────────────────────────────────────────────────────


@router.post("/", response_model=HabitResponse, status_code=201)
def create_habit(
    body: HabitCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    habit = Habit(
        id=uuid.uuid4(),
        user_id=user.id,
        **body.model_dump(),
    )
    db.add(habit)
    db.commit()
    db.refresh(habit)
    return habit


@router.get("/", response_model=list[HabitResponse])
def list_habits(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return (
        db.query(Habit)
        .filter(Habit.user_id == user.id, Habit.is_active == True)  # noqa: E712
        .all()
    )


@router.get("/today/list", response_model=list[HabitTodayResponse])
def today_list(
    local_date: str = Query(..., pattern=r"^\d{4}-\d{2}-\d{2}$"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Return habits due today with completion status and streak info."""
    due_habits = get_habits_due_on_date(db, user.id, local_date)
    result = []
    for habit in due_habits:
        # Check completion
        log = (
            db.query(HabitLog)
            .filter(
                HabitLog.habit_id == habit.id,
                HabitLog.log_date == local_date,
                HabitLog.completed == True,  # noqa: E712
            )
            .first()
        )
        completed = log is not None

        # Get streak info
        h_streak = (
            db.query(HabitStreak)
            .filter(HabitStreak.habit_id == habit.id)
            .first()
        )
        streak_current = h_streak.current_streak if h_streak else 0
        streak_best = h_streak.best_streak if h_streak else 0

        result.append(
            HabitTodayResponse(
                id=habit.id,
                title=habit.title,
                description=habit.description,
                icon_emoji=habit.icon_emoji,
                importance=habit.importance,
                attribute=habit.attribute,
                frequency=habit.frequency,
                custom_days=habit.custom_days,
                target_time=habit.target_time,
                is_temporary=habit.is_temporary,
                start_date=habit.start_date,
                end_date=habit.end_date,
                sort_order=habit.sort_order,
                is_active=habit.is_active,
                category_id=habit.category_id,
                created_at=habit.created_at,
                completed=completed,
                streak_current=streak_current,
                streak_best=streak_best,
            )
        )
    return result


@router.get("/calendar/all", response_model=list[CalendarDay])
def calendar_all(
    month: str = Query(..., pattern=r"^\d{4}-\d{2}$"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Return daily heatmap data for the given month."""
    prefix = f"{month}%"

    daily_logs = (
        db.query(DailyLog)
        .filter(DailyLog.user_id == user.id, DailyLog.log_date.like(prefix))
        .all()
    )

    off_days = (
        db.query(OffDay)
        .filter(OffDay.user_id == user.id, OffDay.off_date.like(prefix))
        .all()
    )
    off_day_dates = {od.off_date for od in off_days}

    result_map: dict[str, CalendarDay] = {}
    for dl in daily_logs:
        result_map[dl.log_date] = CalendarDay(
            date=dl.log_date,
            is_perfect_day=dl.is_perfect_day,
            completion_tier=dl.completion_tier,
            xp_earned=dl.xp_earned,
            is_off_day=dl.log_date in off_day_dates,
        )

    # Add pure off days (no DailyLog entry)
    for od_date in off_day_dates:
        if od_date not in result_map:
            result_map[od_date] = CalendarDay(
                date=od_date,
                is_perfect_day=False,
                completion_tier="base",
                xp_earned=0,
                is_off_day=True,
            )

    return sorted(result_map.values(), key=lambda d: d.date)


# ── Day Detail (per-habit breakdown) ──────────────────────────────────


@router.get("/calendar/day-detail", response_model=DayDetailResponse)
def calendar_day_detail(
    date: str = Query(..., pattern=r"^\d{4}-\d{2}-\d{2}$"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Return per-habit completion breakdown for a specific date."""
    # Get all habits that were due on this date
    due_habits = get_habits_due_on_date(db, user.id, date)

    # Check if it's an off day
    off_day = is_off_day(db, user.id, date)

    # Get completion logs for this date
    habit_ids = [h.id for h in due_habits]
    logs = (
        db.query(HabitLog)
        .filter(
            HabitLog.habit_id.in_(habit_ids),
            HabitLog.log_date == date,
        )
        .all()
    )
    log_map = {log.habit_id: log for log in logs}

    # Get daily log for aggregate data
    daily_log = (
        db.query(DailyLog)
        .filter(DailyLog.user_id == user.id, DailyLog.log_date == date)
        .first()
    )

    total_xp = daily_log.xp_earned if daily_log else 0
    completion_tier = daily_log.completion_tier if daily_log else "base"
    is_perfect = daily_log.is_perfect_day if daily_log else False

    # Build per-habit detail
    habit_details = []
    for habit in due_habits:
        log = log_map.get(habit.id)
        completed = log is not None and log.completed
        xp = log.attribute_xp_awarded if log and log.completed else 0
        habit_details.append(DayDetailHabit(
            id=habit.id,
            title=habit.title,
            icon_emoji=habit.icon_emoji,
            completed=completed,
            attribute_xp_awarded=xp,
            is_excused=off_day,
        ))

    return DayDetailResponse(
        date=date,
        total_xp=total_xp,
        completion_tier=completion_tier,
        is_off_day=off_day,
        is_perfect_day=is_perfect,
        habits=habit_details,
    )


# ── Reorder ────────────────────────────────────────────────────────────


@router.put("/reorder", response_model=list[HabitResponse])
def reorder_habits(
    body: ReorderRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Batch update sort_order for habits. Position in array = sort_order value."""
    habits = (
        db.query(Habit)
        .filter(
            Habit.id.in_(body.habit_ids),
            Habit.user_id == user.id,
            Habit.is_active == True,  # noqa: E712
        )
        .all()
    )
    habit_map = {h.id: h for h in habits}

    for hid in body.habit_ids:
        if hid not in habit_map:
            raise HTTPException(
                status_code=400,
                detail=f"Habit {hid} not found or does not belong to user",
            )

    for idx, hid in enumerate(body.habit_ids):
        habit_map[hid].sort_order = idx

    db.commit()

    return [habit_map[hid] for hid in body.habit_ids]


@router.get("/{habit_id}", response_model=HabitResponse)
def get_habit(
    habit_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return _get_active_habit(db, habit_id, user.id)


@router.put("/{habit_id}", response_model=HabitResponse)
def update_habit(
    habit_id: uuid.UUID,
    body: HabitUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    habit = _get_active_habit(db, habit_id, user.id)
    updates = body.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(habit, field, value)
    db.commit()
    db.refresh(habit)
    return habit


@router.delete("/{habit_id}", status_code=204)
def delete_habit(
    habit_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    habit = _get_active_habit(db, habit_id, user.id)
    habit.is_active = False
    db.commit()


# ── Check / Uncheck ────────────────────────────────────────────────────


@router.post("/{habit_id}/check", response_model=CheckHabitResponse)
def check_habit_endpoint(
    habit_id: uuid.UUID,
    body: CheckHabitRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    local_date = body.local_date

    # Validate off day
    if is_off_day(db, user.id, local_date):
        raise HTTPException(status_code=409, detail="Cannot check habits on an off day")

    # Validate habit exists
    habit = _get_active_habit(db, habit_id, user.id)

    # Validate habit is due
    due_habits = get_habits_due_on_date(db, user.id, local_date)
    if habit_id not in [h.id for h in due_habits]:
        raise HTTPException(status_code=422, detail="Habit is not due on this date")

    # Call service
    result = svc_check_habit(db, user.id, habit_id, local_date)
    db.commit()

    # Enrich capsule
    capsule_detail = None
    if result.get("capsule") is not None:
        reward = db.query(Reward).filter(Reward.id == uuid.UUID(result["capsule"]["reward_id"])).first()
        if reward:
            capsule_detail = CapsuleDropDetail(
                id=uuid.UUID(result["capsule"]["id"]),
                reward_id=reward.id,
                reward_title=reward.title,
                reward_rarity=reward.rarity,
            )

    # Select quote
    quote_detail = select_quote_for_context(db, result)

    # Enrich streak milestone events with quotes
    for event in result.get("events", []):
        if event["type"] == "streak_milestone":
            milestone_quote = (
                db.query(Quote)
                .filter(Quote.trigger_event == "streak_milestone")
                .order_by(func.random())
                .first()
            )
            if milestone_quote:
                event["quote"] = {
                    "character": milestone_quote.character,
                    "quote_text": milestone_quote.quote_text,
                    "source_saga": milestone_quote.source_saga,
                    "avatar_path": f"/avatars/{milestone_quote.character}.png",
                }

    # Shape streak
    streak_info = StreakInfo(
        current_streak=result["streak"]["current_streak"],
        best_streak=result["streak"]["best_streak"],
    )
    habit_streak_info = StreakInfo(
        current_streak=result["habit_streak"]["current_streak"],
        best_streak=result["habit_streak"]["best_streak"],
    )

    # Shape transform change
    transform_change = None
    if result.get("transform_change") is not None:
        transform_change = TransformChange(**result["transform_change"])

    # Shape dragon ball
    dragon_ball = None
    if result.get("dragon_ball") is not None:
        dragon_ball = DragonBallInfo(**result["dragon_ball"])

    # Shape daily log
    daily_log = DailyLogSummary(**result["daily_log"])

    return CheckHabitResponse(
        is_checking=result["is_checking"],
        habit_id=uuid.UUID(result["habit_id"]),
        log_date=result["log_date"],
        attribute_xp_awarded=result["attribute_xp_awarded"],
        is_perfect_day=result["is_perfect_day"],
        zenkai_activated=result["zenkai_activated"],
        daily_log=daily_log,
        streak=streak_info,
        habit_streak=habit_streak_info,
        power_level=result["power_level"],
        transformation=result["transformation"],
        transform_change=transform_change,
        dragon_ball=dragon_ball,
        capsule=capsule_detail,
        quote=quote_detail,
        events=result.get("events", []),
    )


# ── Contribution Graph ──────────────────────────────────────────────────


@router.get("/{habit_id}/contribution-graph", response_model=list[ContributionDay])
def contribution_graph(
    habit_id: uuid.UUID,
    days: int = Query(default=90, ge=1, le=365),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Return daily completion booleans for the last N days."""
    _get_active_habit(db, habit_id, user.id)

    today = date.today()
    start_date = today - timedelta(days=days - 1)
    start_str = start_date.isoformat()

    completed_logs = (
        db.query(HabitLog.log_date)
        .filter(
            HabitLog.habit_id == habit_id,
            HabitLog.log_date >= start_str,
            HabitLog.completed == True,  # noqa: E712
        )
        .all()
    )
    completed_dates = {row.log_date for row in completed_logs}

    result = []
    for i in range(days):
        d = start_date + timedelta(days=i)
        d_str = d.isoformat()
        result.append(ContributionDay(date=d_str, completed=d_str in completed_dates))

    return result


# ── Per-Habit Calendar & Stats ─────────────────────────────────────────


@router.get("/{habit_id}/calendar", response_model=list[HabitCalendarDay])
def habit_calendar(
    habit_id: uuid.UUID,
    start_date: str | None = Query(default=None, pattern=r"^\d{4}-\d{2}-\d{2}$"),
    end_date: str | None = Query(default=None, pattern=r"^\d{4}-\d{2}-\d{2}$"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Return per-habit completion history with XP data."""
    _get_active_habit(db, habit_id, user.id)

    today = date.today()
    if end_date is not None:
        end_d = date.fromisoformat(end_date)
    else:
        end_d = today
    if start_date is not None:
        start_d = date.fromisoformat(start_date)
    else:
        start_d = end_d - timedelta(days=89)  # 90 days including end

    start_str = start_d.isoformat()
    end_str = end_d.isoformat()

    logs = (
        db.query(HabitLog)
        .filter(
            HabitLog.habit_id == habit_id,
            HabitLog.log_date >= start_str,
            HabitLog.log_date <= end_str,
        )
        .all()
    )
    log_map = {log.log_date: log for log in logs}

    result = []
    current = start_d
    while current <= end_d:
        d_str = current.isoformat()
        log = log_map.get(d_str)
        result.append(HabitCalendarDay(
            date=d_str,
            completed=log.completed if log else False,
            attribute_xp_awarded=log.attribute_xp_awarded if log and log.completed else 0,
        ))
        current += timedelta(days=1)

    return result


@router.get("/{habit_id}/stats", response_model=HabitStatsResponse)
def habit_stats(
    habit_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Return per-habit statistics."""
    _get_active_habit(db, habit_id, user.id)

    # Total completions
    total_completions = (
        db.query(HabitLog)
        .filter(HabitLog.habit_id == habit_id, HabitLog.completed == True)  # noqa: E712
        .count()
    )

    # Streak info
    h_streak = db.query(HabitStreak).filter(HabitStreak.habit_id == habit_id).first()
    current_streak = h_streak.current_streak if h_streak else 0
    best_streak = h_streak.best_streak if h_streak else 0

    # 30-day completion rate
    thirty_days_ago = (date.today() - timedelta(days=30)).isoformat()
    recent_completions = (
        db.query(HabitLog)
        .filter(
            HabitLog.habit_id == habit_id,
            HabitLog.log_date >= thirty_days_ago,
            HabitLog.completed == True,  # noqa: E712
        )
        .count()
    )
    completion_rate_30d = recent_completions / 30.0

    # Total XP earned
    total_xp = (
        db.query(func.coalesce(func.sum(HabitLog.attribute_xp_awarded), 0))
        .filter(HabitLog.habit_id == habit_id, HabitLog.completed == True)  # noqa: E712
        .scalar()
    )

    return HabitStatsResponse(
        total_completions=total_completions,
        current_streak=current_streak,
        best_streak=best_streak,
        completion_rate_30d=round(completion_rate_30d, 4),
        total_xp_earned=total_xp,
    )
