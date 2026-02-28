from datetime import date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import TaskCompletion, DailyLog, Streak, PowerLevel, Achievement, User
from app.core.constants import TRANSFORMATIONS, STREAK_BONUSES, LOGIN_BONUS_POINTS

class PowerService:
    
    @staticmethod
    def calculate_transformation(total_points: int) -> dict:
        """Determine transformation level based on total power points."""
        current = TRANSFORMATIONS[0]
        next_trans = TRANSFORMATIONS[1] if len(TRANSFORMATIONS) > 1 else None
        
        for i, t in enumerate(TRANSFORMATIONS):
            if total_points >= t["threshold"]:
                current = t
                next_trans = TRANSFORMATIONS[i + 1] if i + 1 < len(TRANSFORMATIONS) else None
        
        progress = 0.0
        points_to_next = None
        if next_trans:
            range_total = next_trans["threshold"] - current["threshold"]
            progress_in_range = total_points - current["threshold"]
            progress = min((progress_in_range / range_total) * 100, 100) if range_total > 0 else 100
            points_to_next = next_trans["threshold"] - total_points
        else:
            progress = 100.0
        
        return {
            "level": current["level"],
            "name": current["name"],
            "next_level": next_trans["level"] if next_trans else None,
            "next_name": next_trans["name"] if next_trans else None,
            "points_to_next": points_to_next,
            "progress": round(progress, 1),
        }
    
    @staticmethod
    def get_streak_bonus(streak_days: int) -> float:
        """Get bonus multiplier based on current streak."""
        bonus = 0.0
        for threshold, value in sorted(STREAK_BONUSES.items()):
            if streak_days >= threshold:
                bonus = value
        return bonus
    
    @staticmethod
    def get_current_power(db: Session, user_id: str) -> dict:
        """Get comprehensive current power level data."""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        
        # Total lifetime points
        total_points = db.query(func.coalesce(func.sum(TaskCompletion.points_awarded), 0))\
            .filter(TaskCompletion.user_id == user_id).scalar()
        
        # Today's points
        today = date.today()
        daily_log = db.query(DailyLog).filter(
            DailyLog.user_id == user_id,
            DailyLog.log_date == today
        ).first()
        
        daily_points = daily_log.total_points_earned if daily_log else 0
        daily_min_met = daily_log.daily_minimum_met if daily_log else False
        
        # Streak
        streak = db.query(Streak).filter(Streak.user_id == user_id).first()
        current_streak = streak.current_streak if streak else 0
        
        # Transformation
        trans = PowerService.calculate_transformation(total_points)
        
        return {
            "total_power_points": total_points,
            "transformation_level": trans["level"],
            "transformation_name": trans["name"],
            "next_transformation": trans["next_level"],
            "next_transformation_name": trans["next_name"],
            "points_to_next": trans["points_to_next"],
            "progress_percentage": trans["progress"],
            "daily_points_today": daily_points,
            "current_streak": current_streak,
            "daily_minimum": user.daily_point_minimum,
            "daily_minimum_met": daily_min_met,
        }
    
    @staticmethod
    def check_new_transformation(db: Session, user_id: str, old_total: int, new_total: int) -> dict:
        """Check if a new transformation was unlocked."""
        old_trans = PowerService.calculate_transformation(old_total)
        new_trans = PowerService.calculate_transformation(new_total)
        
        if new_trans["level"] != old_trans["level"]:
            # New transformation unlocked!
            achievement = Achievement(
                user_id=user_id,
                achievement_type="transformation",
                transformation_level=new_trans["level"],
                description=f"Achieved {new_trans['name']}!",
                power_points_at_achievement=new_total,
            )
            db.add(achievement)
            db.commit()
            return {
                "new_level": new_trans["level"],
                "new_name": new_trans["name"],
                "total_points": new_total,
            }
        return None
    
    @staticmethod
    def update_daily_log(db: Session, user_id: str) -> DailyLog:
        """Update or create today's daily log."""
        today = date.today()
        user = db.query(User).filter(User.id == user_id).first()
        
        daily_log = db.query(DailyLog).filter(
            DailyLog.user_id == user_id,
            DailyLog.log_date == today
        ).first()
        
        # Calculate today's totals
        today_points = db.query(func.coalesce(func.sum(TaskCompletion.points_awarded), 0))\
            .filter(
                TaskCompletion.user_id == user_id,
                func.date(TaskCompletion.completed_at) == today
            ).scalar()
        
        today_tasks = db.query(func.count(TaskCompletion.id))\
            .filter(
                TaskCompletion.user_id == user_id,
                func.date(TaskCompletion.completed_at) == today
            ).scalar()
        
        min_met = today_points >= user.daily_point_minimum
        
        if not daily_log:
            # New daily log - award login bonus
            today_points += LOGIN_BONUS_POINTS
            min_met = today_points >= user.daily_point_minimum
            daily_log = DailyLog(
                user_id=user_id,
                log_date=today,
                total_points_earned=today_points,
                daily_minimum_met=min_met,
                tasks_completed=today_tasks,
                login_bonus_earned=True,
            )
            db.add(daily_log)
        else:
            daily_log.total_points_earned = today_points
            daily_log.daily_minimum_met = min_met
            daily_log.tasks_completed = today_tasks
        
        db.commit()
        db.refresh(daily_log)
        return daily_log
    
    @staticmethod
    def update_streak(db: Session, user_id: str):
        """Update user's streak based on daily log."""
        today = date.today()
        yesterday = today - timedelta(days=1)
        
        streak = db.query(Streak).filter(Streak.user_id == user_id).first()
        if not streak:
            streak = Streak(user_id=user_id, current_streak=0, best_streak=0)
            db.add(streak)
            db.commit()
            db.refresh(streak)
        
        daily_log = db.query(DailyLog).filter(
            DailyLog.user_id == user_id,
            DailyLog.log_date == today
        ).first()
        
        if daily_log and daily_log.daily_minimum_met:
            if streak.last_completion_date == yesterday or streak.last_completion_date == today:
                if streak.last_completion_date != today:
                    streak.current_streak += 1
            elif streak.last_completion_date is None:
                streak.current_streak = 1
                streak.streak_start_date = today
            else:
                # Check if days between were all off days
                from app.models import OffDay
                gap_start = streak.last_completion_date + timedelta(days=1)
                gap_days = (today - gap_start).days
                off_days_count = db.query(func.count(OffDay.id)).filter(
                    OffDay.user_id == user_id,
                    OffDay.off_day_date >= gap_start,
                    OffDay.off_day_date < today
                ).scalar()
                
                if off_days_count >= gap_days:
                    streak.current_streak += 1
                else:
                    streak.current_streak = 1
                    streak.streak_start_date = today
            
            streak.last_completion_date = today
            if streak.current_streak > streak.best_streak:
                streak.best_streak = streak.current_streak
        
        db.commit()
