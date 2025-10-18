"""End-to-end tests reflecting the Prometheus v3.0 protocol."""

from __future__ import annotations

import asyncio
import os
import sys
import unittest
from datetime import datetime
from unittest.mock import AsyncMock

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from aiogram.filters import CommandObject  # noqa: E402
from analysis.engine import AnalysisEngine  # noqa: E402
from analysis.verifier import verifier  # noqa: E402
from bot.handlers.common import handle_result  # noqa: E402
from collector.parsers import fetch_factual_data  # noqa: E402
from core.database import db_manager  # noqa: E402
from models.match import MatchAnalysis  # noqa: E402


class TestE2EFlow(unittest.TestCase):
    """Run integration scenarios using shared event loop helpers."""

    @classmethod
    def setUpClass(cls) -> None:
        cls.loop = asyncio.new_event_loop()
        asyncio.set_event_loop(cls.loop)
        cls.loop.run_until_complete(db_manager.connect())
        if db_manager.using_mock:
            print("# Anomaly: MongoDB unavailable. Using in-memory mock for tests.")

    @classmethod
    def tearDownClass(cls) -> None:
        cls.loop.run_until_complete(db_manager.close())
        cls.loop.close()
        asyncio.set_event_loop(None)

    def run_async_test(self, coro: asyncio.Future) -> None:
        """Helper to execute async coroutines inside unittest methods."""
        return self.loop.run_until_complete(coro)

    def test_01_full_cycle_with_db(self) -> None:
        """Runs the full analysis cycle and database persistence test."""
        print("\n# Intent: Verify the full analysis cycle from data fetch to DB persistence.")
        print("# Action: Executing test_01_full_cycle_with_db.")
        self.run_async_test(self._test_full_cycle_with_db())

    async def _test_full_cycle_with_db(self) -> None:
        analyses_collection = db_manager.db["analyses"]
        await analyses_collection.delete_many({})

        analysis_engine = AnalysisEngine(db_manager)
        match_data = await fetch_factual_data("441613")
        self.assertIsNotNone(match_data, "Failed to fetch match data from API")

        verdicts = await analysis_engine.run_analysis(match_data)
        self.assertGreaterEqual(len(verdicts), 3)

        final_verdict = verifier.calculate_final_verdict(verdicts)

        analysis_doc = MatchAnalysis(
            match_id=match_data.match_id,
            analyzed_at=datetime.utcnow(),
            final_outcome=final_verdict["final_outcome"],
            final_confidence=final_verdict["final_confidence"],
            verdicts=verdicts,
        )

        await analyses_collection.insert_one(analysis_doc.model_dump(by_alias=True))
        saved_doc = await analyses_collection.find_one({"_id": match_data.match_id})

        self.assertIsNotNone(saved_doc)
        self.assertEqual(saved_doc["final_outcome"], final_verdict["final_outcome"].value)
        self.assertGreater(saved_doc["final_confidence"], 0.0)
        self.assertEqual(len(saved_doc["verdicts"]), len(verdicts))

        print("# Outcome: SUCCESS. Data fetched, analyzed, and verified in the database.")

    def test_02_feedback_loop(self) -> None:
        """Runs the feedback loop test."""
        print("\n# Intent: Verify the feedback loop mechanism (/result command).")
        print("# Action: Executing test_02_feedback_loop.")
        self.run_async_test(self._test_feedback_loop())

    async def _test_feedback_loop(self) -> None:
        analyses_collection = db_manager.db["analyses"]
        await analyses_collection.delete_many({})

        mock_analysis = {
            "_id": "feedback_test_1",
            "analyzed_at": datetime.utcnow(),
            "final_outcome": "Home Win",
            "final_confidence": 0.8,
            "verdicts": [],
        }
        await analyses_collection.insert_one(mock_analysis)

        mock_message = AsyncMock()
        command = CommandObject(
            command="result",
            prefix="/",
            args="feedback_test_1 3-1",
        )

        await handle_result(mock_message, command, db_manager)

        updated_doc = await analyses_collection.find_one({"_id": "feedback_test_1"})
        self.assertIsNotNone(updated_doc)
        self.assertTrue(updated_doc["is_prediction_correct"])

        mock_message.answer.assert_awaited_once()
        response_text = mock_message.answer.await_args.args[0]
        self.assertIn("Прогноз оказался **верным**", response_text)

        print("# Outcome: SUCCESS. Feedback registered and database document updated correctly.")


if __name__ == "__main__":
    unittest.main()
