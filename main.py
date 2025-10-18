import asyncio
from contextlib import asynccontextmanager, suppress
from fastapi import FastAPI

from bot.main import shutdown_bot, start_bot
from core.database import db_manager
from core.logger import log


@asynccontextmanager
def lifespan(app: FastAPI):
    """Manage startup and shutdown for the unified web + bot service."""

    log.info("🚀 UNIFIED SERVICE: Application startup...")
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
