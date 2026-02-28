import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Integer, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.base import Base

class PowerLevel(Base):
    __tablename__ = "power_levels"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    power_level_date = Column(Date, nullable=False, default=date.today)
    total_power_points = Column(Integer, default=0)
    transformation_level = Column(String(50), default="base")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="power_levels")
