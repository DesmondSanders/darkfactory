from pydantic import BaseModel, Field
from typing import List, Optional


class Source(BaseModel):
    title: str
    url: str
    snippet: str = ''


class DraftPackage(BaseModel):
    week_key: str
    title: str
    body: str
    tone: str = 'thought-leadership + technical'
    sources: List[Source] = Field(default_factory=list)
    safety_passed: bool = False


class RunRecord(BaseModel):
    week_key: str
    draft_generated: bool = False
    notified: bool = False


class AnalyticsRecord(BaseModel):
    week_key: str
    post_url: Optional[str] = None
    impressions: int = 0
    likes: int = 0
    comments: int = 0
    recommendations: List[str] = Field(default_factory=list)
