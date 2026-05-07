from app.models import RunRecord, AnalyticsRecord
from app.storage import load_models, save_models
from app.services.llm_service import LLMService, current_week_key
from app.services.research_service import ResearchService
from app.services.safety_service import SafetyService
from app.services.notification_service import NotificationService
from app.services.analytics_service import AnalyticsService


def run_weekly_generation():
    week = current_week_key()
    runs = load_models('runs.json', RunRecord)
    if any(r.week_key == week and r.draft_generated for r in runs):
        print(f'Skipping: draft already generated for {week}')
        return

    research = ResearchService()
    llm = LLMService()
    safety = SafetyService()
    notify = NotificationService()

    sources = research.fetch_sources('Forward Deployed Engineering PM lessons')
    draft = llm.generate_draft(week, sources)
    draft.safety_passed = safety.validate(draft)

    if not draft.safety_passed:
        raise RuntimeError('Safety validation failed; draft not sent.')

    drafts = load_models('drafts.json', type(draft))
    drafts = [d for d in drafts if d.week_key != week] + [draft]
    save_models('drafts.json', drafts)

    notify.send_draft_for_approval(draft)

    runs = [r for r in runs if r.week_key != week] + [RunRecord(week_key=week, draft_generated=True, notified=True)]
    save_models('runs.json', runs)
    print(f'Draft generated and notified for {week}')


def run_weekly_analytics():
    week = current_week_key()
    analytics = load_models('analytics.json', AnalyticsRecord)
    existing = next((a for a in analytics if a.week_key == week), None)
    if not existing:
        existing = AnalyticsRecord(week_key=week)

    service = AnalyticsService()
    updated = service.summarize_and_recommend(existing)

    analytics = [a for a in analytics if a.week_key != week] + [updated]
    save_models('analytics.json', analytics)
    print(f'Analytics recommendations updated for {week}')
