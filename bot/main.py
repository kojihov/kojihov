"""Telegram bot bootstrap utilities."""

from __future__ import annotations

from typing import Optional

from aiogram import BaseMiddleware, Bot, Dispatcher
from aiogram.enums import ParseMode

from analysis.engine import AnalysisEngine
from core.config import settings
from core.database import db_manager
from core.logger import log
from .handlers import common

_bot: Optional[Bot] = None
_dispatcher: Optional[Dispatcher] = None


class AnalysisEngineMiddleware(BaseMiddleware):
    """Inject the analysis engine into handler data."""

    def __init__(self, analysis_engine: AnalysisEngine) -> None:
        self.analysis_engine = analysis_engine

    async def __call__(self, handler, event, data):  # type: ignore[override]
        data.setdefault("analysis_engine", self.analysis_engine)
        return await handler(event, data)


class DatabaseMiddleware(BaseMiddleware):
    """Inject the database manager into handler data."""

    def __init__(self) -> None:
        self.db_manager = db_manager

    async def __call__(self, handler, event, data):  # type: ignore[override]
        data.setdefault("db_manager", self.db_manager)
        return await handler(event, data)


async def start_bot() -> None:
    """Initialise and start the Telegram bot polling."""

    global _bot, _dispatcher

    if _bot is not None:
        log.warning("Bot is already running; start request ignored.")
        return

    _bot = Bot(token=settings.BOT_TOKEN, parse_mode=ParseMode.MARKDOWN)
    _dispatcher = Dispatcher()

    analysis_engine = AnalysisEngine(db_manager)
    _dispatcher["analysis_engine"] = analysis_engine
    _dispatcher["db_manager"] = db_manager
    _dispatcher.message.middleware(AnalysisEngineMiddleware(analysis_engine))
    _dispatcher.message.middleware(DatabaseMiddleware())

    log.info("Configuring bot routers...")
    _dispatcher.include_router(common.router)

    log.info("Starting bot polling...")
    try:
        await _dispatcher.start_polling(
            _bot, allowed_updates=_dispatcher.resolve_used_update_types()
        )
    finally:
        log.info("Bot polling stopped.")


async def shutdown_bot() -> None:
    """Stop bot polling and release network resources."""

    global _bot, _dispatcher

    if _dispatcher is not None:
        _dispatcher.stop_polling()
    if _bot is not None:
        await _bot.session.close()

    _dispatcher = None
    _bot = None
