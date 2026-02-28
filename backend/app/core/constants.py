# Category point multipliers
CATEGORY_MULTIPLIERS = {
    "side_business": 1.5,
    "work": 1.0,
    "personal": 0.7,
    "recreational": 0.5,
}

# Transformation thresholds (cumulative total power)
TRANSFORMATIONS = [
    {"level": "base", "name": "Base Form", "threshold": 0},
    {"level": "ssj", "name": "Super Saiyan", "threshold": 500},
    {"level": "ssj2", "name": "Super Saiyan 2", "threshold": 1500},
    {"level": "ssj3", "name": "Super Saiyan 3", "threshold": 3500},
    {"level": "ssg", "name": "Super Saiyan God", "threshold": 7000},
    {"level": "ssb", "name": "Super Saiyan Blue", "threshold": 12000},
    {"level": "ui", "name": "Ultra Instinct", "threshold": 20000},
]

# Streak bonuses
STREAK_BONUSES = {
    7: 0.05,   # +5% at 7 days
    14: 0.08,  # +8% at 14 days
    30: 0.10,  # +10% at 30 days
    60: 0.15,  # +15% at 60 days
    90: 0.20,  # +20% at 90 days
}

# Daily login bonus points
LOGIN_BONUS_POINTS = 10

# Default daily minimum
DEFAULT_DAILY_MINIMUM = 100

# Energy levels
ENERGY_LEVELS = ["low", "medium", "high"]
