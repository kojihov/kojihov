"""Tests for Telegram bot command handlers."""

import asyncio
import os
import sys
import unittest
from unittest.mock import AsyncMock

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from bot.handlers.common import handle_start  # noqa: E402


class TestBotHandlers(unittest.TestCase):
    """Validate Telegram bot command handlers."""

    def test_start_command_handler(self) -> None:
        """The /start handler should reply with the welcome message."""
        print("\n--- Running Bot Handler Test ---")
        mock_message = AsyncMock()

        asyncio.run(handle_start(mock_message))

        mock_message.answer.assert_awaited_once()
        awaited_call = mock_message.answer.await_args
        self.assertIn("Добро пожаловать", awaited_call.args[0])
        self.assertIn("Манус", awaited_call.args[0])
        self.assertIn("Павел Сергеевич", awaited_call.args[0])
        print("✅ /start handler test passed.")


if __name__ == "__main__":
    unittest.main()
