# FDE LinkedIn Weekly Agent (Human-in-the-Loop)

An open, maintainable Python scaffold for an AI agent that:

1. Researches Forward Deployed Engineering (FDE) topics weekly (excluding Reddit)
2. Generates exactly one document-style LinkedIn draft per week
3. Sends draft to user for approval (manual publish only)
4. Tracks weekly post performance and suggests improvements

## Why this matches requirements

- **Exactly one draft/week**: scheduler + idempotency guard by ISO week
- **End-of-week delivery**: cron-based run (default Friday 17:00)
- **Human-in-the-loop**: no publish endpoint implemented
- **Tone**: prompt enforces thought-leadership + technical depth
- **Scope**: FDE + PM-in-FDE perspective only
- **Safety**: politics/sensitive-topic filter before notification
- **No Reddit**: domain blocklist in research stage
- **Traceability**: source links included in draft package
- **Weekly analytics + recommendations**: analytics pipeline with actionable suggestions

---

## Project structure

```
.
├── app
│   ├── main.py
│   ├── config.py
│   ├── models.py
│   ├── storage.py
│   ├── scheduler.py
│   ├── pipeline.py
│   ├── services
│   │   ├── llm_service.py
│   │   ├── research_service.py
│   │   ├── safety_service.py
│   │   ├── notification_service.py
│   │   └── analytics_service.py
│   └── prompts
│       └── draft_prompt.txt
├── data
│   ├── drafts.json
│   ├── runs.json
│   └── analytics.json
├── requirements.txt
├── .env.example
└── README.md
```

---

## Quick start

1. Create venv and install:

```bash
pip install -r requirements.txt
```

2. Configure env:

```bash
cp .env.example .env
# fill values
```

3. Run once (manual test):

```bash
python -m app.main run-once
```

4. Start scheduler:

```bash
python -m app.main schedule
```

---

## Open-source stack suggestions

- **Orchestration/Scheduling**: APScheduler (included), or Prefect/Temporal later
- **Storage**: JSON (included) -> SQLite/Postgres later
- **Notifications**: SMTP email (included), can swap Slack/Telegram
- **LLM**: OpenAI-compatible API wrapper (included)
- **Search**: Tavily/SerpAPI/NewsAPI adapter pattern (stub included)

---

## Notes on LinkedIn analytics

LinkedIn API access can be limited by app/account permissions. This scaffold supports:
- direct API integration when available
- manual metric entry fallback (still generates recommendations)

---

## Future extension

- Add approval UI (FastAPI + simple web page)
- Add vector memory for personal writing style
- Add auto-publish toggle (currently intentionally disabled)
