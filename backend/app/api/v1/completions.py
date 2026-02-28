import math
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from app.database.session import get_db
from app.models.task import Task
from app.models.category import TaskCategory
from app.models.completion import TaskCompletion
from app.schemas.completion import CompletionCreate
from app.services.power_service import PowerService

router = APIRouter()
DEFAULT_USER_ID = "default-user"

@router.post("/")
def complete_task(data: CompletionCreate, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == data.task_id, Task.user_id == DEFAULT_USER_ID).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    category = db.query(TaskCategory).filter(TaskCategory.id == task.category_id).first()
    multiplier = category.point_multiplier if category else 1.0
    
    # Get streak bonus
    from app.models.streak import Streak
    streak = db.query(Streak).filter(Streak.user_id == DEFAULT_USER_ID).first()
    streak_bonus = PowerService.get_streak_bonus(streak.current_streak if streak else 0)
    
    # Calculate points
    base_points = math.floor(task.base_points * multiplier)
    bonus_points = math.floor(base_points * streak_bonus)
    total_points = base_points + bonus_points
    
    # Get old total for transformation check
    old_total = db.query(func.coalesce(func.sum(TaskCompletion.points_awarded), 0))\
        .filter(TaskCompletion.user_id == DEFAULT_USER_ID).scalar()
    
    # Create completion
    completion = TaskCompletion(
        user_id=DEFAULT_USER_ID,
        task_id=data.task_id,
        points_awarded=total_points,
        energy_at_completion=data.energy_at_completion,
        notes=data.notes,
    )
    db.add(completion)
    db.commit()
    
    new_total = old_total + total_points
    
    # Update daily log and streak
    daily_log = PowerService.update_daily_log(db, DEFAULT_USER_ID)
    PowerService.update_streak(db, DEFAULT_USER_ID)
    
    # Check for new transformation
    transformation = PowerService.check_new_transformation(db, DEFAULT_USER_ID, old_total, new_total)
    
    # Update power level history for today
    from app.models.power_level import PowerLevel
    trans_info = PowerService.calculate_transformation(new_total)
    pl = db.query(PowerLevel).filter(
        PowerLevel.user_id == DEFAULT_USER_ID,
        PowerLevel.power_level_date == date.today()
    ).first()
    if not pl:
        pl = PowerLevel(user_id=DEFAULT_USER_ID, power_level_date=date.today())
        db.add(pl)
    pl.total_power_points = new_total
    pl.transformation_level = trans_info["level"]
    db.commit()
    
    return {
        "completion_id": completion.id,
        "points_awarded": total_points,
        "base_points": base_points,
        "bonus_points": bonus_points,
        "streak_bonus_pct": streak_bonus,
        "new_total_power": new_total,
        "daily_points": daily_log.total_points_earned,
        "daily_minimum_met": daily_log.daily_minimum_met,
        "new_transformation": transformation,
    }

@router.get("/today")
def get_today_completions(db: Session = Depends(get_db)):
    today = date.today()
    completions = db.query(TaskCompletion).filter(
        TaskCompletion.user_id == DEFAULT_USER_ID,
        func.date(TaskCompletion.completed_at) == today
    ).all()
    
    result = []
    for c in completions:
        task = db.query(Task).filter(Task.id == c.task_id).first()
        cat = db.query(TaskCategory).filter(TaskCategory.id == task.category_id).first() if task else None
        result.append({
            "id": c.id,
            "task_id": c.task_id,
            "task_title": task.title if task else "Unknown",
            "points_awarded": c.points_awarded,
            "energy_at_completion": c.energy_at_completion,
            "completed_at": c.completed_at.isoformat(),
            "category_name": cat.name if cat else None,
        })
    return result

@router.delete("/{completion_id}")
def undo_completion(completion_id: str, db: Session = Depends(get_db)):
    completion = db.query(TaskCompletion).filter(
        TaskCompletion.id == completion_id,
        TaskCompletion.user_id == DEFAULT_USER_ID
    ).first()
    if not completion:
        raise HTTPException(status_code=404, detail="Completion not found")
    
    db.delete(completion)
    db.commit()
    
    # Recalculate daily log
    PowerService.update_daily_log(db, DEFAULT_USER_ID)
    
    return {"message": "Completion undone"}
