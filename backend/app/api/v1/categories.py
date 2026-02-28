from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.category import TaskCategory
from app.schemas.task import CategoryCreate, CategoryResponse

router = APIRouter()
DEFAULT_USER_ID = "default-user"

@router.get("/")
def list_categories(db: Session = Depends(get_db)):
    return db.query(TaskCategory).filter(TaskCategory.user_id == DEFAULT_USER_ID).all()

@router.post("/")
def create_category(data: CategoryCreate, db: Session = Depends(get_db)):
    cat = TaskCategory(user_id=DEFAULT_USER_ID, **data.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat

@router.put("/{category_id}")
def update_category(category_id: str, data: CategoryCreate, db: Session = Depends(get_db)):
    cat = db.query(TaskCategory).filter(TaskCategory.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(cat, key, value)
    db.commit()
    db.refresh(cat)
    return cat
