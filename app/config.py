from pydantic import BaseSettings, Field


class Settings(BaseSettings):
    app_name: str = "fde-linkedin-agent"
    db_url: str = Field(default="sqlite:///fde_agent.db")

    # Scheduling (explicit cron strings to avoid timing bugs)
    draft_cron: str = Field(default="0 17 * * FRI")
    analytics_cron: str = Field(default="0 10 * * MON")

    timezone: str = Field(default="UTC")

    # Policy
    blocked_domains: str = Field(default="reddit.com,www.reddit.com")
    allowed_scope_keywords: str = Field(default="forward deployed engineering,fde,product manager,pm,enterprise delivery,implementation")

    # Optional integrations
    llm_api_key: str | None = None
    search_api_key: str | None = None
    slack_webhook_url: str | None = None
    email_to: str | None = None
    linkedin_access_token: str | None = None

    class Config:
        env_file = ".env"


settings = Settings()
