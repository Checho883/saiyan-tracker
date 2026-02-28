import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.base import Base

class TaskCompletion(Base):
    __tablename__ = "task_completions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    task_id = Column(String, ForeignKey("tasks.id"), nullable=False)
    completed_at = Column(DateTime, default=datetime.utcnow)
    points_awarded = Column(Integer, default=0)
    energy_at_completion = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    
    user = relationship("User", back_populates="completions")
    task = relationship("Task", back_populates="completions")
