import math
from datetime import date, datetime, timedelta
from calendar import monthrange
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.habit import Habit
from app.models.habit_log import HabitLog
from app.models.habit_streak import HabitStreak
from app.models.category import TaskCategory
from app.models.completion import TaskCompletion
from app.core.constants import (
    HABIT_STREAK_BONUS_PER_DAY,
    HABIT_STREAK_BONUS_CAP,
    CONSISTENCY_BONUS,
    WEEKDAYS,
    ALL_DAYS,
)

DAY_MAP = {0: "mon", 1: "tue", 2: "wed", 3: "thu", 4: "fri", 5: "sat", 6: "sun"}


class HabitService:

    @staticmethod
    def is_habit_due_on(habit: Habit, check_date: date) -> bool:
        """Check if a habit is due on a given date."""
        # Check date range
        if habit.start_date and check_date < habit.start_date:
            return False
        if habit.end_date and check_date > habit.end_date:
            return False
        if not habit.is_active:
            return False

        day_name = DAY_MAP[check_date.weekday()]

        if habit.frequency == "daily":
            return True
        elif habit.frequency == "weekdays":
            return day_name in WEEKDAYS
        elif habit.frequency == "custom":
            return day_name in (habit.custom_days or [])
        return True

    @staticmethod
    def get_today_habits(db: Session, user_id: str) -> list[dict]:
        """Get all habits due today with their completion status."""
        today = date.today()
        habits = db.query(Habit).filter(
            Habit.user_id == user_id,
            Habit.is_active == True,
        ).order_by(Habit.sort_order, Habit.created_at).all()

        result = []
        for habit in habits:
            if not HabitService.is_habit_due_on(habit, today):
                continue

            category = db.query(TaskCategory).filter(
                TaskCategory.id == habit.category_id
            ).first()

            log = db.query(HabitLog).filter(
                HabitLog.habit_id == habit.id,
                HabitLog.log_date == today,
            ).first()

            streak = db.query(HabitStreak).filter(
                HabitStreak.habit_id == habit.id,
                HabitStreak.user_id == user_id,
            ).first()

            result.append({
                "id": habit.id,
                "title": habit.title,
                "icon_emoji": habit.icon_emoji,
                "base_points": habit.base_points,
                "category_id": habit.category_id,
                "category_name": category.name if category else None,
                "category_color": category.color_code if category else None,
                "category_multiplier": category.point_multiplier if category else 1.0,
                "completed": log.completed if log else False,
                "completed_at": log.completed_at if log else None,
                "points_awarded": log.points_awarded if log else 0,
                "current_streak": streak.current_streak if streak else 0,
                "best_streak": streak.best_streak if streak else 0,
            })

        return result

    @staticmethod
    def check_habit(db: Session, user_id: str, habit_id: str) -> dict:
        """Toggle a habit's completion for today. Returns point info."""
        from app.services.power_service import PowerService

        today = date.today()
        habit = db.query(Habit).filter(
            Habit.id == habit_id,
            Habit.user_id == user_id,
        ).first()
        if not habit:
            return None

        category = db.query(TaskCategory).filter(
            TaskCategory.id == habit.category_id
        ).first()
        multiplier = category.point_multiplier if category else 1.0

        # Get or create streak
        streak = db.query(HabitStreak).filter(
            HabitStreak.habit_id == habit_id,
            HabitStreak.user_id == user_id,
        ).first()
        if not streak:
            streak = HabitStreak(user_id=user_id, habit_id=habit_id)
            db.add(streak)
            db.flush()

        # Check existing log for today
        log = db.query(HabitLog).filter(
            HabitLog.habit_id == habit_id,
            HabitLog.log_date == today,
        ).first()

        # Get old total power for transformation check
        old_total = HabitService._get_total_power(db, user_id)

        if log and log.completed:
            # Un-complete: toggle off
            log.completed = False
            log.completed_at = None
            log.points_awarded = 0

            # Decrement streak
            HabitService._decrement_streak(streak, today)

            db.commit()
            new_total = HabitService._get_total_power(db, user_id)
            daily_log = PowerService.update_daily_log(db, user_id)
            HabitService._update_daily_habit_stats(db, user_id, today)

            return {
                "habit_id": habit_id,
                "completed": False,
                "points_awarded": 0,
                "base_points": 0,
                "streak_bonus_points": 0,
                "habit_streak": streak.current_streak,
                "new_total_power": new_total,
                "daily_points": daily_log.total_points_earned,
                "daily_minimum_met": daily_log.daily_minimum_met,
                "all_habits_completed": False,
                "consistency_bonus_applied": False,
                "new_transformation": None,
            }
        else:
            # Complete the habit
            # Calculate streak bonus
            streak_bonus_rate = min(
                streak.current_streak * HABIT_STREAK_BONUS_PER_DAY,
                HABIT_STREAK_BONUS_CAP,
            )
            base_points = math.floor(habit.base_points * multiplier)
            streak_bonus_points = math.floor(base_points * streak_bonus_rate)
            total_points = base_points + streak_bonus_points

            if not log:
                log = HabitLog(
                    user_id=user_id,
                    habit_id=habit_id,
                    log_date=today,
                )
                db.add(log)

            log.completed = True
            log.completed_at = datetime.utcnow()
            log.points_awarded = total_points

            # Update streak
            HabitService._increment_streak(streak, today)

            db.commit()

            # Check if ALL habits for today are now completed
            all_completed, consistency_applied = HabitService._apply_consistency_bonus(
                db, user_id, today
            )

            new_total = HabitService._get_total_power(db, user_id)
            daily_log = PowerService.update_daily_log(db, user_id)
            PowerService.update_streak(db, user_id)
            HabitService._update_daily_habit_stats(db, user_id, today)

            # Check transformation
            transformation = PowerService.check_new_transformation(
                db, user_id, old_total, new_total
            )

            return {
                "habit_id": habit_id,
                "completed": True,
                "points_awarded": log.points_awarded,
                "base_points": base_points,
                "streak_bonus_points": streak_bonus_points,
                "habit_streak": streak.current_streak,
                "new_total_power": new_total,
                "daily_points": daily_log.total_points_earned,
                "daily_minimum_met": daily_log.daily_minimum_met,
                "all_habits_completed": all_completed,
                "consistency_bonus_applied": consistency_applied,
                "new_transformation": transformation,
            }

    @staticmethod
    def _get_total_power(db: Session, user_id: str) -> int:
        """Get total power from both task completions and habit logs."""
        task_points = db.query(
            func.coalesce(func.sum(TaskCompletion.points_awarded), 0)
        ).filter(TaskCompletion.user_id == user_id).scalar()

        habit_points = db.query(
            func.coalesce(func.sum(HabitLog.points_awarded), 0)
        ).filter(
            HabitLog.user_id == user_id,
            HabitLog.completed == True,
        ).scalar()

        return task_points + habit_points

    @staticmethod
    def _increment_streak(streak: HabitStreak, today: date):
        """Increment a habit's streak."""
        yesterday = today - timedelta(days=1)
        if streak.last_completed_date == yesterday:
            streak.current_streak += 1
        elif streak.last_completed_date == today:
            pass  # Already counted today
        else:
            streak.current_streak = 1

        streak.last_completed_date = today
        if streak.current_streak > streak.best_streak:
            streak.best_streak = streak.current_streak

    @staticmethod
    def _decrement_streak(streak: HabitStreak, today: date):
        """Decrement streak when un-completing today's habit."""
        if streak.last_completed_date == today:
            if streak.current_streak > 0:
                streak.current_streak -= 1
            streak.last_completed_date = today - timedelta(days=1) if streak.current_streak > 0 else None

    @staticmethod
    def _apply_consistency_bonus(db: Session, user_id: str, today: date) -> tuple[bool, bool]:
        """If all today's habits are completed, apply consistency bonus. Returns (all_completed, bonus_applied)."""
        habits = db.query(Habit).filter(
            Habit.user_id == user_id,
            Habit.is_active == True,
        ).all()

        due_habits = [h for h in habits if HabitService.is_habit_due_on(h, today)]
        if not due_habits:
            return False, False

        logs = db.query(HabitLog).filter(
            HabitLog.user_id == user_id,
            HabitLog.log_date == today,
            HabitLog.completed == True,
        ).all()
        completed_ids = {log.habit_id for log in logs}

        all_completed = all(h.id in completed_ids for h in due_habits)

        if all_completed and len(due_habits) > 0:
            # Apply consistency bonus to all habit logs for today
            already_applied = any(
                log.points_awarded > 0 and log.notes == "consistency_bonus_applied"
                for log in logs
            )
            if not already_applied:
                for log in logs:
                    original_points = log.points_awarded
                    boosted = math.floor(original_points * CONSISTENCY_BONUS)
                    log.points_awarded = boosted
                # Mark bonus as applied using a tag on the last log
                if logs:
                    logs[-1].notes = "consistency_bonus_applied"
                db.commit()
            return True, not already_applied

        return False, False

    @staticmethod
    def _update_daily_habit_stats(db: Session, user_id: str, today: date):
        """Update the daily log's habit statistics."""
        from app.models.daily_log import DailyLog

        daily_log = db.query(DailyLog).filter(
            DailyLog.user_id == user_id,
            DailyLog.log_date == today,
        ).first()
        if not daily_log:
            return

        habits = db.query(Habit).filter(
            Habit.user_id == user_id,
            Habit.is_active == True,
        ).all()
        due_habits = [h for h in habits if HabitService.is_habit_due_on(h, today)]

        completed_count = db.query(func.count(HabitLog.id)).filter(
            HabitLog.user_id == user_id,
            HabitLog.log_date == today,
            HabitLog.completed == True,
        ).scalar()

        daily_log.habits_due = len(due_habits)
        daily_log.habits_completed = completed_count
        daily_log.habit_completion_rate = (
            (completed_count / len(due_habits) * 100) if due_habits else 0.0
        )
        db.commit()

    @staticmethod
    def get_habit_calendar(db: Session, user_id: str, habit_id: str, year: int, month: int) -> dict:
        """Get monthly calendar data for a single habit."""
        habit = db.query(Habit).filter(
            Habit.id == habit_id, Habit.user_id == user_id
        ).first()
        if not habit:
            return None

        _, num_days = monthrange(year, month)
        start = date(year, month, 1)
        end = date(year, month, num_days)

        logs = db.query(HabitLog).filter(
            HabitLog.habit_id == habit_id,
            HabitLog.log_date >= start,
            HabitLog.log_date <= end,
        ).all()
        log_map = {log.log_date: log for log in logs}

        days = []
        due_count = 0
        completed_count = 0
        for day_num in range(1, num_days + 1):
            d = date(year, month, day_num)
            if d > date.today():
                break
            if HabitService.is_habit_due_on(habit, d):
                due_count += 1
                log = log_map.get(d)
                completed = log.completed if log else False
                if completed:
                    completed_count += 1
                days.append({
                    "date": d,
                    "completed": completed,
                    "points_awarded": log.points_awarded if log else 0,
                })

        return {
            "habit_id": habit_id,
            "habit_title": habit.title,
            "year": year,
            "month": month,
            "days": days,
            "completion_rate": round(
                (completed_count / due_count * 100) if due_count > 0 else 0, 1
            ),
        }

    @staticmethod
    def get_all_habits_calendar(db: Session, user_id: str, year: int, month: int) -> dict:
        """Get monthly calendar heatmap for all habits."""
        _, num_days = monthrange(year, month)
        start = date(year, month, 1)
        end = date(year, month, num_days)

        habits = db.query(Habit).filter(
            Habit.user_id == user_id,
            Habit.is_active == True,
        ).all()

        logs = db.query(HabitLog).filter(
            HabitLog.user_id == user_id,
            HabitLog.log_date >= start,
            HabitLog.log_date <= end,
            HabitLog.completed == True,
        ).all()

        # Group logs by date
        logs_by_date = {}
        for log in logs:
            logs_by_date.setdefault(log.log_date, []).append(log)

        days = []
        for day_num in range(1, num_days + 1):
            d = date(year, month, day_num)
            if d > date.today():
                break
            due = [h for h in habits if HabitService.is_habit_due_on(h, d)]
            completed_logs = logs_by_date.get(d, [])
            completed_ids = {log.habit_id for log in completed_logs}
            completed = sum(1 for h in due if h.id in completed_ids)
            total_pts = sum(log.points_awarded for log in completed_logs)

            days.append({
                "date": d,
                "habits_due": len(due),
                "habits_completed": completed,
                "completion_rate": round(
                    (completed / len(due) * 100) if due else 0, 1
                ),
                "total_points": total_pts,
            })

        return {"year": year, "month": month, "days": days}

    @staticmethod
    def get_habit_stats(db: Session, user_id: str, habit_id: str) -> dict:
        """Get statistics for a single habit."""
        habit = db.query(Habit).filter(
            Habit.id == habit_id, Habit.user_id == user_id
        ).first()
        if not habit:
            return None

        streak = db.query(HabitStreak).filter(
            HabitStreak.habit_id == habit_id,
            HabitStreak.user_id == user_id,
        ).first()

        total_completions = db.query(func.count(HabitLog.id)).filter(
            HabitLog.habit_id == habit_id,
            HabitLog.completed == True,
        ).scalar()

        total_points = db.query(
            func.coalesce(func.sum(HabitLog.points_awarded), 0)
        ).filter(
            HabitLog.habit_id == habit_id,
            HabitLog.completed == True,
        ).scalar()

        today = date.today()

        def completion_rate(days_back: int) -> float:
            start = today - timedelta(days=days_back)
            due = 0
            completed = 0
            for i in range(days_back):
                d = start + timedelta(days=i + 1)
                if HabitService.is_habit_due_on(habit, d):
                    due += 1
                    log = db.query(HabitLog).filter(
                        HabitLog.habit_id == habit_id,
                        HabitLog.log_date == d,
                        HabitLog.completed == True,
                    ).first()
                    if log:
                        completed += 1
            return round((completed / due * 100) if due > 0 else 0, 1)

        return {
            "habit_id": habit_id,
            "habit_title": habit.title,
            "current_streak": streak.current_streak if streak else 0,
            "best_streak": streak.best_streak if streak else 0,
            "total_completions": total_completions,
            "completion_rate_7d": completion_rate(7),
            "completion_rate_30d": completion_rate(30),
            "completion_rate_90d": completion_rate(90),
            "total_points_earned": total_points,
        }
