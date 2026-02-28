# 🎙️ AI Voice Diary

Speak your thoughts, get structured journals.

语音输入 → Whisper 转文字 → DeepSeek 结构化 → 日记存储

## Features

- **语音转文字**: Groq Whisper API (fast, free tier)
- **AI 结构化**: 自动生成标题、情绪标签、关键事件、待办提取
- **全文检索**: SQLite FTS5
- **零成本运营**: 月费 < ¥50

## Quick Start

```bash
# 1. Clone
git clone https://github.com/eryxen/ai-voice-diary.git
cd ai-voice-diary

# 2. Setup
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 3. Configure
cp .env.example .env
# Edit .env with your API keys

# 4. Run
uvicorn app.main:app --reload --port 8000
```

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/diary/create` | Upload audio → get structured diary |
| GET | `/api/diary/list` | List entries (paginated) |
| GET | `/api/diary/{id}` | Get single entry |
| DELETE | `/api/diary/{id}` | Delete entry |
| GET | `/api/diary/search?q=` | Full-text search |
| GET | `/health` | Health check |

### Create a diary entry

```bash
curl -X POST http://localhost:8000/api/diary/create \
  -F "audio=@recording.webm"
```

### Response

```json
{
  "id": "uuid",
  "title": "忙碌的一天",
  "content": "今天开了三个会，下午终于把那个 bug 修好了...",
  "transcript": "原始转录文字...",
  "mood": "neutral",
  "key_events": ["修复 bug", "开会"],
  "todos": ["明天提交报告"],
  "tags": ["工作", "编程"],
  "duration_sec": 45.2,
  "created_at": "2026-02-28T12:00:00"
}
```

## Tech Stack

- **Backend**: FastAPI + SQLite
- **STT**: Groq Whisper (whisper-large-v3)
- **LLM**: DeepSeek V3
- **Search**: SQLite FTS5

## API Keys

- Groq: https://console.groq.com (free tier: 28800 sec/day)
- DeepSeek: https://platform.deepseek.com (¥1/百万 token)

## License

MIT
