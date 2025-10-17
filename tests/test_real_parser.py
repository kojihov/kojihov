import os
import sys
import unittest

# Ensure project root is on the path when running the test module directly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from collector.parsers import fetch_factual_data  # noqa: E402


class TestRealParser(unittest.IsolatedAsyncioTestCase):
    """Integration tests for the real TheSportsDB parser."""

    async def test_fetch_real_event(self):
        event_id = "441613"
        match = await fetch_factual_data(event_id)
        if match is None:
            self.skipTest("No data returned from TheSportsDB (possible network restriction).")

        self.assertEqual(match.match_id, event_id)
        self.assertEqual(match.home_team, "Liverpool")
        self.assertEqual(match.away_team, "Swansea")
        self.assertEqual(match.score, "4-1")


if __name__ == "__main__":
    unittest.main()
