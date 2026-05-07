from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class Draft:
    id: str
    week_key: str
    title: str
    body: str
    sources_json: str
    status: str  # drafted|approved|published
    created_at: datetime


@dataclass
class Post:
    id: str
    draft_id: str
    post_url: str
    published_at: datetime


@dataclass
class Metrics:
    id: str
    post_id: str
    impressions: int
    likes: int
    comments: int
    shares: int
    captured_at: datetime
    source: str  # linkedin_api|manual
