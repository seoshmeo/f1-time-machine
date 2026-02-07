from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    environment: str = Field(default="development")
    log_level: str = Field(default="INFO")
    default_season: int = Field(default=2024)

    database_url: str = Field(default="sqlite:///../../db/f1_time_machine.db")

    backend_host: str = Field(default="0.0.0.0")
    backend_port: int = Field(default=8000)

    admin_api_key: str = Field(default="change-me-in-production")
    secret_key: str = Field(default="your-secret-key-change-in-production")

    cors_origins: str = Field(default="http://localhost:3000,http://localhost:5173")

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]


@lru_cache()
def get_settings() -> Settings:
    return Settings()
