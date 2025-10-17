import asyncio
import os
import sys
import types
import unittest
from unittest.mock import AsyncMock, Mock, patch

try:  # pragma: no cover - compatibility shim for the test environment
    import httpx  # type: ignore  # noqa: F401
except ModuleNotFoundError:  # pragma: no cover
    sys.modules["httpx"] = types.SimpleNamespace(
        AsyncClient=object,
        HTTPStatusError=Exception,
        HTTPError=Exception,
    )

# Ensure project root is on the path when running the test module directly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from collector.parsers import fetch_matches_by_league  # noqa: E402
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


class TestFetchMatchesByLeague(unittest.IsolatedAsyncioTestCase):
    """Tests for fetching league matches without hitting the network."""

    @patch("collector.parsers.httpx.AsyncClient")
    async def test_fetch_matches_by_league_orders_and_limits(
        self, mock_async_client
    ):
        """The helper should sort matches chronologically and respect the limit."""

        response_payload = {
            "events": [
                {
                    "idEvent": "SECOND",
                    "strHomeTeam": "Team B",
                    "strAwayTeam": "Team C",
                    "dateEvent": "2025-05-02",
                    "strTime": "19:30:00",
                },
                {
                    "idEvent": "FIRST",
                    "strHomeTeam": "Team A",
                    "strAwayTeam": "Team D",
                    "dateEvent": "2025-05-01",
                    "strTime": "18:00:00",
                },
            ]
        }

        mock_client = AsyncMock()
        mock_client.__aenter__.return_value = mock_client
        mock_client.__aexit__.return_value = False
        mock_client.get = AsyncMock()

        mock_response = Mock()
        mock_response.raise_for_status = Mock()
        mock_response.json.return_value = response_payload
        mock_client.get.return_value = mock_response
        mock_async_client.return_value = mock_client

        matches = await fetch_matches_by_league("1234", limit=1)

        self.assertEqual(len(matches), 1)
        self.assertEqual(matches[0].match_id, "FIRST")
        print("\n✅ test_fetch_matches_by_league_orders_and_limits: PASSED")


if __name__ == "__main__":
    unittest.main()
