from datetime import date
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.habit import Habit
from app.models.category import TaskCategory
from app.schemas.habit import (
    HabitCreate,
    HabitUpdate,
    HabitResponse,
    HabitCheckResponse,
)
from app.services.habit_service import HabitService


class ReorderItem(BaseModel):
    id: str
    sort_order: int


class ReorderRequest(BaseModel):
    habits: List[ReorderItem]

router = APIRouter()
DEFAULT_USER_ID = "default-user"


@router.get("/")
def list_habits(include_inactive: bool = False, db: Session = Depends(get_db)):
    """List all habits."""
    query = db.query(Habit).filter(Habit.user_id == DEFAULT_USER_ID)
    if not include_inactive:
        query = query.filter(Habit.is_active == True)
    habits = query.order_by(Habit.sort_order, Habit.created_at).all()

    result = []
    for h in habits:
        cat = db.query(TaskCategory).filter(TaskCategory.id == h.category_id).first()
        data = {
            "id": h.id,
            "user_id": h.user_id,
            "category_id": h.category_id,
            "title": h.title,
            "description": h.description,
            "icon_emoji": h.icon_emoji,
            "base_points": h.base_points,
            "frequency": h.frequency,
            "custom_days": h.custom_days,
            "target_time": h.target_time,
            "is_temporary": h.is_temporary,
            "start_date": h.start_date,
            "end_date": h.end_date,
            "sort_order": h.sort_order,
            "is_active": h.is_active,
            "created_at": h.created_at,
            "category_name": cat.name if cat else None,
            "category_color": cat.color_code if cat else None,
            "category_multiplier": cat.point_multiplier if cat else None,
        }
        result.append(data)
    return result


@router.get("/today/list")
def get_today_habits(db: Session = Depends(get_db)):
    """Get today's habits with completion status."""
    return HabitService.get_today_habits(db, DEFAULT_USER_ID)


@router.get("/calendar/all")
def get_all_habits_calendar(
    year: int = None,
    month: int = None,
    db: Session = Depends(get_db),
):
    """Get monthly calendar heatmap for all habits."""
    today = date.today()
    year = year or today.year
    month = month or today.month
    return HabitService.get_all_habits_calendar(db, DEFAULT_USER_ID, year, month)


@router.put("/reorder")
def reorder_habits(data: ReorderRequest, db: Session = Depends(get_db)):
    """Update sort order for multiple habits."""
    for item in data.habits:
        habit = db.query(Habit).filter(
            Habit.id == item.id, Habit.user_id == DEFAULT_USER_ID
        ).first()
        if habit:
            habit.sort_order = item.sort_order
    db.commit()
    return {"message": "Habits reordered"}


@router.post("/", status_code=201)
def create_habit(data: HabitCreate, db: Session = Depends(get_db)):
    """Create a new habit."""
    cat = db.query(TaskCategory).filter(
        TaskCategory.id == data.category_id,
        TaskCategory.user_id == DEFAULT_USER_ID,
    ).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")

    habit = Habit(
        user_id=DEFAULT_USER_ID,
        category_id=data.category_id,
        title=data.title,
        description=data.description,
        icon_emoji=data.icon_emoji,
        base_points=data.base_points,
        frequency=data.frequency,
        custom_days=data.custom_days,
        target_time=data.target_time,
        is_temporary=data.is_temporary,
        start_date=data.start_date or date.today(),
        end_date=data.end_date,
    )
    db.add(habit)
    db.commit()
    db.refresh(habit)

    return {
        "id": habit.id,
        "user_id": habit.user_id,
        "category_id": habit.category_id,
        "title": habit.title,
        "description": habit.description,
        "icon_emoji": habit.icon_emoji,
        "base_points": habit.base_points,
        "frequency": habit.frequency,
        "custom_days": habit.custom_days,
        "target_time": habit.target_time,
        "is_temporary": habit.is_temporary,
        "start_date": habit.start_date,
        "end_date": habit.end_date,
        "sort_order": habit.sort_order,
        "is_active": habit.is_active,
        "created_at": habit.created_at,
        "category_name": cat.name,
        "category_color": cat.color_code,
        "category_multiplier": cat.point_multiplier,
    }


