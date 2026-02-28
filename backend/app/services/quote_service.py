import random
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.quote import Quote

class QuoteService:
    
    @staticmethod
    def get_vegeta_roast(db: Session, consecutive_missed: int = 1) -> dict:
        """Get a Vegeta roast based on how many days missed."""
        if consecutive_missed <= 2:
            severity = 1
        elif consecutive_missed <= 5:
            severity = 2
        else:
            severity = 3
        
        quote = db.query(Quote).filter(
            Quote.character == "vegeta",
            Quote.context == "slacking",
            Quote.severity <= severity
        ).order_by(func.random()).first()
        
        if quote:
            return {"character": "vegeta", "quote_text": quote.quote_text, "context": "slacking", "severity": quote.severity, "source_saga": quote.source_saga}
        return {"character": "vegeta", "quote_text": "You're pathetic. Get back to work!", "context": "slacking", "severity": 1, "source_saga": None}
    
    @staticmethod
    def get_goku_motivation(db: Session, context: str = "motivation") -> dict:
        """Get a Goku motivational quote."""
        quote = db.query(Quote).filter(
            Quote.character == "goku",
            Quote.context == context
        ).order_by(func.random()).first()
        
        if quote:
            return {"character": "goku", "quote_text": quote.quote_text, "context": context, "severity": 0, "source_saga": quote.source_saga}
        return {"character": "goku", "quote_text": "You're doing great! Keep pushing!", "context": "motivation", "severity": 0, "source_saga": None}
    
    @staticmethod
    def get_contextual_quote(db: Session, user_id: str, daily_min_met: bool, streak: int) -> dict:
        """Get the right quote based on current state."""
        if not daily_min_met and streak == 0:
            return QuoteService.get_vegeta_roast(db, 1)
        elif daily_min_met and streak >= 7:
            return QuoteService.get_goku_motivation(db, "streak")
        elif daily_min_met:
            return QuoteService.get_goku_motivation(db, "motivation")
        else:
            return QuoteService.get_goku_motivation(db, "motivation")
