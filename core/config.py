"""Application configuration using Pydantic settings."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Centralised runtime configuration."""

    model_config = SettingsConfigDict(
        env_file="./.env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    BOT_TOKEN: str = "dummy-token"
    ADMIN_USER_ID: int = 0
    MONGO_URI: str = "mongodb://localhost:27017/"
    MONGO_DB_NAME: str = "manus_analytics_db"
    LOG_LEVEL: str = "INFO"


settings = Settings()
