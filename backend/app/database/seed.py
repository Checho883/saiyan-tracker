"""Seed data — idempotent functions for default user, categories, rewards, wishes, and 100+ quotes."""

import uuid

from sqlalchemy.orm import Session

from app.models.user import User
from app.models.category import Category
from app.models.reward import Reward
from app.models.wish import Wish
from app.models.quote import Quote


# ---------------------------------------------------------------------------
# Default user
# ---------------------------------------------------------------------------

def seed_default_user(db: Session) -> User:
    """Create the default user if not already present. Returns the user."""
    user = db.query(User).filter(User.username == "default-user").first()
    if user is None:
        user = User(
            username="default-user",
            display_name="Saiyan",
            sound_enabled=True,
            theme="dark",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


# ---------------------------------------------------------------------------
# Default categories
# ---------------------------------------------------------------------------

_DEFAULT_CATEGORIES = [
    {"name": "Health", "color_code": "#FF4444", "icon": "\u2764\ufe0f", "sort_order": 0},
    {"name": "Mind", "color_code": "#4488FF", "icon": "\U0001f9e0", "sort_order": 1},
    {"name": "Body", "color_code": "#44CC44", "icon": "\U0001f4aa", "sort_order": 2},
    {"name": "Family", "color_code": "#FF8844", "icon": "\U0001f468\u200d\U0001f469\u200d\U0001f467\u200d\U0001f466", "sort_order": 3},
    {"name": "Skills", "color_code": "#AA44FF", "icon": "\U0001f3af", "sort_order": 4},
    {"name": "Discipline", "color_code": "#FFCC00", "icon": "\U0001f525", "sort_order": 5},
]


def seed_default_categories(db: Session, user_id: uuid.UUID) -> None:
    """Insert 6 default categories if none exist for the user."""
    count = db.query(Category).filter(Category.user_id == user_id).count()
    if count > 0:
        return
    for cat in _DEFAULT_CATEGORIES:
        db.add(Category(user_id=user_id, **cat))
    db.commit()


# ---------------------------------------------------------------------------
# Default rewards
# ---------------------------------------------------------------------------

_DEFAULT_REWARDS = [
    # Common
    {"title": "15 min TikTok", "rarity": "common"},
    {"title": "Eat a snack", "rarity": "common"},
    {"title": "10 min break", "rarity": "common"},
    {"title": "Listen to a song", "rarity": "common"},
    {"title": "5 min social media", "rarity": "common"},
    {"title": "Stretch break", "rarity": "common"},
    # Rare
    {"title": "30 min gaming", "rarity": "rare"},
    {"title": "Buy a coffee", "rarity": "rare"},
    {"title": "Watch an episode", "rarity": "rare"},
    # Epic
    {"title": "Order takeout", "rarity": "epic"},
]


def seed_default_rewards(db: Session, user_id: uuid.UUID) -> None:
    """Insert default rewards if none exist for the user."""
    count = db.query(Reward).filter(Reward.user_id == user_id).count()
    if count > 0:
        return
    for rw in _DEFAULT_REWARDS:
        db.add(Reward(user_id=user_id, **rw))
    db.commit()


# ---------------------------------------------------------------------------
# Default wishes
# ---------------------------------------------------------------------------

_DEFAULT_WISHES = [
    {"title": "Buy a new game"},
    {"title": "Full day off"},
    {"title": "Nice dinner out"},
    {"title": "New gear purchase"},
]


def seed_default_wishes(db: Session, user_id: uuid.UUID) -> None:
    """Insert default wishes if none exist for the user."""
    count = db.query(Wish).filter(Wish.user_id == user_id).count()
    if count > 0:
        return
    for w in _DEFAULT_WISHES:
        db.add(Wish(user_id=user_id, **w))
    db.commit()


# ---------------------------------------------------------------------------
# Quotes — 100+ entries
# ---------------------------------------------------------------------------

_QUOTES: list[dict] = [
    # =========================================================================
    # GOKU  (~30%)
    # =========================================================================

    # -- habit_complete --
    {"character": "goku", "quote_text": "Nice one! Every small victory adds up to something huge!", "source_saga": "Original", "trigger_event": "habit_complete"},
    {"character": "goku", "quote_text": "You did it! That's the spirit! Keep pushing forward!", "source_saga": "Original", "trigger_event": "habit_complete"},
    {"character": "goku", "quote_text": "One step at a time, just like training! You're getting stronger!", "source_saga": "Original", "trigger_event": "habit_complete"},
    {"character": "goku", "quote_text": "Alright! That's what I'm talking about!", "source_saga": "Original", "trigger_event": "habit_complete"},
    {"character": "goku", "quote_text": "Hey, great job! Now let's keep that momentum going!", "source_saga": "Original", "trigger_event": "habit_complete"},

    # -- perfect_day --
    {"character": "goku", "quote_text": "I've never been this excited before! You crushed every single one!", "source_saga": "DBS Tournament of Power", "trigger_event": "perfect_day"},
    {"character": "goku", "quote_text": "A perfect day! You're on fire! Even I'm impressed!", "source_saga": "Original", "trigger_event": "perfect_day"},
    {"character": "goku", "quote_text": "100%! That's the power of a true Saiyan warrior!", "source_saga": "Original", "trigger_event": "perfect_day"},
    {"character": "goku", "quote_text": "Wow, you didn't miss a single one! That takes real discipline!", "source_saga": "Original", "trigger_event": "perfect_day"},

    # -- streak_milestone --
    {"character": "goku", "quote_text": "You've been at this for days straight! That's incredible consistency!", "source_saga": "Original", "trigger_event": "streak_milestone"},
    {"character": "goku", "quote_text": "This streak is getting serious! You're training like a real warrior!", "source_saga": "Original", "trigger_event": "streak_milestone"},
    {"character": "goku", "quote_text": "Day after day, you just keep going! I love that fighting spirit!", "source_saga": "Original", "trigger_event": "streak_milestone"},

    # -- transformation --
    {"character": "goku", "quote_text": "I am the Super Saiyan, Son Goku!", "source_saga": "Namek Saga", "trigger_event": "transformation", "transformation_level": "ssj"},
    {"character": "goku", "quote_text": "This is what happens when you push past every limit! Super Saiyan 2!", "source_saga": "Cell Saga", "trigger_event": "transformation", "transformation_level": "ssj2"},
    {"character": "goku", "quote_text": "I'm sorry it took so much time. Super Saiyan 3!", "source_saga": "Buu Saga", "trigger_event": "transformation", "transformation_level": "ssj3"},
    {"character": "goku", "quote_text": "This power... it's the power of a Super Saiyan God!", "source_saga": "DBS Universe 6", "trigger_event": "transformation", "transformation_level": "ssg"},
    {"character": "goku", "quote_text": "This is Super Saiyan Blue. The power of a Super Saiyan God combined with Super Saiyan.", "source_saga": "DBS Universe 6", "trigger_event": "transformation", "transformation_level": "ssb"},
    {"character": "goku", "quote_text": "This is the autonomous state... Ultra Instinct Sign!", "source_saga": "DBS Tournament of Power", "trigger_event": "transformation", "transformation_level": "ui_sign"},
    {"character": "goku", "quote_text": "This is the complete Ultra Instinct!", "source_saga": "DBS Tournament of Power", "trigger_event": "transformation", "transformation_level": "mui"},

    # -- zenkai --
    {"character": "goku", "quote_text": "A Saiyan's power has no limits! Every setback makes us stronger!", "source_saga": "Namek Saga", "trigger_event": "zenkai"},
    {"character": "goku", "quote_text": "You came back! That's the Saiyan way — we get knocked down, we get back up even stronger!", "source_saga": "Original", "trigger_event": "zenkai"},
    {"character": "goku", "quote_text": "Zenkai boost activated! You're stronger than before!", "source_saga": "Original", "trigger_event": "zenkai"},

    # -- welcome_back --
    {"character": "goku", "quote_text": "Hey, you're back! I was starting to miss you! Let's get to work!", "source_saga": "Original", "trigger_event": "welcome_back"},
    {"character": "goku", "quote_text": "Welcome back! A real warrior always returns to the fight!", "source_saga": "Original", "trigger_event": "welcome_back"},
    {"character": "goku", "quote_text": "There you are! I knew you wouldn't quit for good!", "source_saga": "Original", "trigger_event": "welcome_back"},

    # -- roast (Goku is encouraging, not roasting — but mild playful ones) --
    {"character": "goku", "quote_text": "Hmm, you're slacking a little. Even I train every day, y'know!", "source_saga": "Original", "trigger_event": "roast", "severity": "mild"},
    {"character": "goku", "quote_text": "C'mon, don't tell me you're already tired! We're just getting started!", "source_saga": "Original", "trigger_event": "roast", "severity": "mild"},

    # =========================================================================
    # VEGETA  (~25%)
    # =========================================================================

    # -- habit_complete --
    {"character": "vegeta", "quote_text": "Acceptable. But don't think one victory makes you a warrior.", "source_saga": "Original", "trigger_event": "habit_complete"},
    {"character": "vegeta", "quote_text": "Hmph. You completed it. Now do it again tomorrow without hesitation.", "source_saga": "Original", "trigger_event": "habit_complete"},
    {"character": "vegeta", "quote_text": "Progress. Small, but I'll acknowledge it. Keep going.", "source_saga": "Original", "trigger_event": "habit_complete"},

    # -- perfect_day --
    {"character": "vegeta", "quote_text": "All habits completed? Perhaps there's Saiyan blood in you after all.", "source_saga": "Original", "trigger_event": "perfect_day"},
    {"character": "vegeta", "quote_text": "A perfect day. I expect nothing less. Now make it two.", "source_saga": "Original", "trigger_event": "perfect_day"},
    {"character": "vegeta", "quote_text": "Hmph. Flawless execution. That is the Saiyan standard.", "source_saga": "Original", "trigger_event": "perfect_day"},

    # -- streak_milestone --
    {"character": "vegeta", "quote_text": "Consistency. That's what separates elite warriors from the rest.", "source_saga": "Original", "trigger_event": "streak_milestone"},
    {"character": "vegeta", "quote_text": "This streak proves you have discipline. Don't let it end.", "source_saga": "Original", "trigger_event": "streak_milestone"},
    {"character": "vegeta", "quote_text": "Day after day. This is how a Saiyan prince trains.", "source_saga": "Original", "trigger_event": "streak_milestone"},

    # -- transformation --
    {"character": "vegeta", "quote_text": "I am the prince of all Saiyans!", "source_saga": "Namek Saga", "trigger_event": "transformation", "transformation_level": "ssj"},
    {"character": "vegeta", "quote_text": "You may have invaded my mind and my body... but there's one thing a Saiyan always keeps: his PRIDE!", "source_saga": "Buu Saga", "trigger_event": "transformation", "transformation_level": "ssj2"},
    {"character": "vegeta", "quote_text": "This is the power of Ultra Ego. A power that grows the more damage I take.", "source_saga": "DBS", "trigger_event": "transformation", "transformation_level": "ue"},

    # -- zenkai --
    {"character": "vegeta", "quote_text": "A Saiyan grows stronger after every defeat. Remember that.", "source_saga": "Original", "trigger_event": "zenkai"},
    {"character": "vegeta", "quote_text": "You fell, but you got back up. That is acceptable.", "source_saga": "Original", "trigger_event": "zenkai"},

    # -- welcome_back --
    {"character": "vegeta", "quote_text": "So you've returned. I was beginning to think you'd given up entirely.", "source_saga": "Original", "trigger_event": "welcome_back"},
    {"character": "vegeta", "quote_text": "Back again? Good. Quitting is beneath a Saiyan.", "source_saga": "Original", "trigger_event": "welcome_back"},

    # -- ROAST: mild --
    {"character": "vegeta", "quote_text": "Hmph. Even Kakarot wouldn't skip a day.", "source_saga": "Original", "trigger_event": "roast", "severity": "mild"},
    {"character": "vegeta", "quote_text": "Is this the best you can do? Pathetic.", "source_saga": "Namek Saga", "trigger_event": "roast", "severity": "mild"},
    {"character": "vegeta", "quote_text": "I've seen Saibamen with more dedication than you.", "source_saga": "Original", "trigger_event": "roast", "severity": "mild"},
    {"character": "vegeta", "quote_text": "One day off becomes two. Then you're no better than the humans.", "source_saga": "Original", "trigger_event": "roast", "severity": "mild"},
    {"character": "vegeta", "quote_text": "Tch. Missing habits? A prince would never be so careless.", "source_saga": "Original", "trigger_event": "roast", "severity": "mild"},

    # -- ROAST: medium --
    {"character": "vegeta", "quote_text": "You're falling behind, and I won't wait for you.", "source_saga": "Original", "trigger_event": "roast", "severity": "medium"},
    {"character": "vegeta", "quote_text": "At this rate, you'll never surpass your current form. Is that what you want?", "source_saga": "Original", "trigger_event": "roast", "severity": "medium"},
    {"character": "vegeta", "quote_text": "Every day you waste is a day Kakarot pulls further ahead.", "source_saga": "Original", "trigger_event": "roast", "severity": "medium"},
    {"character": "vegeta", "quote_text": "I didn't spend years in the gravity chamber to watch you slack off.", "source_saga": "Original", "trigger_event": "roast", "severity": "medium"},
    {"character": "vegeta", "quote_text": "Your power level is dropping. That's not a joke — it's a fact.", "source_saga": "Original", "trigger_event": "roast", "severity": "medium"},

    # -- ROAST: savage --
    {"character": "vegeta", "quote_text": "You call yourself a Saiyan? You're nothing but a disgrace to our race. Even Raditz had more dedication.", "source_saga": "Original", "trigger_event": "roast", "severity": "savage"},
    {"character": "vegeta", "quote_text": "Look at you. Skipping habits, wasting potential. Frieza destroyed our planet, but at least we fought. What's your excuse?", "source_saga": "Original", "trigger_event": "roast", "severity": "savage"},
    {"character": "vegeta", "quote_text": "You know what the difference between us is? I would rather die than stop training. You can't even open an app.", "source_saga": "Original", "trigger_event": "roast", "severity": "savage"},
    {"character": "vegeta", "quote_text": "I once let Cell reach his perfect form because of my pride. But even that mistake took more courage than your laziness.", "source_saga": "Cell Saga", "trigger_event": "roast", "severity": "savage"},
    {"character": "vegeta", "quote_text": "The Saiyan race was nearly extinct, and the survivors became legends. You have every advantage and you choose to do nothing. Disgusting.", "source_saga": "Original", "trigger_event": "roast", "severity": "savage"},
    {"character": "vegeta", "quote_text": "I sacrificed myself against Buu to protect what I loved. You won't even sacrifice 5 minutes for yourself. You're beneath contempt.", "source_saga": "Buu Saga", "trigger_event": "roast", "severity": "savage"},
    {"character": "vegeta", "quote_text": "Nappa was a fool, but at least he showed up to fight. You don't even show up.", "source_saga": "Original", "trigger_event": "roast", "severity": "savage"},

    # =========================================================================
    # PICCOLO  (~15%)
    # =========================================================================

    # -- habit_complete --
    {"character": "piccolo", "quote_text": "Good. One step forward. Discipline is a daily practice, not an event.", "source_saga": "Original", "trigger_event": "habit_complete"},
    {"character": "piccolo", "quote_text": "You completed it. Don't celebrate — just prepare for tomorrow.", "source_saga": "Original", "trigger_event": "habit_complete"},
    {"character": "piccolo", "quote_text": "Consistent effort beats raw talent. Remember that.", "source_saga": "Original", "trigger_event": "habit_complete"},

    # -- perfect_day --
    {"character": "piccolo", "quote_text": "A perfect day. That's rare. Make it a habit, not a fluke.", "source_saga": "Original", "trigger_event": "perfect_day"},
    {"character": "piccolo", "quote_text": "Every habit checked. That level of focus is what separates the strong from the weak.", "source_saga": "Original", "trigger_event": "perfect_day"},

    # -- streak_milestone --
    {"character": "piccolo", "quote_text": "A long streak like this shows mental fortitude. Keep your guard up.", "source_saga": "Original", "trigger_event": "streak_milestone"},
    {"character": "piccolo", "quote_text": "Discipline compounds. Your streak is proof of that.", "source_saga": "Original", "trigger_event": "streak_milestone"},

    # -- transformation --
    {"character": "piccolo", "quote_text": "Gohan, let it go! It's time to unleash everything!", "source_saga": "Cell Saga", "trigger_event": "transformation", "transformation_level": "ssj2"},

    # -- zenkai --
    {"character": "piccolo", "quote_text": "You came back from a setback. That's not weakness — that's growth.", "source_saga": "Original", "trigger_event": "zenkai"},
    {"character": "piccolo", "quote_text": "Every warrior falls. The question is whether they get back up.", "source_saga": "Original", "trigger_event": "zenkai"},

    # -- welcome_back --
    {"character": "piccolo", "quote_text": "You've been away. That's done now. Focus on what's ahead.", "source_saga": "Original", "trigger_event": "welcome_back"},
    {"character": "piccolo", "quote_text": "Welcome back. No excuses needed. Just start.", "source_saga": "Original", "trigger_event": "welcome_back"},

    # -- roast --
    {"character": "piccolo", "quote_text": "I trained Gohan when he was five. He didn't complain. What's your excuse?", "source_saga": "Original", "trigger_event": "roast", "severity": "mild"},
    {"character": "piccolo", "quote_text": "You're wasting time you don't have. The androids aren't waiting.", "source_saga": "Cell Saga", "trigger_event": "roast", "severity": "medium"},
    {"character": "piccolo", "quote_text": "I once fused with Kami to save the Earth. You can't even check a box.", "source_saga": "Cell Saga", "trigger_event": "roast", "severity": "savage"},

    # =========================================================================
    # GOHAN  (~10%)
    # =========================================================================

    # -- habit_complete --
    {"character": "gohan", "quote_text": "Nice work! Every habit you complete builds something real!", "source_saga": "Original", "trigger_event": "habit_complete"},
    {"character": "gohan", "quote_text": "You did it! See, it's not as hard as it seems once you start!", "source_saga": "Original", "trigger_event": "habit_complete"},

    # -- perfect_day --
    {"character": "gohan", "quote_text": "A perfect day! You should be proud of yourself!", "source_saga": "Original", "trigger_event": "perfect_day"},

    # -- streak_milestone --
    {"character": "gohan", "quote_text": "This streak is incredible! You're building something real here!", "source_saga": "Original", "trigger_event": "streak_milestone"},

    # -- transformation --
    {"character": "gohan", "quote_text": "Fight you? No. I wanna kill you.", "source_saga": "Cell Saga", "trigger_event": "transformation", "transformation_level": "ssj2"},
    {"character": "gohan", "quote_text": "This power... it was inside me all along!", "source_saga": "DBS Super Hero", "trigger_event": "transformation", "transformation_level": "beast"},

    # -- zenkai --
    {"character": "gohan", "quote_text": "I've been knocked down before. But I always had people counting on me to get back up.", "source_saga": "Original", "trigger_event": "zenkai"},

    # -- welcome_back --
    {"character": "gohan", "quote_text": "Hey, welcome back! It's never too late to start again!", "source_saga": "Original", "trigger_event": "welcome_back"},

    # -- roast --
    {"character": "gohan", "quote_text": "Even I balanced school and saving the world. You've got this.", "source_saga": "Original", "trigger_event": "roast", "severity": "mild"},
    {"character": "gohan", "quote_text": "I stopped training once. Cell almost destroyed everything. Don't make my mistake.", "source_saga": "Cell Saga", "trigger_event": "roast", "severity": "medium"},

    # =========================================================================
    # WHIS  (~10%)
    # =========================================================================

    # -- habit_complete --
    {"character": "whis", "quote_text": "Splendid! Another habit completed. Consistency is the mark of a true warrior.", "source_saga": "Original", "trigger_event": "habit_complete"},
    {"character": "whis", "quote_text": "Well done. You're learning that growth comes from daily practice.", "source_saga": "Original", "trigger_event": "habit_complete"},

    # -- perfect_day --
    {"character": "whis", "quote_text": "A perfect day! You're developing the discipline of an angel. Almost.", "source_saga": "Original", "trigger_event": "perfect_day"},

    # -- streak_milestone --
    {"character": "whis", "quote_text": "My my, what a streak! Even Lord Beerus would be impressed.", "source_saga": "Original", "trigger_event": "streak_milestone"},
    {"character": "whis", "quote_text": "Remarkable consistency. This is how mastery begins.", "source_saga": "Original", "trigger_event": "streak_milestone"},

    # -- transformation --
    {"character": "whis", "quote_text": "Ultra Instinct. Your body has learned to move on its own. Magnificent.", "source_saga": "DBS Tournament of Power", "trigger_event": "transformation", "transformation_level": "mui"},

    # -- zenkai --
    {"character": "whis", "quote_text": "A setback is merely an opportunity for a stronger comeback. How Saiyan of you.", "source_saga": "Original", "trigger_event": "zenkai"},

    # -- welcome_back --
    {"character": "whis", "quote_text": "Ah, you've returned! Better late than never, I suppose. Shall we begin?", "source_saga": "Original", "trigger_event": "welcome_back"},

    # -- roast --
    {"character": "whis", "quote_text": "Even Lord Beerus wakes up eventually. Though he does sleep for decades...", "source_saga": "Original", "trigger_event": "roast", "severity": "mild"},
    {"character": "whis", "quote_text": "You know, Goku and Vegeta train even while eating. Just a thought.", "source_saga": "Original", "trigger_event": "roast", "severity": "medium"},

    # =========================================================================
    # BEERUS  (~10%)
    # =========================================================================

    # -- habit_complete --
    {"character": "beerus", "quote_text": "Hmm, not bad. But remember, I could still destroy you.", "source_saga": "Original", "trigger_event": "habit_complete"},
    {"character": "beerus", "quote_text": "One habit completed. You may continue to exist.", "source_saga": "Original", "trigger_event": "habit_complete"},

    # -- perfect_day --
    {"character": "beerus", "quote_text": "A perfect day? Impressive. Perhaps I won't destroy this planet after all.", "source_saga": "Original", "trigger_event": "perfect_day"},

    # -- streak_milestone --
    {"character": "beerus", "quote_text": "A lengthy streak. You're almost entertaining enough to keep around.", "source_saga": "Original", "trigger_event": "streak_milestone"},

    # -- transformation --
    {"character": "beerus", "quote_text": "So you've ascended again. Show me if this power is worthy of a God of Destruction's attention.", "source_saga": "DBS", "trigger_event": "transformation", "transformation_level": "ssg"},

    # -- zenkai --
    {"character": "beerus", "quote_text": "You Saiyans and your zenkai boosts. Fine, use it. Get stronger. Entertain me.", "source_saga": "Original", "trigger_event": "zenkai"},

    # -- welcome_back --
    {"character": "beerus", "quote_text": "Oh, you're back. I was about to take another nap. Make this interesting.", "source_saga": "Original", "trigger_event": "welcome_back"},

    # -- roast --
    {"character": "beerus", "quote_text": "I've slept for 50 years and accomplished more than your week. Step it up.", "source_saga": "Original", "trigger_event": "roast", "severity": "mild"},
    {"character": "beerus", "quote_text": "If you were a planet, I'd have destroyed you by now. For being boring.", "source_saga": "Original", "trigger_event": "roast", "severity": "medium"},
    {"character": "beerus", "quote_text": "You test my patience more than Goku. And that is NOT a compliment.", "source_saga": "Original", "trigger_event": "roast", "severity": "savage"},

    # =========================================================================
    # EXTRA QUOTES to reach 100+ total
    # =========================================================================

    # Goku extras
    {"character": "goku", "quote_text": "I don't care if you're a god or a king — I'll keep training until I surpass them all!", "source_saga": "DBS Goku Black", "trigger_event": "habit_complete"},
    {"character": "goku", "quote_text": "Power comes in response to a need, not a desire. You have to create that need.", "source_saga": "Cell Saga", "trigger_event": "streak_milestone"},
    {"character": "goku", "quote_text": "I am a Saiyan who was raised on planet Earth, and in the name of every single one of you I've left behind, I will defeat you!", "source_saga": "DBS Goku Black", "trigger_event": "zenkai"},

    # Vegeta extras
    {"character": "vegeta", "quote_text": "Strength is the only thing that matters in this world. Everything else is just a delusion for the weak.", "source_saga": "Namek Saga", "trigger_event": "habit_complete"},
    {"character": "vegeta", "quote_text": "I do not fear this new challenge. Rather like a true warrior, I will rise to meet it.", "source_saga": "DBS", "trigger_event": "zenkai"},
    {"character": "vegeta", "quote_text": "There's only one certainty in life. A strong man stands above and conquers all!", "source_saga": "Buu Saga", "trigger_event": "streak_milestone"},

    # Piccolo extras
    {"character": "piccolo", "quote_text": "The real battle is with yourself. Win that one first.", "source_saga": "Original", "trigger_event": "habit_complete"},
    {"character": "piccolo", "quote_text": "Training isn't about shortcuts. It's about showing up when you don't want to.", "source_saga": "Original", "trigger_event": "streak_milestone"},

    # Gohan extras
    {"character": "gohan", "quote_text": "I know the power inside me is enough. I just have to trust it!", "source_saga": "DBS Super Hero", "trigger_event": "habit_complete"},

    # Whis extras
    {"character": "whis", "quote_text": "The key to growth is learning from every experience, good or bad.", "source_saga": "DBS Universe 6", "trigger_event": "habit_complete"},

    # Beerus extras
    {"character": "beerus", "quote_text": "Before creation comes destruction. Sometimes you must tear down old habits to build new ones.", "source_saga": "DBS", "trigger_event": "habit_complete"},

    # More Vegeta roasts to fill out the 5+ per severity
    {"character": "vegeta", "quote_text": "Your excuses are weaker than Yamcha at a Saibaman fight.", "source_saga": "Original", "trigger_event": "roast", "severity": "medium"},
    {"character": "vegeta", "quote_text": "I trained under 450x gravity. You can't handle a checklist.", "source_saga": "Original", "trigger_event": "roast", "severity": "savage"},
]


def seed_quotes(db: Session) -> None:
    """Bulk insert quotes if none exist. Idempotent."""
    count = db.query(Quote).count()
    if count > 0:
        return
    for q in _QUOTES:
        db.add(Quote(**q))
    db.commit()


# ---------------------------------------------------------------------------
# Master seed function
# ---------------------------------------------------------------------------

def seed_all(db: Session) -> None:
    """Run all seed functions in order. Idempotent — safe to call multiple times."""
    user = seed_default_user(db)
    seed_default_categories(db, user.id)
    seed_default_rewards(db, user.id)
    seed_default_wishes(db, user.id)
    seed_quotes(db)
