from typing import List
from app.models import Source, DraftPackage
from app.config import settings
import datetime as dt


class LLMService:
    def generate_draft(self, week_key: str, sources: List[Source]) -> DraftPackage:
        # Minimal deterministic fallback scaffold.
        # Replace with real LLM API call using settings.llm_*.
        src_lines = '\n'.join([f"- {s.title}: {s.url}" for s in sources])
        body = f"""# What Forward Deployed Engineering Taught Me This Week\n\nAs a Product Manager working closely with Forward Deployed Engineering (FDE) teams, I keep seeing the same pattern: impact comes from tight loops between user context, technical constraints, and delivery ownership.\n\n## 1) Start with operational reality\nFDE work succeeds when we model real workflows, not idealized requirements.\n\n## 2) Product decisions are deployment decisions\nIn FDE, roadmap quality is measured by production outcomes and adoption, not just shipped features.\n\n## 3) Technical depth builds trust\nPMs in FDE need enough technical fluency to make tradeoffs explicit and credible.\n\n### Sources consulted\n{src_lines}\n\nIf you’re building in FDE contexts, I’d love to compare notes on how you balance speed, reliability, and user-specific adaptation.\n"""
        return DraftPackage(
            week_key=week_key,
            title='What Forward Deployed Engineering Taught Me This Week',
            body=body,
            sources=sources,
            safety_passed=False,
        )


def current_week_key() -> str:
    now = dt.datetime.utcnow()
    y, w, _ = now.isocalendar()
    return f"{y}-W{w:02d}"
