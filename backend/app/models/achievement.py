import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.base import Base

class Achievement(Base):
    __tablename__ = "achievements"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    achievement_type = Column(String(100))  # transformation, streak, milestone
    transformation_level = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    achieved_at = Column(DateTime, default=datetime.utcnow)
    power_points_at_achievement = Column(Integer, default=0)
    
    user = relationship("User", back_populates="achievements")
