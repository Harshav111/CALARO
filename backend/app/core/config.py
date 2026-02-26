from typing import Any, List, Optional

from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Calaro AI"
    API_V1_STR: str = "/api/v1"

    # Security
    SECRET_KEY: str = (
        "your-secret-key-change-this-for-production"  # Should be overridden in .env
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database
    SQLALCHEMY_DATABASE_URI: Optional[str] = None

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> Any:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        return v

    # AI
    OPENAI_API_KEY: str = "sk-placeholder"

    class Config:
        env_file = ".env"


settings = Settings()
