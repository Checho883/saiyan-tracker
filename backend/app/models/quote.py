import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text
from app.database.base import Base

class Quote(Base):
    __tablename__ = "quotes"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    character = Column(String(50), nullable=False)  # vegeta, goku
    quote_text = Column(Text, nullable=False)
    context = Column(String(100), nullable=False)  # slacking, streak, milestone, motivation, task_complete
    severity = Column(Integer, default=1)  # 1=mild, 2=medium, 3=savage (for vegeta)
    source_saga = Column(String(100), nullable=True)  # e.g. "Namek Saga", "Cell Saga"
    created_at = Column(DateTime, default=datetime.utcnow)