@router.get("/{habit_id}")
def get_habit(habit_id: str, db: Session = Depends(get_db)):
    """Get a single habit."""
    habit = db.query(Habit).filter(
        Habit.id == habit_id, Habit.user_id == DEFAULT_USER_ID
    ).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    cat = db.query(TaskCategory).filter(TaskCategory.id == habit.category_id).first()
    return {
        "id": habit.id,
        "user_id": habit.user_id,
        "category_id": habit.category_id,
        "title": habit.title,
        "description": habit.description,
        "icon_emoji": habit.icon_emoji,
        "base_points": habit.base_points,
        "frequency": habit.frequency,
        "custom_days": habit.custom_days,
        "target_time": habit.target_time,
        "is_temporary": habit.is_temporary,
        "start_date": habit.start_date,
        "end_date": habit.end_date,
        "sort_order": habit.sort_order,
        "is_active": habit.is_active,
        "created_at": habit.created_at,
        "category_name": cat.name if cat else None,
        "category_color": cat.color_code if cat else None,
        "category_multiplier": cat.point_multiplier if cat else None,
    }


@router.put("/{habit_id}")
def update_habit(habit_id: str, data: HabitUpdate, db: Session = Depends(get_db)):
    """Update a habit."""
    habit = db.query(Habit).filter(
        Habit.id == habit_id, Habit.user_id == DEFAULT_USER_ID
    ).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(habit, key, value)

    db.commit()
    db.refresh(habit)

    cat = db.query(TaskCategory).filter(TaskCategory.id == habit.category_id).first()
    return {
        "id": habit.id,
        "user_id": habit.user_id,
        "category_id": habit.category_id,
        "title": habit.title,
        "description": habit.description,
        "icon_emoji": habit.icon_emoji,
        "base_points": habit.base_points,
        "frequency": habit.frequency,
        "custom_days": habit.custom_days,
        "target_time": habit.target_time,
        "is_temporary": habit.is_temporary,
        "start_date": habit.start_date,
        "end_date": habit.end_date,
        "sort_order": habit.sort_order,
        "is_active": habit.is_active,
        "created_at": habit.created_at,
        "category_name": cat.name if cat else None,
        "category_color": cat.color_code if cat else None,
        "category_multiplier": cat.point_multiplier if cat else None,
    }


@router.delete("/{habit_id}")
def delete_habit(habit_id: str, db: Session = Depends(get_db)):
    """Soft-delete a habit (set inactive)."""
    habit = db.query(Habit).filter(
        Habit.id == habit_id, Habit.user_id == DEFAULT_USER_ID
    ).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    habit.is_active = False
    db.commit()
    return {"message": "Habit deactivated", "habit_id": habit_id}


@router.post("/{habit_id}/check")
def check_habit(habit_id: str, db: Session = Depends(get_db)):
    """Toggle today's completion for a habit."""
    result = HabitService.check_habit(db, DEFAULT_USER_ID, habit_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Habit not found")
    return result


@router.get("/{habit_id}/calendar")
def get_habit_calendar(
    habit_id: str,
    year: int = None,
    month: int = None,
    db: Session = Depends(get_db),
):
    """Get monthly calendar data for a habit."""
    today = date.today()
    year = year or today.year
    month = month or today.month

    result = HabitService.get_habit_calendar(db, DEFAULT_USER_ID, habit_id, year, month)
    if result is None:
        raise HTTPException(status_code=404, detail="Habit not found")
    return result


@router.get("/{habit_id}/stats")
def get_habit_stats(habit_id: str, db: Session = Depends(get_db)):
    """Get statistics for a habit."""
    result = HabitService.get_habit_stats(db, DEFAULT_USER_ID, habit_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Habit not found")
    return result
