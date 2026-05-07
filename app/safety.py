from __future__ import annotations


class Safety:
    SENSITIVE_KEYWORDS = {
        "election", "partisan", "democrat", "republican", "geopolitics", "war", "religion", "ethnicity"
    }
    FDE_HINTS = {"forward deployed", "fde", "field", "customer", "deployment", "platform", "pm"}

    def assert_non_sensitive(self, text: str) -> None:
        lower = text.lower()
        if any(k in lower for k in self.SENSITIVE_KEYWORDS):
            raise ValueError("Draft contains sensitive/political content")

    def assert_fde_scope(self, text: str) -> None:
        lower = text.lower()
        if not any(k in lower for k in self.FDE_HINTS):
            raise ValueError("Draft appears out of FDE/PM scope")

    def assert_tone(self, text: str) -> None:
        lower = text.lower()
        # lightweight gate for thought leadership + technical depth
        if len(text.split()) < 250:
            raise ValueError("Draft too short for document-style post")
        if "lesson" not in lower and "trade-off" not in lower and "architecture" not in lower:
            raise ValueError("Draft tone/depth gate failed")
