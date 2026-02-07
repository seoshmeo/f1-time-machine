"""Bot configuration using Pydantic settings."""
from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""

    # Telegram settings
    telegram_bot_token: str = Field(..., description="Telegram bot token from BotFather")
    telegram_webhook_url: str = Field(default="", description="Webhook URL for production")
    telegram_webhook_port: int = Field(default=8443, description="Webhook port")

    # Backend API settings
    backend_api_url: str = Field(
        default="http://localhost:8000/api/v1",
        description="Backend API base URL"
    )

    # Admin settings
    bot_admin_chat_id: int = Field(
        default=0,
        description="Admin chat ID for error notifications"
    )

    # Default user settings
    default_timezone: str = Field(default="Europe/Moscow", description="Default timezone")
    default_send_time: str = Field(default="09:00", description="Default daily send time")
    default_language: str = Field(default="ru", description="Default language")
    default_season: int = Field(default=2010, description="Default F1 season year")

    # Scheduler settings
    daily_broadcast_hour: int = Field(default=6, description="Hour for daily broadcast (UTC)")
    daily_broadcast_minute: int = Field(default=0, description="Minute for daily broadcast")

    # Rate limiting
    message_rate_limit: float = Field(
        default=0.05,
        description="Delay between messages to avoid rate limiting (seconds)"
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
