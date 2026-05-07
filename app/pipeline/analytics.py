from datetime import datetime, timedelta


def previous_week_window(now: datetime):
    start_of_week = now - timedelta(days=now.weekday())
    prev_start = (start_of_week - timedelta(days=7)).replace(hour=0, minute=0, second=0, microsecond=0)
    prev_end = start_of_week.replace(hour=0, minute=0, second=0, microsecond=0)
    return prev_start.isoformat(), prev_end.isoformat()


def summarize(rows):
    if not rows:
        return None
    total_impressions = sum(r["impressions"] for r in rows)
    total_engagement = sum(r["likes"] + r["comments"] + r["shares"] for r in rows)
    er = (total_engagement / total_impressions) if total_impressions else 0
    return {
        "posts": len(rows),
        "impressions": total_impressions,
        "engagement": total_engagement,
        "engagement_rate": round(er, 4),
    }
