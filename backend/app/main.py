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
                # ── VEGETA ROASTS ── mild (severity 1) ──
                Quote(character="vegeta", quote_text="You call yourself a warrior? How pathetic.", context="slacking", severity=1, source_saga="Saiyan Saga"),
                Quote(character="vegeta", quote_text="There's no such thing as fair or unfair in battle. There is only victory, or in your case, defeat.", context="slacking", severity=1, source_saga="Saiyan Saga"),
                Quote(character="vegeta", quote_text="Hmph. Spend less time dawdling and more time training.", context="slacking", severity=1, source_saga="Android Saga"),
                Quote(character="vegeta", quote_text="A Saiyan always keeps his pride, even if he can't keep up with his training.", context="slacking", severity=1, source_saga="Namek Saga"),
                Quote(character="vegeta", quote_text="Tch. I've seen better effort from Nappa.", context="slacking", severity=1, source_saga="Saiyan Saga"),
                Quote(character="vegeta", quote_text="Your laziness is showing, and it's not a good look.", context="slacking", severity=1, source_saga="Cell Saga"),
                Quote(character="vegeta", quote_text="Even the lowest class warriors train harder than you.", context="slacking", severity=1, source_saga="DBS: Broly"),

                # ── VEGETA ROASTS ── medium (severity 2) ──
                Quote(character="vegeta", quote_text="You are nothing but a worm! An insect!", context="slacking", severity=2, source_saga="Namek Saga"),
                Quote(character="vegeta", quote_text="How could you let yourself be beaten by such an insignificant nothing?!", context="slacking", severity=2, source_saga="Namek Saga"),
                Quote(character="vegeta", quote_text="Kakarot trained in 100 times gravity while you sit here doing NOTHING!", context="slacking", severity=2, source_saga="Namek Saga"),
                Quote(character="vegeta", quote_text="I am a Super Elite! And you? You're nothing but a slacker!", context="slacking", severity=2, source_saga="Saiyan Saga"),
                Quote(character="vegeta", quote_text="You think you can take a day off?! While I train day and night in the gravity chamber?!", context="slacking", severity=2, source_saga="Android Saga"),
                Quote(character="vegeta", quote_text="Your weakness disgusts me! Get up and fight, coward!", context="slacking", severity=2, source_saga="Majin Buu Saga"),
                Quote(character="vegeta", quote_text="I refuse to watch you waste the potential of a Saiyan warrior!", context="slacking", severity=2, source_saga="DBS"),

                # ── VEGETA ROASTS ── savage (severity 3) ──
                Quote(character="vegeta", quote_text="What a useless waste of energy! You don't deserve the blood of a warrior!", context="slacking", severity=3, source_saga="Namek Saga"),
                Quote(character="vegeta", quote_text="You're an embarrassment to all Saiyans! Frieza destroyed our planet and even HE works harder than you!", context="slacking", severity=3, source_saga="Namek Saga"),
                Quote(character="vegeta", quote_text="UNFORGIVABLE! I sacrificed EVERYTHING to become the strongest, and you can't even complete a single habit?!", context="slacking", severity=3, source_saga="Majin Buu Saga"),
                Quote(character="vegeta", quote_text="I let myself become Majin Vegeta for power! What have YOU sacrificed?! NOTHING!", context="slacking", severity=3, source_saga="Majin Buu Saga"),
                Quote(character="vegeta", quote_text="I WILL NOT be surpassed by a low-class warrior OR by your laziness! GET. UP.", context="slacking", severity=3, source_saga="Saiyan Saga"),
                Quote(character="vegeta", quote_text="You are a disgrace! At this rate you couldn't even defeat Raditz!", context="slacking", severity=3, source_saga="Saiyan Saga"),

                # ── VEGETA PRIDE ── push/encouragement from Vegeta ──
                Quote(character="vegeta", quote_text="I do not fear this new challenge. Rather like a true warrior I will rise to meet it.", context="pride", severity=0, source_saga="Cell Saga"),
                Quote(character="vegeta", quote_text="Push through it. Don't stop until you're proud.", context="pride", severity=0, source_saga="Android Saga"),
                Quote(character="vegeta", quote_text="Every time I reach a new level of strength, I find a deeper level within!", context="pride", severity=0, source_saga="DBS"),
                Quote(character="vegeta", quote_text="Strength is the only thing that matters in this world.", context="pride", severity=0, source_saga="Saiyan Saga"),
                Quote(character="vegeta", quote_text="I will not give up. I will not surrender. That is my pride as a Saiyan warrior!", context="pride", severity=0, source_saga="DBS: Tournament of Power"),
                Quote(character="vegeta", quote_text="While you were slacking, I was training. While you rested, I pushed harder. That is the difference between us.", context="pride", severity=0, source_saga="Android Saga"),

                # ── GOKU MOTIVATION ── general encouragement ──
                Quote(character="goku", quote_text="I am the hope of the universe!", context="motivation", severity=0, source_saga="Namek Saga"),
                Quote(character="goku", quote_text="Power comes in response to a need, not a desire. You have to create that need!", context="motivation", severity=0, source_saga="Cell Saga"),
                Quote(character="goku", quote_text="I've never really been the smartest, but I always try my hardest!", context="motivation", severity=0, source_saga="Majin Buu Saga"),
                Quote(character="goku", quote_text="Sometimes, we have to look beyond what we want and do what's best.", context="motivation", severity=0, source_saga="Majin Buu Saga"),
                Quote(character="goku", quote_text="Limits are meant to be broken! That's what training is all about!", context="motivation", severity=0, source_saga="DBS: Tournament of Power"),
                Quote(character="goku", quote_text="There's always someone stronger out there. That's what makes it exciting!", context="motivation", severity=0, source_saga="DBS"),
                Quote(character="goku", quote_text="I don't think of it as training. I think of it as getting to push myself!", context="motivation", severity=0, source_saga="DBS"),
                Quote(character="goku", quote_text="Even the mightiest warriors experience fears. What makes them a true warrior is the courage to overcome them.", context="motivation", severity=0, source_saga="Cell Saga"),
                Quote(character="goku", quote_text="The real fight is with yourself. And you're winning!", context="motivation", severity=0, source_saga="Majin Buu Saga"),
                Quote(character="goku", quote_text="I like challenges! The harder it is, the more fun it becomes!", context="motivation", severity=0, source_saga="Saiyan Saga"),

                # ── GOKU ── habit/task completion ──
                Quote(character="goku", quote_text="All right! That was a great one! Your power level just shot up!", context="task_complete", severity=0, source_saga="Namek Saga"),
                Quote(character="goku", quote_text="Wow, you finished that like it was nothing! You're getting stronger!", context="task_complete", severity=0, source_saga="Cell Saga"),
                Quote(character="goku", quote_text="That's the spirit! One step at a time and before you know it, you're unstoppable!", context="task_complete", severity=0, source_saga="DBS"),
                Quote(character="goku", quote_text="You did it! I knew you had it in you! Now let's keep that energy going!", context="task_complete", severity=0, source_saga="Saiyan Saga"),
                Quote(character="goku", quote_text="Ha! You made that look easy! You've been training hard, haven't you?", context="task_complete", severity=0, source_saga="DBS"),
                Quote(character="goku", quote_text="Nice one! Every habit you complete makes you a little bit stronger!", context="task_complete", severity=0, source_saga="Cell Saga"),

                # ── GOKU ── streak milestones ──
                Quote(character="goku", quote_text="Look at that streak! You're training like a TRUE warrior!", context="streak", severity=0, source_saga="DBS"),
                Quote(character="goku", quote_text="You haven't missed a day! That's the kind of discipline that creates legends!", context="streak", severity=0, source_saga="Cell Saga"),
                Quote(character="goku", quote_text="This streak proves it — you've got the heart of a Saiyan!", context="streak", severity=0, source_saga="Namek Saga"),
                Quote(character="goku", quote_text="Day after day, you keep showing up! Even King Kai would be impressed!", context="streak", severity=0, source_saga="Saiyan Saga"),
                Quote(character="goku", quote_text="Consistency like this is how you reach new forms! Keep it going!", context="streak", severity=0, source_saga="DBS: Tournament of Power"),

                # ── GOKU ── transformation unlocks ──
                Quote(character="goku", quote_text="I am a Super Saiyan! And you're becoming one too!", context="transformation", severity=0, source_saga="Namek Saga"),
                Quote(character="goku", quote_text="I felt that power surge from across the universe! You just reached a WHOLE NEW LEVEL!", context="transformation", severity=0, source_saga="Cell Saga"),
                Quote(character="goku", quote_text="This power... it's incredible! You've ascended beyond what I thought possible!", context="transformation", severity=0, source_saga="DBS"),
                Quote(character="goku", quote_text="This is what happens when you push past your limits! A new transformation!", context="transformation", severity=0, source_saga="DBS: Tournament of Power"),

                # ── TRANSFORMATION-SPECIFIC quotes ──
                Quote(character="goku", quote_text="This is what it means to go even further beyond! SUPER SAIYAN!", context="transformation_ssj", severity=0, source_saga="Namek Saga"),
                Quote(character="gohan", quote_text="Fight you? No, I want to kill you.", context="transformation_ssj2", severity=0, source_saga="Cell Saga"),
                Quote(character="goku", quote_text="I'm sorry it took so much time. This is what I call... Super Saiyan 3!", context="transformation_ssj3", severity=0, source_saga="Majin Buu Saga"),
                Quote(character="goku", quote_text="This warmth... this is the power of a Super Saiyan God!", context="transformation_ssg", severity=0, source_saga="DBS: Battle of Gods"),
                Quote(character="vegeta", quote_text="This is the power of a Saiyan who has reached the realm of the gods... Super Saiyan Blue!", context="transformation_ssb", severity=0, source_saga="DBS: Resurrection F"),
                Quote(character="goku", quote_text="This is the power of Ultra Instinct!", context="transformation_ui", severity=0, source_saga="DBS: Tournament of Power"),

                # ── GOKU ── all habits completed (consistency bonus) ──
                Quote(character="goku", quote_text="You completed ALL your habits today! That's what a true warrior does — no excuses!", context="all_complete", severity=0, source_saga="Cell Saga"),
                Quote(character="goku", quote_text="Every single one! You're on a whole different level today!", context="all_complete", severity=0, source_saga="DBS"),
                Quote(character="goku", quote_text="Wow, a perfect day! This is how Saiyans are supposed to train!", context="all_complete", severity=0, source_saga="Namek Saga"),
            ]
            db.add_all(quotes)
            db.commit()
    finally:
        db.close()

@app.get("/")
def root():
    return {"message": "Saiyan Tracker API v1.0", "status": "POWER LEVEL OVER 9000!"}

app.include_router(api_router, prefix=API_PREFIX)
