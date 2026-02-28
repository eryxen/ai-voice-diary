"""AI Voice Diary - FastAPI application."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from .database import init_db
from .routes import router

app = FastAPI(
    title="AI Voice Diary",
    description="🎙️ Speak your thoughts, get structured journals",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.on_event("startup")
async def startup():
    init_db()


@app.get("/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}


# Serve static files
app.mount("/static", StaticFiles(directory="static"), name="static")


# Root → serve index.html
@app.get("/")
async def root():
    return FileResponse("static/index.html")
