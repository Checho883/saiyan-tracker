import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.base import Base

class TaskCategory(Base):
    __tablename__ = "task_categories"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    point_multiplier = Column(Float, default=1.0)
    color_code = Column(String(7), default="#FF6B00")
    icon = Column(String(50), default="zap")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="categories")
    tasks = relationship("Task", back_populates="category")
