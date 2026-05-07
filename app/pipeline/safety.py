import re

POLITICAL_TERMS = {
    "election", "senate", "parliament", "democrat", "republican", "campaign", "geopolitics"
}
SENSITIVE_TERMS = {
    "religion", "race", "sexual", "violence", "war", "abortion", "genocide"
}


def in_scope(text: str) -> bool:
    t = text.lower()
    return any(k in t for k in ["forward deployed engineering", "fde", "product manager", "enterprise implementation"])


def has_blocked_content(text: str) -> bool:
    tokens = set(re.findall(r"[a-zA-Z]+", text.lower()))
    return bool(tokens & POLITICAL_TERMS) or bool(tokens & SENSITIVE_TERMS)


def validate_content(text: str):
    if not in_scope(text):
        raise ValueError("Out of scope: must focus on FDE + PM perspective")
    if has_blocked_content(text):
        raise ValueError("Blocked: political or sensitive content detected")
