"""Pydantic models for API request/response."""

from pydantic import BaseModel
from typing import Optional


class DiaryEntry(BaseModel):
    id: str
    title: str
    content: str
    transcript: str
    mood: str
    key_events: list[str]
    todos: list[str]
    tags: list[str]
    audio_path: Optional[str] = None
    duration_sec: Optional[float] = None
    created_at: str


class DiaryListItem(BaseModel):
    id: str
    title: str
    mood: str
    tags: list[str]
    duration_sec: Optional[float] = None
    created_at: str


class DiaryListResponse(BaseModel):
    items: list[DiaryListItem]
    total: int
    page: int
    limit: int


class SearchResponse(BaseModel):
    items: list[DiaryListItem]
    query: str
    total: int
