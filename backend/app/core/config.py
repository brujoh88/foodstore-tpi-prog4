from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuración leída del entorno y, si no está ahí, del archivo .env."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    DATABASE_URL: str = "sqlite:///./foodstore.db"

    # Sin valor por defecto a propósito: si falta o es corta, la API no arranca
    # firmando tokens con una clave débil.
    SECRET_KEY: str = Field(min_length=32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    FRONTEND_ORIGIN: str = "http://localhost:5173"

    # En producción, con HTTPS, va en true para que la cookie solo viaje cifrada.
    COOKIE_SECURE: bool = False

    @property
    def database_url(self) -> str:
        # SQLAlchemy 2.1 asocia "postgresql://" a psycopg 3, que no está instalado.
        # Se fija el driver psycopg2 para que la URL del ejemplo funcione tal cual.
        if self.DATABASE_URL.startswith("postgresql://"):
            return self.DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)
        return self.DATABASE_URL


settings = Settings()
