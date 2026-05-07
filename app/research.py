from __future__ import annotations

from dataclasses import dataclass
from urllib.parse import urlparse


BLOCKED_DOMAINS = {"reddit.com", "www.reddit.com", "old.reddit.com", "np.reddit.com"}


@dataclass
class ResearchSource:
    title: str
    url: str
    snippet: str = ""


def _domain(url: str) -> str:
    host = (urlparse(url).hostname or "").lower().strip(".")
    return host


def is_reddit_url(url: str) -> bool:
    host = _domain(url)
    return host in BLOCKED_DOMAINS or host.endswith(".reddit.com")


def filter_allowed_sources(sources: list[ResearchSource]) -> list[ResearchSource]:
    return [s for s in sources if not is_reddit_url(s.url)]
