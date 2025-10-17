import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """Application-wide settings."""

    # Allow populating settings from a .env file
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    # Telegram Bot Credentials
    BOT_TOKEN: str = "YOUR_BOT_TOKEN_HERE"
    ADMIN_USER_ID: int = 0

    # MongoDB Connection Details
    DATABASE_URL: str = "mongodb://localhost:27017/"
    MONGO_DB_NAME: str = "manus_analytics_db"

    # Web App URL for keep-alive service
    WEB_APP_URL: str | None = None

settings = Settings()
