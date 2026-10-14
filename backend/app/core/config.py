from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    bot_token: str = ""
    chat_id: str = ""
    allowed_origins: str = "http://localhost:5173"
    environment: str = "development"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def allowed_origins_list(self) -> List[str]:
        """Parse comma-separated origins. In development, '/*' or 'allow-all' enables wildcard."""
        env = self.environment.strip().lower()
        raw = self.allowed_origins.strip()
        if env == "development" and raw in ("/*", "allow-all", "*"):
            return ["*"]
        return [origin.strip() for origin in raw.split(",") if origin.strip()]

    @property
    def telegram_configured(self) -> bool:
        return bool(self.bot_token) and bool(self.chat_id)


settings = Settings()