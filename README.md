# FDE LinkedIn Weekly Agent

This implementation delivers a maintainable, human-in-the-loop weekly workflow:

- Generates **exactly one** FDE-focused draft per week on configurable end-of-week cron.
- Sends draft via notifier for approval (no auto-publish).
- Enforces safety/scope/tone checks before sending.
- Excludes Reddit sources using robust domain parsing.
- Includes source links for traceability.
- Runs weekly analytics for published posts and sends summary + recommendations.

## Key QA Fixes Implemented

1. Scheduler now registers both weekly jobs from config cron/timezone.
2. Weekly analytics flow is implemented and notifier-delivered.
3. Draft generation aborts when filtered sources are empty.
4. Reddit exclusion uses parsed domain matching, including subdomains.

## Notes

- LinkedIn publishing remains manual by design (human-in-the-loop).
- LinkedIn API is optional and can be used by analytics adapter when available.
