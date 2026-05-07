from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8')

    cron_day_of_week: str = 'fri'
    cron_hour: int = 17
    cron_minute: int = 0
    timezone: str = 'UTC'

    user_name: str = 'User'
    user_email: str = 'user@example.com'

    llm_api_key: str = ''
    llm_base_url: str = 'https://api.openai.com/v1'
    llm_model: str = 'gpt-4o-mini'

    search_api_key: str = ''
    search_provider: str = 'stub'

    smtp_host: str = ''
    smtp_port: int = 587
    smtp_user: str = ''
    smtp_pass: str = ''
    smtp_from: str = 'agent@example.com'

    linkedin_access_token: str = ''


settings = Settings()
