"""API routes for diary operations."""

import json
import os
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from .config import UPLOAD_DIR, MAX_AUDIO_SIZE_MB
from .database import get_connection
from .models import DiaryEntry, DiaryListItem, DiaryListResponse, SearchResponse
from .services.whisper import transcribe_audio
from .services.llm import structure_diary

router = APIRouter(prefix="/api/diary")


@router.post("/create", response_model=DiaryEntry)
async def create_diary(audio: UploadFile = File(...)):
    """Upload audio → transcribe → structure → save."""
    # Validate file
    if not audio.content_type or not audio.content_type.startswith("audio/"):
        # Be lenient - accept common formats
        allowed = {"audio/", "video/webm", "application/octet-stream"}
        if not any(audio.content_type and audio.content_type.startswith(a) for a in allowed):
            raise HTTPException(400, f"Invalid content type: {audio.content_type}")

    # Read and save audio
    content = await audio.read()
    size_mb = len(content) / (1024 * 1024)
    if size_mb > MAX_AUDIO_SIZE_MB:
        raise HTTPException(413, f"File too large: {size_mb:.1f}MB (max {MAX_AUDIO_SIZE_MB}MB)")

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    diary_id = str(uuid.uuid4())
    ext = os.path.splitext(audio.filename or "audio.webm")[1] or ".webm"
    audio_path = os.path.join(UPLOAD_DIR, f"{diary_id}{ext}")

    with open(audio_path, "wb") as f:
        f.write(content)

    try:
        # Step 1: Transcribe
        whisper_result = await transcribe_audio(audio_path)
        transcript = whisper_result["text"]
        duration = whisper_result["duration"]

        if not transcript.strip():
            raise HTTPException(422, "No speech detected in audio")

        # Step 2: Structure with LLM
        structured = await structure_diary(transcript)

        # Step 3: Save to DB
        with get_connection() as conn:
            conn.execute(
                """INSERT INTO diaries 
                   (id, title, content, transcript, mood, key_events, todos, tags, audio_path, duration_sec)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    diary_id,
                    structured["title"],
                    structured["content"],
                    transcript,
                    structured["mood"],
                    json.dumps(structured["key_events"], ensure_ascii=False),
                    json.dumps(structured["todos"], ensure_ascii=False),
                    json.dumps(structured["tags"], ensure_ascii=False),
                    audio_path,
                    duration,
                ),
            )

        # Fetch and return
        return _get_diary_by_id(diary_id)

    except HTTPException:
        raise
    except Exception as e:
        # Cleanup on failure
        if os.path.exists(audio_path):
            os.remove(audio_path)
        raise HTTPException(500, f"Processing failed: {str(e)}")


@router.get("/list", response_model=DiaryListResponse)
async def list_diaries(page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100)):
    """List diary entries with pagination."""
    offset = (page - 1) * limit
    with get_connection() as conn:
        total = conn.execute("SELECT COUNT(*) FROM diaries").fetchone()[0]
        rows = conn.execute(
            "SELECT id, title, mood, tags, duration_sec, created_at FROM diaries ORDER BY created_at DESC LIMIT ? OFFSET ?",
            (limit, offset),
        ).fetchall()

    items = [
        DiaryListItem(
            id=r["id"],
            title=r["title"],
            mood=r["mood"],
            tags=json.loads(r["tags"]),
            duration_sec=r["duration_sec"],
            created_at=r["created_at"],
        )
        for r in rows
    ]
    return DiaryListResponse(items=items, total=total, page=page, limit=limit)


@router.get("/search", response_model=SearchResponse)
async def search_diaries(q: str = Query(..., min_length=1)):
    """Full-text search across diaries."""
    with get_connection() as conn:
        rows = conn.execute(
            """SELECT d.id, d.title, d.mood, d.tags, d.duration_sec, d.created_at
               FROM diaries_fts fts
               JOIN diaries d ON d.rowid = fts.rowid
               WHERE diaries_fts MATCH ?
               ORDER BY rank
               LIMIT 50""",
            (q,),
        ).fetchall()

    items = [
        DiaryListItem(
            id=r["id"],
            title=r["title"],
            mood=r["mood"],
            tags=json.loads(r["tags"]),
            duration_sec=r["duration_sec"],
            created_at=r["created_at"],
        )
        for r in rows
    ]
    return SearchResponse(items=items, query=q, total=len(items))


@router.get("/{diary_id}", response_model=DiaryEntry)
async def get_diary(diary_id: str):
    """Get a single diary entry."""
    entry = _get_diary_by_id(diary_id)
    if not entry:
        raise HTTPException(404, "Diary not found")
    return entry


@router.delete("/{diary_id}")
async def delete_diary(diary_id: str):
    """Delete a diary entry and its audio file."""
    with get_connection() as conn:
        row = conn.execute("SELECT audio_path FROM diaries WHERE id = ?", (diary_id,)).fetchone()
        if not row:
            raise HTTPException(404, "Diary not found")

        conn.execute("DELETE FROM diaries WHERE id = ?", (diary_id,))

        if row["audio_path"] and os.path.exists(row["audio_path"]):
            os.remove(row["audio_path"])

    return {"ok": True, "deleted": diary_id}


def _get_diary_by_id(diary_id: str) -> DiaryEntry | None:
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM diaries WHERE id = ?", (diary_id,)).fetchone()
    if not row:
        return None
    return DiaryEntry(
        id=row["id"],
        title=row["title"],
        content=row["content"],
        transcript=row["transcript"],
        mood=row["mood"],
        key_events=json.loads(row["key_events"]),
        todos=json.loads(row["todos"]),
        tags=json.loads(row["tags"]),
        audio_path=row["audio_path"],
        duration_sec=row["duration_sec"],
        created_at=row["created_at"],
    )
