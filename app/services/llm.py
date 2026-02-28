"""LLM integration for diary structuring. Supports DeepSeek and Groq."""

import json
import httpx
from ..config import DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL, GROQ_API_KEY, LLM_PROVIDER

SYSTEM_PROMPT = """你是一个语音日记助手。用户会给你一段语音转录文字。
请输出以下 JSON 格式（只输出 JSON，不要其他文字）：

{
  "title": "一句话标题（<15字）",
  "content": "润色后的日记正文（保留口语感，修正语法错误，分段）",
  "mood": "happy|neutral|sad|anxious|excited",
  "key_events": ["事件1", "事件2"],
  "todos": ["待办1", "待办2"],
  "tags": ["标签1", "标签2"]
}

规则：
- 保留说话者的语气和个性
- 不要添加用户没说过的内容
- 如果没有待办事项，todos 返回空数组
- tags 最多 5 个
- mood 只能是以下之一：happy, neutral, sad, anxious, excited"""


async def structure_diary(transcript: str) -> dict:
    if LLM_PROVIDER == "groq":
        return await _call_groq(transcript)
    else:
        return await _call_deepseek(transcript)


async def _call_groq(transcript: str) -> dict:
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY not configured")

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": transcript},
                ],
                "temperature": 0.3,
                "response_format": {"type": "json_object"},
            },
        )

    if resp.status_code != 200:
        raise RuntimeError(f"Groq LLM error {resp.status_code}: {resp.text}")

    return _parse_response(resp.json())


async def _call_deepseek(transcript: str) -> dict:
    if not DEEPSEEK_API_KEY:
        raise ValueError("DEEPSEEK_API_KEY not configured")

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            f"{DEEPSEEK_BASE_URL}/chat/completions",
            headers={
                "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "deepseek-chat",
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": transcript},
                ],
                "temperature": 0.3,
                "response_format": {"type": "json_object"},
            },
        )

    if resp.status_code != 200:
        raise RuntimeError(f"DeepSeek API error {resp.status_code}: {resp.text}")

    return _parse_response(resp.json())


def _parse_response(data: dict) -> dict:
    content = data["choices"][0]["message"]["content"]

    try:
        result = json.loads(content)
    except json.JSONDecodeError:
        raise RuntimeError(f"LLM returned invalid JSON: {content[:200]}")

    required = ["title", "content", "mood"]
    for field in required:
        if field not in result:
            raise RuntimeError(f"LLM output missing field: {field}")

    result.setdefault("key_events", [])
    result.setdefault("todos", [])
    result.setdefault("tags", [])

    valid_moods = {"happy", "neutral", "sad", "anxious", "excited"}
    if result["mood"] not in valid_moods:
        result["mood"] = "neutral"

    return result
