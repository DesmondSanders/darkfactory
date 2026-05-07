from app.models import AnalyticsRecord


class AnalyticsService:
    def summarize_and_recommend(self, record: AnalyticsRecord) -> AnalyticsRecord:
        recs = []
        if record.impressions < 1000:
            recs.append('Strengthen opening hook with a concrete FDE field anecdote in first 2 lines.')
        if record.comments < 5:
            recs.append('End with one specific question to invite practitioner discussion.')
        if record.likes < 20:
            recs.append('Add clearer technical framework (e.g., 3-step decision model) for shareability.')
        if not recs:
            recs.append('Performance is healthy; keep format and test a stronger contrarian insight next week.')
        record.recommendations = recs
        return record
