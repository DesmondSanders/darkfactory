# FDE LinkedIn Weekly Agent (Human-in-the-Loop)

Open-source Python scaffold for a weekly AI workflow that:
- researches Forward Deployed Engineering (FDE) topics (excluding Reddit),
- drafts exactly one long-form LinkedIn document-style post per week,
- notifies you for approval (manual publish only),
- tracks post performance after publishing and generates weekly recommendations.

## Acceptance Coverage

- Exactly one draft per week at end-of-week schedule ✅
- Draft delivered via notification for approval ✅
- Thought leadership + technical tone ✅
- FDE + PM-in-FDE perspective enforced ✅
- Reddit excluded from research ✅
- Politics/sensitive topics blocked ✅
- Weekly analytics summary + actionable recommendations after publishing ✅

## QA Fixes Included

1. **Post lifecycle tracking**
   - `drafted -> approved -> published`
   - analytics runs against published posts in target period.

2. **Analytics ingestion path**
   - LinkedIn adapter (optional, if permissions/token available)
   - manual metrics fallback CLI/API
   - recommendations generated only when metrics exist.

3. **Stronger safety filtering**
   - layered checks: scope classifier + political/sensitive detector + keyword policy.

4. **Scheduler timing fix**
   - explicit cron for generation and analytics (no modulo minute arithmetic).

## Project Structure

```text
fde_linkedin_agent/
  app/
    main.py
    config.py
    models.py
    storage.py
    scheduler.py
    pipeline/
      research.py
      safety.py
      drafting.py
      notify.py
      analytics.py
      recommendations.py
    adapters/
      llm.py
      search.py
      messaging.py
      linkedin.py
  scripts/
    mark_published.py
    ingest_manual_metrics.py
  requirements.txt
  .env.example
```

## Quick Start

1. Create env and install:
```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

2. Configure `.env` from `.env.example`.

3. Run scheduler:
```bash
python -m app.main
```

4. Weekly flow:
- Friday generation job creates one draft and sends notification.
- You review and publish manually on LinkedIn.
- Mark post as published:
```bash
python scripts/mark_published.py --draft-id <id> --post-url <linkedin-url> --published-at "2026-05-09T18:00:00"
```
- Ingest metrics (manual fallback):
```bash
python scripts/ingest_manual_metrics.py --post-id <id> --impressions 1200 --likes 45 --comments 8 --shares 3
```
- Analytics job summarizes and recommends improvements.

## Notes

- No auto-publish implemented by design.
- LinkedIn API is optional and adapter-based.
- SQLite default storage; easy to swap for Postgres.
