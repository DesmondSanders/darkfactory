from datetime import datetime
import json
from .storage import Storage
from .pipeline.safety import validate_content
from .scheduler import register_jobs


def week_key(dt: datetime) -> str:
    y, w, _ = dt.isocalendar()
    return f"{y}-W{w:02d}"


def generate_weekly_draft():
    store = Storage()
    wk = week_key(datetime.utcnow())
    if store.draft_exists_for_week(wk):
        return

    # Placeholder research + draft generation
    sources = ["https://martinfowler.com", "https://www.thoughtworks.com/insights"]
    text = "Forward Deployed Engineering as a PM: balancing delivery velocity, trust, and platform leverage."
    validate_content(text)
    did = store.create_draft(wk, "FDE Weekly: PM Lessons from the Field", text, json.dumps(sources))
    notify_user(did, text, sources)


def notify_user(draft_id: str, body: str, sources: list[str]):
    print(f"[NOTIFY] Draft {draft_id} ready for approval. Sources: {sources}\n{body}")


def recommend(summary: dict):
    print("[ANALYTICS] Weekly summary:", summary)
    print("[RECOMMEND] Try stronger opening hook + one concrete architecture tradeoff example.")


def linkedin_pull(_url: str):
    return None  # optional adapter; manual fallback supported


if __name__ == "__main__":
    sched = register_jobs(generate_weekly_draft, notify_user, recommend, linkedin_pull_fn=linkedin_pull)
    sched.start()
