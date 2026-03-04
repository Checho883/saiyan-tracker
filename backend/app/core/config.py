"""Application configuration."""


class Settings:
    APP_TITLE: str = "Saiyan Tracker"
    DATABASE_URL: str = "sqlite:///saiyan_tracker.db"


settings = Settings()
