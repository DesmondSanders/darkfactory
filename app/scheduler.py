from apscheduler.schedulers.blocking import BlockingScheduler
from datetime import datetime
from .storage import Storage
from .pipeline.analytics import previous_week_window, summarize


def register_jobs(generate_fn, notify_fn, recommend_fn, linkedin_pull_fn=None):
    sched = BlockingScheduler(timezone="UTC")
    store = Storage()

    # Friday 17:00 UTC draft generation
    @sched.scheduled_job("cron", day_of_week="fri", hour=17, minute=0)
    def draft_job():
        generate_fn()

    # Monday 10:00 UTC analytics for prior week
    @sched.scheduled_job("cron", day_of_week="mon", hour=10, minute=0)
    def analytics_job():
        if linkedin_pull_fn:
            for p in store.published_posts_without_metrics():
                m = linkedin_pull_fn(p["post_url"])
                if m:
                    store.add_metrics(p["id"], m["impressions"], m["likes"], m["comments"], m["shares"], "linkedin_api")

        start_iso, end_iso = previous_week_window(datetime.utcnow())
        rows = store.latest_metrics_for_period(start_iso, end_iso)
        summary = summarize(rows)
        if summary:
            recommend_fn(summary)

    return sched
