"""Game constants — single source of truth for all XP, tier, and progression values."""

# --- Per-Habit Attribute XP ---
IMPORTANCE_XP = {
    "normal": 15,
    "important": 22,
    "critical": 30,
}

# --- Kaio-ken Completion Tiers ---
COMPLETION_TIERS = [
    {"min_rate": 1.0, "multiplier": 2.0, "name": "kaio_x20", "label": "Kaio-ken x20"},
    {"min_rate": 0.8, "multiplier": 1.5, "name": "kaio_x10", "label": "Kaio-ken x10"},
    {"min_rate": 0.5, "multiplier": 1.2, "name": "kaio_x3", "label": "Kaio-ken x3"},
    {"min_rate": 0.0, "multiplier": 1.0, "name": "base", "label": "Base"},
]

# --- Daily XP ---
BASE_DAILY_XP = 100

# --- Streak ---
STREAK_BONUS_PER_DAY = 0.05
STREAK_BONUS_CAP = 1.0
STREAK_MIN_COMPLETION = 0.8  # 80% needed for overall streak
ZENKAI_BONUS = 0.5  # +50% on comeback

# --- Capsule Drop ---
CAPSULE_DROP_CHANCE = 0.25
CAPSULE_RARITY_WEIGHTS = {
    "common": 0.60,
    "rare": 0.30,
    "epic": 0.10,
}

# --- Transformations (10 thresholds) ---
TRANSFORMATIONS = [
    {"key": "base", "name": "Base Saiyan", "threshold": 0},
    {"key": "ssj", "name": "Super Saiyan", "threshold": 1_000},
    {"key": "ssj2", "name": "Super Saiyan 2", "threshold": 3_000},
    {"key": "ssj3", "name": "Super Saiyan 3", "threshold": 7_500},
    {"key": "ssg", "name": "Super Saiyan God", "threshold": 15_000},
    {"key": "ssb", "name": "Super Saiyan Blue", "threshold": 30_000},
    {"key": "ui_sign", "name": "Ultra Instinct Sign", "threshold": 50_000},
    {"key": "mui", "name": "Mastered Ultra Instinct", "threshold": 75_000},
    {"key": "ue", "name": "Ultra Ego", "threshold": 110_000},
    {"key": "beast", "name": "Beast Form", "threshold": 150_000},
]

# --- Attribute Leveling ---
ATTRIBUTE_LEVEL_FORMULA_EXPONENT = 1.5
ATTRIBUTE_LEVEL_BASE_XP = 100  # xp_needed = 100 * level^1.5

ATTRIBUTE_TITLES = {
    "str": {5: "Fighter", 10: "Warrior", 25: "Elite Warrior", 50: "Super Elite", 100: "Legendary"},
    "vit": {5: "Survivor", 10: "Guardian", 25: "Defender", 50: "Immortal", 100: "Eternal"},
    "int": {5: "Student", 10: "Tactician", 25: "Strategist", 50: "Mastermind", 100: "Supreme"},
    "ki": {5: "Beginner", 10: "Apprentice", 25: "Ki Adept", 50: "Ki Master", 100: "Ultra"},
}

# --- Dragon Balls ---
DRAGON_BALLS_REQUIRED = 7

# --- Streak Milestones ---
STREAK_MILESTONES = [3, 7, 21, 30, 60, 90, 365]

# --- Milestone Badge Names (DBZ-themed) ---
MILESTONE_BADGE_NAMES = {
    3: "First Step",
    7: "Warrior Spirit",
    21: "Saiyan Pride",
    30: "Elite Fighter",
    60: "Super Saiyan",
    90: "Ascended Warrior",
    365: "Legend",
}

# --- Valid Enums ---
VALID_IMPORTANCES = ["normal", "important", "critical"]
VALID_ATTRIBUTES = ["str", "vit", "int", "ki"]
VALID_FREQUENCIES = ["daily", "weekdays", "custom"]
VALID_TRANSFORMATIONS = [t["key"] for t in TRANSFORMATIONS]
VALID_OFF_DAY_REASONS = ["sick", "vacation", "rest", "injury", "other"]
VALID_RARITIES = ["common", "rare", "epic"]
VALID_CHARACTERS = ["goku", "vegeta", "gohan", "piccolo", "whis", "beerus"]
VALID_TRIGGER_EVENTS = [
    "habit_complete",
    "perfect_day",
    "streak_milestone",
    "transformation",
    "zenkai",
    "roast",
    "welcome_back",
]
VALID_SEVERITIES = ["mild", "medium", "savage"]
VALID_THEMES = ["dark", "light"]
VALID_COMPLETION_TIERS = ["base", "kaio_x3", "kaio_x10", "kaio_x20"]
