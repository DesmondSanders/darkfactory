from __future__ import annotations

from datetime import datetime


class InMemoryStore:
    def __init__(self):
        self.drafts = []
        self.published = []
        self.analytics_log = []

    def has_draft_for_week(self, year: int, week: int) -> bool:
        return any(d["year"] == year and d["week"] == week for d in self.drafts)

    def save_draft(self, content: str, sources: list[dict], year: int, week: int, status: str) -> str:
        draft_id = f"d-{len(self.drafts)+1}"
        self.drafts.append({
            "id": draft_id,
            "content": content,
            "sources": sources,
            "year": year,
            "week": week,
            "status": status,
            "created_at": datetime.utcnow().isoformat(),
        })
        return draft_id

    def list_published_posts(self) -> list[dict]:
        return list(self.published)

    def analytics_sent_this_week(self, post_id: str, now: datetime) -> bool:
        y, w, _ = now.isocalendar()
        return any(r["post_id"] == post_id and r["year"] == y and r["week"] == w for r in self.analytics_log)

    def mark_analytics_sent(self, post_id: str, now: datetime) -> None:
        y, w, _ = now.isocalendar()
        self.analytics_log.append({"post_id": post_id, "year": y, "week": w, "sent_at": now.isoformat()})
