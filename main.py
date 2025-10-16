"""FastAPI application entrypoint for Manus Analytics."""

from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI

from bot.main import shutdown_bot, start_bot
from core.database import db_manager
from core.logger import log

_bot_task: Optional[asyncio.Task[None]] = None


@asynccontextmanager
async def lifespan(app: FastAPI):  # pragma: no cover - framework hook
    """Manage startup and shutdown events for the ASGI application."""

    global _bot_task

    log.info("🚀 Application startup...")
    await db_manager.connect()
    _bot_task = asyncio.create_task(start_bot())

    try:
        yield
    finally:
        log.info("🔌 Application shutdown...")
        await shutdown_bot()
        if _bot_task is not None:
            await _bot_task
            _bot_task = None
        await db_manager.close()


app = FastAPI(lifespan=lifespan)


@app.get("/health")
async def health_check() -> dict[str, str]:
    """Simple health endpoint for platform readiness probes."""

    return {"status": "ok"}


if __name__ == "__main__":  # pragma: no cover - manual execution entrypoint
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
