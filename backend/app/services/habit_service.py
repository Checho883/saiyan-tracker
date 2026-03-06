"""Habit service — check_habit() atomic transaction and habit scheduling helpers."""

import uuid
from datetime import date, datetime
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.daily_log import DailyLog
from app.models.habit import Habit
from app.models.habit_log import HabitLog
from app.models.user import User
from app.services.capsule_service import roll_capsule_drop
from app.services.dragon_ball_service import award_dragon_ball, revoke_dragon_ball
from app.services.power_service import (
    check_transformation_change,
    recalculate_power_level,
)
from app.services.streak_service import (
    check_zenkai_recovery,
    get_or_create_streak,
    update_habit_streak,
    update_overall_streak,
)
from app.services.achievement_service import (
    detect_attribute_level_change,
    detect_streak_milestones,
    get_milestone_badge_name,
    record_achievement,
)
from app.services.xp_service import (
    calc_daily_xp,
    calc_streak_bonus,
    get_attribute_xp,
    get_completion_tier,
)


def get_habits_due_on_date(
    db: Session, user_id: UUID, local_date: str
) -> list[Habit]:
    """Return all active habits due on the given date.

    Filters by frequency (daily/weekdays/custom), start_date, end_date, is_active.
    """
    target = date.fromisoformat(local_date)

    habits = (
        db.query(Habit)
        .filter(
            Habit.user_id == user_id,
            Habit.is_active == True,  # noqa: E712
            Habit.start_date <= local_date,
        )
        .all()
    )

    due = []
    for habit in habits:
        # Exclude habits that have ended
        if habit.end_date is not None and habit.end_date < local_date:
            continue

        if habit.frequency == "daily":
            due.append(habit)
        elif habit.frequency == "weekdays":
            if target.weekday() < 5:  # Mon=0 through Fri=4
                due.append(habit)
        elif habit.frequency == "custom":
            if habit.custom_days and target.isoweekday() in habit.custom_days:
                due.append(habit)

    return due


