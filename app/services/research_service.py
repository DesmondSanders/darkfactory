from typing import List
from app.models import Source

BLOCKED_DOMAINS = {'reddit.com', 'www.reddit.com'}


class ResearchService:
    def fetch_sources(self, topic: str, max_results: int = 8) -> List[Source]:
        # Stub implementation for open adapter pattern.
        # Replace with Tavily/SerpAPI/NewsAPI integration.
        candidates = [
            Source(title='FDE delivery patterns', url='https://martinfowler.com/articles/', snippet='Delivery and product-engineering collaboration.'),
            Source(title='Platform engineering and field teams', url='https://thenewstack.io/', snippet='Platform and deployment practices.'),
            Source(title='MLOps in production', url='https://www.infoq.com/', snippet='Operational lessons for deployed systems.'),
        ]
        filtered = [s for s in candidates if not any(d in s.url for d in BLOCKED_DOMAINS)]
        return filtered[:max_results]
