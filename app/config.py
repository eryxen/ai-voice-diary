import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1"

DB_PATH = os.getenv("DB_PATH", "diary.db")
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")

MAX_AUDIO_DURATION_SEC = 300  # 5 minutes
MAX_AUDIO_SIZE_MB = 25
