import argparse
from app.storage import Storage

p = argparse.ArgumentParser()
p.add_argument("--draft-id", required=True)
p.add_argument("--post-url", required=True)
p.add_argument("--published-at", required=True)
args = p.parse_args()

s = Storage()
pid = s.mark_published(args.draft_id, args.post_url, args.published_at)
print(pid)
