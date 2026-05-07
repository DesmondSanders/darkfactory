from __future__ import annotations

from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger

from app.config import Settings


def _parse_cron(expr: str, timezone: str) -> CronTrigger:
    parts = expr.split()
    if len(parts) != 5:
        raise ValueError(f"Invalid cron '{expr}'. Expected 5 fields: minute hour day month weekday")
    minute, hour, day, month, weekday = parts
    return CronTrigger(minute=minute, hour=hour, day=day, month=month, day_of_week=weekday, timezone=timezone)


def run_scheduler(agent) -> None:
    settings = Settings()
    scheduler = BlockingScheduler(timezone=settings.timezone)

    draft_trigger = _parse_cron(settings.draft_cron, settings.timezone)
    analytics_trigger = _parse_cron(settings.analytics_cron, settings.timezone)

    scheduler.add_job(
        agent.generate_weekly_draft,
        trigger=draft_trigger,
        id="weekly_draft",
        replace_existing=True,
        coalesce=True,
        max_instances=1,
    )
    scheduler.add_job(
        agent.run_weekly_analytics,
        trigger=analytics_trigger,
        id="weekly_analytics",
        replace_existing=True,
        coalesce=True,
        max_instances=1,
    )

    scheduler.start()
