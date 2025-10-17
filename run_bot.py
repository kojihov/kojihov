import asyncio
from core.database import db_manager
from core.logger import log
from bot.main import start_bot, shutdown_bot


async def main():
    """
    The main entry point for the application.
    Connects to the database and starts the bot.
    """
    log.info("🚀 Application startup...")
    await db_manager.connect()

    try:
        await start_bot()
    finally:
        await shutdown_bot()
        await db_manager.close()
        log.info("🛑 Application shutdown complete.")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        log.info("Application interrupted by user. Shutting down...")
