from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger
from app.config import settings
from app.pipeline import run_weekly_generation, run_weekly_analytics


def start_scheduler():
    scheduler = BlockingScheduler(timezone=settings.timezone)

    scheduler.add_job(
        run_weekly_generation,
        CronTrigger(day_of_week=settings.cron_day_of_week, hour=settings.cron_hour, minute=settings.cron_minute),
        id='weekly_generation',
        replace_existing=True,
    )

    scheduler.add_job(
        run_weekly_analytics,
        CronTrigger(day_of_week=settings.cron_day_of_week, hour=settings.cron_hour, minute=(settings.cron_minute + 10) % 60),
        id='weekly_analytics',
        replace_existing=True,
    )

    print('Scheduler started...')
    scheduler.start()
