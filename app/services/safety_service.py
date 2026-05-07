from app.models import DraftPackage

BANNED_KEYWORDS = [
    'election', 'democrat', 'republican', 'geopolitics', 'war', 'religion', 'nsfw'
]


class SafetyService:
    def validate(self, draft: DraftPackage) -> bool:
        text = (draft.title + ' ' + draft.body).lower()
        if 'forward deployed engineering' not in text and 'fde' not in text:
            return False
        for k in BANNED_KEYWORDS:
            if k in text:
                return False
        return True
