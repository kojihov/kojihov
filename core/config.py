from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application-wide settings for Manus Analytics."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Telegram credentials
    BOT_TOKEN: str = "YOUR_BOT_TOKEN_HERE"
    ADMIN_USER_ID: int = Field(0, alias="ADMIN_ID")

    # MongoDB connection details
    MONGO_URI: str = Field(
        "mongodb://localhost:27017/",
        validation_alias=AliasChoices("MONGO_URI", "DATABASE_URL"),
    )
    MONGO_DB_NAME: str = "manus_analytics_db"

    # Logging configuration
    LOG_LEVEL: str = "INFO"

    # Web application settings
    WEB_APP_URL: str | None = None


settings = Settings()
