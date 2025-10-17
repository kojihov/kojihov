"""Application configuration using Pydantic settings."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Centralised runtime configuration."""

    model_config = SettingsConfigDict(
        env_file="./.env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    BOT_TOKEN: str
    ADMIN_USER_ID: int
    MONGO_URI: str
    MONGO_DB_NAME: str
    LOG_LEVEL: str = "INFO"


settings = Settings()
