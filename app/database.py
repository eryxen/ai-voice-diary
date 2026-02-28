import sqlite3
import os
from contextlib import contextmanager
from .config import DB_PATH


def get_db_path():
    return DB_PATH


def init_db():
    with get_connection() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS diaries (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                transcript TEXT NOT NULL,
                mood TEXT DEFAULT 'neutral',
                key_events TEXT DEFAULT '[]',
                todos TEXT DEFAULT '[]',
                tags TEXT DEFAULT '[]',
                audio_path TEXT,
                duration_sec REAL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE VIRTUAL TABLE IF NOT EXISTS diaries_fts USING fts5(
                title, content, transcript,
                content=diaries, content_rowid=rowid
            );

            CREATE TRIGGER IF NOT EXISTS diaries_ai AFTER INSERT ON diaries BEGIN
                INSERT INTO diaries_fts(rowid, title, content, transcript)
                VALUES (new.rowid, new.title, new.content, new.transcript);
            END;

            CREATE TRIGGER IF NOT EXISTS diaries_ad AFTER DELETE ON diaries BEGIN
                INSERT INTO diaries_fts(diaries_fts, rowid, title, content, transcript)
                VALUES ('delete', old.rowid, old.title, old.content, old.transcript);
            END;

            CREATE TRIGGER IF NOT EXISTS diaries_au AFTER UPDATE ON diaries BEGIN
                INSERT INTO diaries_fts(diaries_fts, rowid, title, content, transcript)
                VALUES ('delete', old.rowid, old.title, old.content, old.transcript);
                INSERT INTO diaries_fts(rowid, title, content, transcript)
                VALUES (new.rowid, new.title, new.content, new.transcript);
            END;
        """)


@contextmanager
def get_connection():
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
