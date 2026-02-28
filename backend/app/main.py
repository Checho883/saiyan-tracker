from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import API_PREFIX
from app.api.router import api_router
from app.database.session import engine
from app.database.base import Base
from app.models import *  # Import all models to register them

app = FastAPI(title="Saiyan Tracker API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables on startup
@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    seed_default_data()

def seed_default_data():
    from app.database.session import SessionLocal
    from app.models.user import User
    from app.models.category import TaskCategory
    from app.models.streak import Streak
    from app.models.quote import Quote
    
    db = SessionLocal()
    try:
        # Create default user if not exists
        user = db.query(User).filter(User.id == "default-user").first()
        if not user:
            user = User(id="default-user", username="Sergio", email="sergio@saiyantracker.com", daily_point_minimum=100)
            db.add(user)
            db.commit()
        
        # Create default categories if not exists
        cats = db.query(TaskCategory).filter(TaskCategory.user_id == "default-user").count()
        if cats == 0:
            default_cats = [
                TaskCategory(user_id="default-user", name="Side Business", point_multiplier=1.5, color_code="#FF6B00", icon="rocket"),
                TaskCategory(user_id="default-user", name="Work", point_multiplier=1.0, color_code="#3B82F6", icon="briefcase"),
                TaskCategory(user_id="default-user", name="Personal", point_multiplier=0.7, color_code="#10B981", icon="user"),
                TaskCategory(user_id="default-user", name="Recreational", point_multiplier=0.5, color_code="#8B5CF6", icon="gamepad"),
            ]
            db.add_all(default_cats)
            db.commit()
        
        # Create default streak if not exists
        streak = db.query(Streak).filter(Streak.user_id == "default-user").first()
        if not streak:
            streak = Streak(user_id="default-user", current_streak=0, best_streak=0)
            db.add(streak)
            db.commit()
        
        # Seed quotes if not exists
        quote_count = db.query(Quote).count()
        if quote_count == 0:
            quotes = [
                # Vegeta roasts - mild (severity 1)
                Quote(character="vegeta", quote_text="Is that all you've got? Even Yamcha puts in more effort!", context="slacking", severity=1),
                Quote(character="vegeta", quote_text="You call that training? My warm-up is more intense than your entire day!", context="slacking", severity=1),
                Quote(character="vegeta", quote_text="Hmph. At this rate, you'll never surpass your limits.", context="slacking", severity=1),
                Quote(character="vegeta", quote_text="A true Saiyan warrior doesn't rest when there's work to be done!", context="slacking", severity=1),
                Quote(character="vegeta", quote_text="You're slacking off? How disappointing.", context="slacking", severity=1),
                Quote(character="vegeta", quote_text="I've seen Saibamen with more dedication than you.", context="slacking", severity=1),
                Quote(character="vegeta", quote_text="Your power level is... embarrassing.", context="slacking", severity=1),
                
                # Vegeta roasts - medium (severity 2)
                Quote(character="vegeta", quote_text="PATHETIC! You're weaker than Krillin on his worst day!", context="slacking", severity=2),
                Quote(character="vegeta", quote_text="This is a disgrace to the Saiyan race! Get off your ass!", context="slacking", severity=2),
                Quote(character="vegeta", quote_text="You think sitting around will make you stronger?! FOOL!", context="slacking", severity=2),
                Quote(character="vegeta", quote_text="Kakarot would NEVER slack this much. Are you even trying?!", context="slacking", severity=2),
                Quote(character="vegeta", quote_text="Every second you waste, your enemies grow stronger!", context="slacking", severity=2),
                Quote(character="vegeta", quote_text="I didn't endure 150x gravity to watch YOU be lazy!", context="slacking", severity=2),
                
                # Vegeta roasts - savage (severity 3)
                Quote(character="vegeta", quote_text="YOU ABSOLUTE WASTE OF SAIYAN POTENTIAL! I should have left you on Earth to rot!", context="slacking", severity=3),
                Quote(character="vegeta", quote_text="WHAT IS THIS PATHETIC DISPLAY?! You're an embarrassment to every warrior who ever lived!", context="slacking", severity=3),
                Quote(character="vegeta", quote_text="I'VE HAD ENOUGH! Either get up and fight or admit you're NOTHING!", context="slacking", severity=3),
                Quote(character="vegeta", quote_text="You disgust me! Even Frieza showed more dedication, and he's a TYRANT!", context="slacking", severity=3),
                Quote(character="vegeta", quote_text="UNACCEPTABLE! Your power level is dropping! You're going BACKWARDS!", context="slacking", severity=3),
                Quote(character="vegeta", quote_text="At this rate, you couldn't beat a FARMER WITH A SHOTGUN!", context="slacking", severity=3),
                
                # Goku motivation - general
                Quote(character="goku", quote_text="Hey! Every bit of training counts! You're doing awesome!", context="motivation", severity=0),
                Quote(character="goku", quote_text="I always look forward to a challenge! You should too!", context="motivation", severity=0),
                Quote(character="goku", quote_text="The more you push yourself, the stronger you get! That's the fun part!", context="motivation", severity=0),
                Quote(character="goku", quote_text="You're getting stronger! I can feel it!", context="motivation", severity=0),
                Quote(character="goku", quote_text="There's always room to grow! Let's keep going!", context="motivation", severity=0),
                Quote(character="goku", quote_text="Power comes in response to a need. And right now, you need to crush those tasks!", context="motivation", severity=0),
                Quote(character="goku", quote_text="I've learned that the more you train, the more surprises you find! Keep at it!", context="motivation", severity=0),
                Quote(character="goku", quote_text="Giving up isn't in our vocabulary! Let's do this!", context="motivation", severity=0),
                
                # Goku motivation - task complete
                Quote(character="goku", quote_text="AMAZING! You just powered up! That felt great, right?!", context="task_complete", severity=0),
                Quote(character="goku", quote_text="Woah! Your power level just jumped! Keep it up!", context="task_complete", severity=0),
                Quote(character="goku", quote_text="That's the spirit! Every task makes you stronger!", context="task_complete", severity=0),
                Quote(character="goku", quote_text="You're on fire today! This is SO exciting!", context="task_complete", severity=0),
                
                # Goku motivation - streak
                Quote(character="goku", quote_text="Your streak is incredible! You're training like a TRUE warrior!", context="streak", severity=0),
                Quote(character="goku", quote_text="Look at that consistency! Even I'm impressed!", context="streak", severity=0),
                Quote(character="goku", quote_text="You haven't missed a day! That's the kind of discipline that creates legends!", context="streak", severity=0),
                Quote(character="goku", quote_text="This streak proves it — you've got the heart of a Saiyan!", context="streak", severity=0),
                
                # Goku motivation - transformation
                Quote(character="goku", quote_text="INCREDIBLE! You've broken through your limits! A new transformation!", context="transformation", severity=0),
                Quote(character="goku", quote_text="I felt that from across the universe! You just reached a WHOLE NEW LEVEL!", context="transformation", severity=0),
                Quote(character="goku", quote_text="This power... it's amazing! You've ascended beyond what I thought possible!", context="transformation", severity=0),
            ]
            db.add_all(quotes)
            db.commit()
    finally:
        db.close()

@app.get("/")
def root():
    return {"message": "Saiyan Tracker API v1.0", "status": "POWER LEVEL OVER 9000!"}

app.include_router(api_router, prefix=API_PREFIX)
