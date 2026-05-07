import sqlite3
from datetime import datetime
from uuid import uuid4


class Storage:
    def __init__(self, path: str = "fde_agent.db"):
        self.conn = sqlite3.connect(path)
        self.conn.row_factory = sqlite3.Row
        self._init()

    def _init(self):
        c = self.conn.cursor()
        c.execute("""
        CREATE TABLE IF NOT EXISTS drafts (
          id TEXT PRIMARY KEY,
          week_key TEXT NOT NULL,
          title TEXT NOT NULL,
          body TEXT NOT NULL,
          sources_json TEXT NOT NULL,
          status TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
        """)
        c.execute("""
        CREATE UNIQUE INDEX IF NOT EXISTS idx_drafts_week ON drafts(week_key)
        """)
        c.execute("""
        CREATE TABLE IF NOT EXISTS posts (
          id TEXT PRIMARY KEY,
          draft_id TEXT NOT NULL,
          post_url TEXT NOT NULL,
          published_at TEXT NOT NULL
        )
        """)
        c.execute("""
        CREATE TABLE IF NOT EXISTS metrics (
          id TEXT PRIMARY KEY,
          post_id TEXT NOT NULL,
          impressions INTEGER NOT NULL,
          likes INTEGER NOT NULL,
          comments INTEGER NOT NULL,
          shares INTEGER NOT NULL,
          captured_at TEXT NOT NULL,
          source TEXT NOT NULL
        )
        """)
        self.conn.commit()

    def draft_exists_for_week(self, week_key: str) -> bool:
        r = self.conn.execute("SELECT 1 FROM drafts WHERE week_key=?", (week_key,)).fetchone()
        return r is not None

    def create_draft(self, week_key: str, title: str, body: str, sources_json: str) -> str:
        did = str(uuid4())
        self.conn.execute(
            "INSERT INTO drafts VALUES (?,?,?,?,?,?,?)",
            (did, week_key, title, body, sources_json, "drafted", datetime.utcnow().isoformat()),
        )
        self.conn.commit()
        return did

    def mark_published(self, draft_id: str, post_url: str, published_at: str) -> str:
        pid = str(uuid4())
        self.conn.execute("UPDATE drafts SET status='published' WHERE id=?", (draft_id,))
        self.conn.execute("INSERT INTO posts VALUES (?,?,?,?)", (pid, draft_id, post_url, published_at))
        self.conn.commit()
        return pid

    def add_metrics(self, post_id: str, impressions: int, likes: int, comments: int, shares: int, source: str):
        mid = str(uuid4())
        self.conn.execute(
            "INSERT INTO metrics VALUES (?,?,?,?,?,?,?,?)",
            (mid, post_id, impressions, likes, comments, shares, datetime.utcnow().isoformat(), source),
        )
        self.conn.commit()

    def published_posts_without_metrics(self):
        return self.conn.execute("""
        SELECT p.* FROM posts p
        LEFT JOIN metrics m ON m.post_id = p.id
        WHERE m.id IS NULL
        """).fetchall()

    def latest_metrics_for_period(self, start_iso: str, end_iso: str):
        return self.conn.execute("""
        SELECT p.id as post_id, p.post_url, p.published_at, m.impressions, m.likes, m.comments, m.shares, m.source
        FROM posts p
        JOIN metrics m ON m.post_id = p.id
        WHERE p.published_at >= ? AND p.published_at < ?
        ORDER BY p.published_at DESC
        """, (start_iso, end_iso)).fetchall()
