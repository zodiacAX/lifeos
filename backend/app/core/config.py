from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT = Path(__file__).resolve().parents[3]


def _normalize_postgres_url(value: str) -> str:
    value = value.strip()
    if value.startswith("postgres://"):
        return "postgresql+psycopg://" + value[len("postgres://"):]
    if value.startswith("postgresql://") and not value.startswith("postgresql+psycopg://"):
        return "postgresql+psycopg://" + value[len("postgresql://"):]
    return value


class Settings(BaseSettings):
    app_name: str = "LIFE//OS"
    database_url: str | None = None
    postgres_url: str | None = None
    jwt_secret: str = "lifeos-dev-secret-change-me-please-rotate-123456"
    cookie_secure: bool = False
    frontend_origin: str = "http://localhost:3000"
    model_config = SettingsConfigDict(env_file=ROOT / ".env", extra="ignore")

    @property
    def is_vercel(self) -> bool:
        return bool(os.getenv("VERCEL"))

    @property
    def persistent_database_configured(self) -> bool:
        return bool(self.database_url or self.postgres_url)

    @property
    def resolved_database_url(self) -> str:
        # Vercel Marketplace integrations commonly expose DATABASE_URL. Some
        # legacy/database integrations expose POSTGRES_URL, so support both.
        remote = self.database_url or self.postgres_url
        if remote:
            return _normalize_postgres_url(remote)

        if self.is_vercel:
            # Keep the API alive before a database is attached so the frontend
            # can show a useful diagnostic instead of FUNCTION_INVOCATION_FAILED.
            # This fallback is intentionally ephemeral and must not be used for
            # production persistence.
            return "sqlite:////tmp/lifeos-preview.db"

        return f"sqlite:///{(ROOT / 'data' / 'lifeos.db').as_posix()}"

    @property
    def effective_cookie_secure(self) -> bool:
        return self.cookie_secure or self.is_vercel


@lru_cache
def get_settings() -> Settings:
    return Settings()
