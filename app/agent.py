from __future__ import annotations

from datetime import datetime, timezone

from app.research import filter_allowed_sources


class Agent:
    def __init__(self, store, researcher, writer, notifier, analytics, safety):
        self.store = store
        self.researcher = researcher
        self.writer = writer
        self.notifier = notifier
        self.analytics = analytics
        self.safety = safety

    def generate_weekly_draft(self) -> None:
        # exactly one draft per ISO week
        now = datetime.now(timezone.utc)
        year, week, _ = now.isocalendar()
        if self.store.has_draft_for_week(year, week):
            return

        raw_sources = self.researcher.fetch_fde_sources()
        allowed_sources = filter_allowed_sources(raw_sources)
        if not allowed_sources:
            raise RuntimeError("No allowed research sources after Reddit exclusion; aborting draft generation")

        draft = self.writer.compose_post(allowed_sources)

        self.safety.assert_fde_scope(draft)
        self.safety.assert_non_sensitive(draft)
        self.safety.assert_tone(draft)

        draft_id = self.store.save_draft(
            content=draft,
            sources=[{"title": s.title, "url": s.url, "snippet": s.snippet} for s in allowed_sources],
            year=year,
            week=week,
            status="drafted",
        )

        self.notifier.send_draft_for_approval(draft_id=draft_id, content=draft, sources=allowed_sources)

    def run_weekly_analytics(self) -> None:
        now = datetime.now(timezone.utc)
        published = self.store.list_published_posts()
        if not published:
            return

        for post in published:
            if self.store.analytics_sent_this_week(post["id"], now):
                continue

            metrics = self.analytics.fetch_metrics(post)
            if not metrics:
                continue

            summary, recommendations = self.analytics.summarize(metrics)
            self.notifier.send_analytics_summary(
                post_id=post["id"],
                summary=summary,
                recommendations=recommendations,
                metrics=metrics,
            )
            self.store.mark_analytics_sent(post["id"], now)
