from datetime import date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import DailyLog, TaskCompletion, Task, TaskCategory

class AnalyticsService:
    
    @staticmethod
    def get_weekly(db: Session, user_id: str) -> dict:
        today = date.today()
        week_start = today - timedelta(days=6)
        
        logs = db.query(DailyLog).filter(
            DailyLog.user_id == user_id,
            DailyLog.log_date >= week_start,
            DailyLog.log_date <= today
        ).order_by(DailyLog.log_date).all()
        
        days = []
        total = 0
        min_met_count = 0
        for log in logs:
            days.append({
                "date": log.log_date.isoformat(),
                "points": log.total_points_earned,
                "tasks_completed": log.tasks_completed,
                "minimum_met": log.daily_minimum_met,
                "is_off_day": log.is_off_day,
            })
            total += log.total_points_earned
            if log.daily_minimum_met:
                min_met_count += 1
        
        return {
            "days": days,
            "total_points": total,
            "average_daily": round(total / max(len(days), 1), 1),
            "days_minimum_met": min_met_count,
        }
    
    @staticmethod
    def get_category_breakdown(db: Session, user_id: str, days: int = 30) -> list:
        start_date = date.today() - timedelta(days=days)
        
        results = db.query(
            TaskCategory.name,
            TaskCategory.color_code,
            func.coalesce(func.sum(TaskCompletion.points_awarded), 0).label("total_points"),
            func.count(TaskCompletion.id).label("task_count"),
        ).join(Task, Task.category_id == TaskCategory.id)\
         .join(TaskCompletion, TaskCompletion.task_id == Task.id)\
         .filter(
            TaskCompletion.user_id == user_id,
            func.date(TaskCompletion.completed_at) >= start_date
         ).group_by(TaskCategory.name, TaskCategory.color_code).all()
        
        grand_total = sum(r.total_points for r in results) or 1
        
        return [
            {
                "category_name": r.name,
                "category_color": r.color_code,
                "total_points": r.total_points,
                "percentage": round((r.total_points / grand_total) * 100, 1),
                "task_count": r.task_count,
            }
            for r in results
        ]
    
    @staticmethod
    def get_power_history(db: Session, user_id: str, days: int = 30) -> list:
        from app.models import PowerLevel
        start_date = date.today() - timedelta(days=days)
        
        records = db.query(PowerLevel).filter(
            PowerLevel.user_id == user_id,
            PowerLevel.power_level_date >= start_date
        ).order_by(PowerLevel.power_level_date).all()
        
        return [
            {
                "date": r.power_level_date.isoformat(),
                "total_power_points": r.total_power_points,
                "transformation_level": r.transformation_level,
            }
            for r in records
        ]
