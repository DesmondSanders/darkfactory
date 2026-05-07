import argparse
from app.storage import Storage

p = argparse.ArgumentParser()
p.add_argument("--post-id", required=True)
p.add_argument("--impressions", type=int, required=True)
p.add_argument("--likes", type=int, required=True)
p.add_argument("--comments", type=int, required=True)
p.add_argument("--shares", type=int, required=True)
args = p.parse_args()

s = Storage()
s.add_metrics(args.post_id, args.impressions, args.likes, args.comments, args.shares, "manual")
print("ok")
