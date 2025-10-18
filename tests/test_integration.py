"""Integration-adjacent tests for bot middleware wiring."""

import os
import sys
import unittest
from unittest.mock import AsyncMock, Mock, patch

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import bot.main as bot_main  # noqa: E402
from bot.main import AnalysisEngineMiddleware, DatabaseMiddleware, start_bot  # noqa: E402


class TestBotIntegration(unittest.IsolatedAsyncioTestCase):
    """Ensure the bot bootstrap wires analysis engine middleware correctly."""

    async def test_middleware_injects_engine(self) -> None:
        handler = AsyncMock()
        middleware = AnalysisEngineMiddleware(analysis_engine="engine")

        data = {}
        await middleware(handler, event=None, data=data)

        handler.assert_awaited_once()
        self.assertEqual(data["analysis_engine"], "engine")

    async def test_start_bot_registers_middleware(self) -> None:
        async def fake_start_polling(bot, *args, **kwargs):
            self.assertIsNotNone(bot)

        with patch("bot.main.Dispatcher") as mock_dispatcher_cls, patch(
            "bot.main.Bot"
        ) as mock_bot_cls, patch("bot.main.AnalysisEngine") as mock_engine_cls, patch(
            "bot.main.db_manager"
        ) as mock_db_manager:
            mock_dispatcher = mock_dispatcher_cls.return_value
            mock_dispatcher.start_polling = AsyncMock(side_effect=fake_start_polling)
            mock_dispatcher.message.middleware = Mock()
            mock_engine = mock_engine_cls.return_value

            mock_bot = mock_bot_cls.return_value
            mock_bot.session.close = AsyncMock()

            await start_bot()

            self.assertEqual(mock_dispatcher.message.middleware.call_count, 2)
            middleware_calls = mock_dispatcher.message.middleware.call_args_list
            self.assertIsInstance(middleware_calls[0][0][0], AnalysisEngineMiddleware)
            self.assertIsInstance(middleware_calls[1][0][0], DatabaseMiddleware)

            setitem_calls = mock_dispatcher.__setitem__.call_args_list
            self.assertEqual(setitem_calls[0][0], ("analysis_engine", mock_engine))
            self.assertEqual(setitem_calls[1][0][0], "db_manager")
            self.assertIs(setitem_calls[1][0][1], mock_db_manager)
            mock_dispatcher.start_polling.assert_awaited_once()

        await bot_main.shutdown_bot()


if __name__ == "__main__":
    unittest.main()