def check_habit(
    db: Session, user_id: UUID, habit_id: UUID, local_date: str
) -> dict:
    """Toggle a habit check and orchestrate all game mechanics atomically.

    This is the architectural centerpiece: it composes XP, streaks, Dragon Balls,
    capsule drops, power level, and transformation checks into one transaction.

    Returns a comprehensive response dict with all state changes.
    """
    try:
        user = db.query(User).filter(User.id == user_id).one()
        habit = db.query(Habit).filter(Habit.id == habit_id).one()

        # ── Step 1: Toggle habit log ──────────────────────────────────
        habit_log = (
            db.query(HabitLog)
            .filter(HabitLog.habit_id == habit_id, HabitLog.log_date == local_date)
            .first()
        )

        was_new_log = False
        if habit_log is None:
            # First check of this habit today
            habit_log = HabitLog(
                id=uuid.uuid4(),
                user_id=user_id,
                habit_id=habit_id,
                log_date=local_date,
                completed=True,
                completed_at=datetime.utcnow(),
            )
            db.add(habit_log)
            db.flush()
            is_checking = True
            was_new_log = True
        elif habit_log.completed:
            # Unchecking
            habit_log.completed = False
            habit_log.completed_at = None
            is_checking = False
        else:
            # Re-checking (was unchecked)
            habit_log.completed = True
            habit_log.completed_at = datetime.utcnow()
            is_checking = True

        # ── Step 2: Handle attribute XP ───────────────────────────────
        # Capture old XP before mutation for level-up detection
        attr_field = f"{habit.attribute}_xp"
        old_attr_xp = getattr(user, attr_field)

        if is_checking:
            xp = get_attribute_xp(habit.importance)
            habit_log.attribute_xp_awarded = xp
            setattr(user, attr_field, old_attr_xp + xp)
        else:
            # Claw back
            xp = habit_log.attribute_xp_awarded
            setattr(user, attr_field, max(0, getattr(user, attr_field) - xp))
            habit_log.attribute_xp_awarded = 0

        # ── Step 3: Update daily log ──────────────────────────────────
        habits_due = get_habits_due_on_date(db, user_id, local_date)
        habits_due_count = len(habits_due)
        due_habit_ids = [h.id for h in habits_due]

        completed_count = (
            db.query(HabitLog)
            .filter(
                HabitLog.habit_id.in_(due_habit_ids),
                HabitLog.log_date == local_date,
                HabitLog.completed == True,  # noqa: E712
            )
            .count()
        )

        completion_rate = (
            completed_count / habits_due_count if habits_due_count > 0 else 0.0
        )
        tier = get_completion_tier(completion_rate)
        is_perfect_day = completion_rate == 1.0 and habits_due_count > 0

        daily_log = (
            db.query(DailyLog)
            .filter(DailyLog.user_id == user_id, DailyLog.log_date == local_date)
            .first()
        )
        if daily_log is None:
            daily_log = DailyLog(
                id=uuid.uuid4(),
                user_id=user_id,
                log_date=local_date,
            )
            db.add(daily_log)
            db.flush()

        was_perfect_day = daily_log.is_perfect_day

        daily_log.habits_due = habits_due_count
        daily_log.habits_completed = completed_count
        daily_log.habit_completion_rate = completion_rate
        daily_log.is_perfect_day = is_perfect_day
        daily_log.completion_tier = tier["name"]

        # ── Step 4: Check Zenkai recovery (only on first log of the day) ──
        streak = get_or_create_streak(db, user_id)
        zenkai_info = {"zenkai_activated": False}
        if was_new_log:
            zenkai_info = check_zenkai_recovery(db, user_id, local_date, streak)
            if zenkai_info.get("zenkai_activated"):
                daily_log.zenkai_bonus_applied = True

        # ── Step 5: Update streaks ────────────────────────────────────
        streak_result = update_overall_streak(
            db, user_id, local_date, completion_rate, zenkai_info
        )
        habit_streak_result = update_habit_streak(
            db, user_id, habit_id, local_date, is_checking
        )

        # ── Step 5b: Detect events (milestones, level-ups) ─────────────
        events: list[dict] = []
        if is_checking:
            # Overall streak milestones
            old_overall = streak_result["current_streak"] - 1 if streak_result["current_streak"] > 0 else 0
            overall_milestones = detect_streak_milestones(
                old_overall, streak_result["current_streak"]
            )
            for m in overall_milestones:
                record_achievement(
                    db, user_id, "streak_milestone", f"overall_streak_{m}",
                    milestone_type="streak",
                    metadata={"streak": m, "scope": "overall"},
                )
                events.append({
                    "type": "streak_milestone",
                    "tier": m,
                    "streak": streak_result["current_streak"],
                    "badge_name": get_milestone_badge_name(m),
                    "scope": "overall",
                })

            # Per-habit streak milestones
            old_habit = habit_streak_result["current_streak"] - 1 if habit_streak_result["current_streak"] > 0 else 0
            habit_milestones = detect_streak_milestones(
                old_habit, habit_streak_result["current_streak"]
            )
            for m in habit_milestones:
                record_achievement(
                    db, user_id, "streak_milestone",
                    f"habit_{habit_id}_streak_{m}",
                    milestone_type="streak",
                    metadata={"streak": m, "scope": "habit", "habit_id": str(habit_id)},
                )
                events.append({
                    "type": "streak_milestone",
                    "tier": m,
                    "streak": habit_streak_result["current_streak"],
                    "badge_name": get_milestone_badge_name(m),
                    "scope": "habit",
                })

            # Attribute level-up detection
            new_attr_xp = getattr(user, attr_field)
            level_change = detect_attribute_level_change(
                old_attr_xp, new_attr_xp, habit.attribute
            )
            if level_change is not None:
                record_achievement(
                    db, user_id, "attribute_level_up",
                    f"{habit.attribute}_{level_change['new_level']}",
                    metadata=level_change,
                )
                events.append({
                    "type": "level_up",
                    "attribute": habit.attribute,
                    **level_change,
                })

        # ── Step 6: Recalculate daily XP ──────────────────────────────
        # Re-fetch streak after update
        streak = get_or_create_streak(db, user_id)
        daily_xp = calc_daily_xp(
            completion_rate,
            streak.current_streak,
            daily_log.zenkai_bonus_applied,
        )
        daily_log.xp_earned = daily_xp
        daily_log.streak_multiplier = 1 + calc_streak_bonus(streak.current_streak)

        # ── Step 7: Update power level and transformation ─────────────
        old_transformation = user.current_transformation
        db.flush()
        new_power = recalculate_power_level(db, user)
        transform_change = check_transformation_change(
            old_transformation, new_power
        )
        if transform_change is not None:
            user.current_transformation = transform_change["key"]
            if is_checking:
                record_achievement(
                    db, user_id, "transformation", transform_change["key"],
                    metadata=transform_change,
                )
                events.append({
                    "type": "transformation",
                    **transform_change,
                })

        # ── Step 8: Handle Dragon Ball ────────────────────────────────
        dragon_ball_info = None
        if is_perfect_day and not daily_log.dragon_ball_earned:
            dragon_ball_info = award_dragon_ball(user)
            daily_log.dragon_ball_earned = True
        elif was_perfect_day and not is_perfect_day:
            # Unchecking broke perfection
            revoke_dragon_ball(user)
            daily_log.dragon_ball_earned = False

        # ── Step 9: Capsule RNG ───────────────────────────────────────
        capsule_result = None
        if is_checking and not habit_log.capsule_dropped:
            capsule = roll_capsule_drop(db, user_id, habit_id)
            if capsule is not None:
                db.add(capsule)
                habit_log.capsule_dropped = True
                capsule_result = {
                    "id": str(capsule.id),
                    "reward_id": str(capsule.reward_id),
                }

        # ── Step 10: Flush (no commit — caller manages transaction) ───
        db.flush()

        # Build response
        return {
            "is_checking": is_checking,
            "habit_id": str(habit_id),
            "log_date": local_date,
            "attribute_xp_awarded": habit_log.attribute_xp_awarded,
            "is_perfect_day": is_perfect_day,
            "zenkai_activated": zenkai_info.get("zenkai_activated", False),
            "daily_log": {
                "habits_due": daily_log.habits_due,
                "habits_completed": daily_log.habits_completed,
                "completion_rate": daily_log.habit_completion_rate,
                "completion_tier": daily_log.completion_tier,
                "xp_earned": daily_log.xp_earned,
                "streak_multiplier": daily_log.streak_multiplier,
                "zenkai_bonus_applied": daily_log.zenkai_bonus_applied,
                "dragon_ball_earned": daily_log.dragon_ball_earned,
            },
            "streak": streak_result,
            "habit_streak": habit_streak_result,
            "power_level": user.power_level,
            "transformation": user.current_transformation,
            "transform_change": transform_change,
            "dragon_ball": dragon_ball_info,
            "capsule": capsule_result,
            "events": events,
        }

    except Exception:
        db.rollback()
        raise
