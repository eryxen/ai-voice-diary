"""Groq Whisper API integration for speech-to-text."""

import httpx
from ..config import GROQ_API_KEY

GROQ_WHISPER_URL = "https://api.groq.com/openai/v1/audio/transcriptions"


async def transcribe_audio(audio_path: str, language: str = "zh") -> dict:
    """
    Transcribe audio file using Groq Whisper API.
    
    Returns:
        {"text": "transcribed text", "duration": float}
    """
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY not configured")

    async with httpx.AsyncClient(timeout=60.0) as client:
        with open(audio_path, "rb") as f:
            resp = await client.post(
                GROQ_WHISPER_URL,
                headers={"Authorization": f"Bearer {GROQ_API_KEY}"},
                files={"file": (audio_path.split("/")[-1], f)},
                data={
                    "model": "whisper-large-v3",
                    "language": language,
                    "response_format": "verbose_json",
                },
            )

    if resp.status_code != 200:
        raise RuntimeError(f"Whisper API error {resp.status_code}: {resp.text}")

    data = resp.json()
    return {
        "text": data.get("text", ""),
        "duration": data.get("duration", 0.0),
    }
