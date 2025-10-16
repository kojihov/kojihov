import asyncio
import os
import sys
import unittest
from unittest.mock import AsyncMock, Mock, patch

# Ensure project root is on the path when running the test module directly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from collector.scheduler import collect_and_store_match  # noqa: E402


class TestCollector(unittest.TestCase):
    """Tests for the data collector logic using mocked dependencies."""

    @patch("collector.scheduler.db_manager", new_callable=AsyncMock)
    @patch("collector.scheduler.fetch_factual_data", new_callable=AsyncMock)
    def test_collect_and_store_match_success(self, mock_fetch, mock_db_manager):
        """Collector should fetch match data and persist it using the mocked DB."""
        # --- 1. Setup mocks ---
        mock_match = Mock()
        mock_match.id = "thesportsdb_12345"
        mock_match.model_dump.return_value = {
            "_id": "thesportsdb_12345",
            "home_team": "Team A",
        }
        mock_fetch.return_value = mock_match

        mock_collection = AsyncMock()
        mock_db_manager.get_collection = Mock(return_value=mock_collection)

        # --- 2. Execute logic ---
        asyncio.run(collect_and_store_match("12345"))

        # --- 3. Assertions ---
        mock_fetch.assert_called_once_with("12345")
        mock_db_manager.get_collection.assert_called_once_with("matches")
        mock_collection.update_one.assert_called_once_with(
            {"_id": "thesportsdb_12345"},
            {"$set": {"_id": "thesportsdb_12345", "home_team": "Team A"}},
            upsert=True,
        )
        print("\n✅ test_collect_and_store_match_success: PASSED")


if __name__ == "__main__":
    unittest.main()
