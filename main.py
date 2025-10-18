import asyncio
import os
import time
from contextlib import asynccontextmanager, suppress
from threading import Thread

import requests
from fastapi import FastAPI

from bot.main import shutdown_bot, start_bot
from core.config import settings
from core.database import db_manager
from core.logger import log


def _keep_alive_loop(interval_seconds: int = 600) -> None:
    """Periodically ping the deployed service to keep the dyno awake."""

    while True:
        target = settings.WEB_APP_URL or os.getenv("RENDER_EXTERNAL_URL")
        if not target:
            log.warning("Keep-alive skipped: no WEB_APP_URL/RENDER_EXTERNAL_URL configured.")
        else:
            probe_url = target.rstrip("/") + "/health"
            try:
                response = requests.get(probe_url, timeout=10)
                response.raise_for_status()
                log.debug("Keep-alive ping succeeded for %s", probe_url)
            except requests.RequestException as exc:
                log.warning("Keep-alive ping failed for %s: %s", probe_url, exc)

        time.sleep(interval_seconds)


@asynccontextmanager
def lifespan(app: FastAPI):
    """Manage startup and shutdown for the unified web + bot service."""

    log.info("🚀 UNIFIED SERVICE: Application startup...")

    keep_alive_thread = Thread(target=_keep_alive_loop, daemon=True)
    keep_alive_thread.start()
    log.info("✅ Keep-alive thread started.")

    await db_manager.connect()

    bot_task = asyncio.create_task(start_bot())

    def _log_bot_result(task: asyncio.Task) -> None:
        try:
            exc = task.exception()
        except asyncio.CancelledError:
            return
        if exc:
            log.error("Bot polling task terminated with an exception.", exc_info=exc)
        else:
            log.info("Bot polling task finished gracefully.")

    bot_task.add_done_callback(_log_bot_result)
    log.info("✅ Bot polling started in the background.")

    try:
        yield
    finally:
        log.info("🔌 UNIFIED SERVICE: Application shutdown...")
        await shutdown_bot()
        if not bot_task.done():
            bot_task.cancel()
            with suppress(asyncio.CancelledError):
                await bot_task
        await db_manager.close()
        log.info("Shutdown complete.")


app = FastAPI(lifespan=lifespan)


@app.get("/health")
async def health_check() -> dict[str, str]:
    """Simple health endpoint for Render probes."""

    return {"status": "ok"}
