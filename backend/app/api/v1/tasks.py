from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.task import Task
from app.models.category import TaskCategory
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
import math

router = APIRouter()

# For now, use a default user (Phase 2: auth)
DEFAULT_USER_ID = "default-user"

@router.get("/")
def list_tasks(energy_level: str = None, category_id: str = None, db: Session = Depends(get_db)):
    query = db.query(Task).filter(Task.user_id == DEFAULT_USER_ID, Task.is_active == True)
    if energy_level:
        query = query.filter(Task.energy_level == energy_level)
    if category_id:
        query = query.filter(Task.category_id == category_id)
    
    tasks = query.all()
    result = []
    for t in tasks:
        cat = db.query(TaskCategory).filter(TaskCategory.id == t.category_id).first()
        effective = math.floor(t.base_points * (cat.point_multiplier if cat else 1.0))
        result.append({
            **TaskResponse.model_validate(t).model_dump(),
            "category_name": cat.name if cat else None,
            "category_color": cat.color_code if cat else None,
            "category_multiplier": cat.point_multiplier if cat else 1.0,
            "effective_points": effective,
        })
    return result

@router.get("/{task_id}")
def get_task(task_id: str, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == DEFAULT_USER_ID).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.post("/")
def create_task(task_data: TaskCreate, db: Session = Depends(get_db)):
    task = Task(user_id=DEFAULT_USER_ID, **task_data.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@router.put("/{task_id}")
def update_task(task_id: str, task_data: TaskUpdate, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == DEFAULT_USER_ID).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    for key, value in task_data.model_dump(exclude_unset=True).items():
        setattr(task, key, value)
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}")
def delete_task(task_id: str, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == DEFAULT_USER_ID).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.is_active = False
    db.commit()
    return {"message": "Task deactivated"}
