import asyncio
import os
import sys
import unittest
from datetime import datetime
from unittest.mock import AsyncMock

# Ensure project root on path when executing tests directly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from analysis.engine import AnalysisEngine  # noqa: E402
from analysis.heuristics.strength import TeamStrengthHeuristic  # noqa: E402
from analysis.models import Outcome  # noqa: E402
from models.match import Match  # noqa: E402


class TestAnalysisEngine(unittest.TestCase):
    """Unit tests for the AnalysisEngine and heuristics."""

    def test_engine_run(self):
        """The engine should execute each heuristic and aggregate their verdicts."""
        print("\n--- Running Analysis Engine Test ---")

        mock_db_manager = AsyncMock()
        engine = AnalysisEngine(mock_db_manager)

        sample_match = Match(
            _id="test_1",
            match_id="test_1",
            home_team="Liverpool FC",
            away_team="Swansea City",
            kickoff_time=datetime.utcnow(),
            score="3-1",
        )

        verdicts = asyncio.run(engine.run_analysis(sample_match))

        self.assertEqual(len(verdicts), 3)

        verdict_map = {verdict.heuristic_name: verdict for verdict in verdicts}

        history_verdict = verdict_map.get("Historical Head-to-Head")
        self.assertIsNotNone(history_verdict)
        self.assertEqual(history_verdict.predicted_outcome, Outcome.HOME_WIN)
        self.assertGreater(history_verdict.confidence, 0.6)

        current_form_verdict = verdict_map.get("Current Form Snapshot")
        self.assertIsNotNone(current_form_verdict)
        self.assertEqual(current_form_verdict.predicted_outcome, Outcome.HOME_WIN)
        self.assertGreaterEqual(current_form_verdict.confidence, 0.6)

        strength_verdict = verdict_map.get("Team Strength Comparison")
        self.assertIsNotNone(strength_verdict)
        self.assertEqual(strength_verdict.predicted_outcome, Outcome.HOME_WIN)
        self.assertGreater(strength_verdict.confidence, 0.7)

        print("✅ AnalysisEngine test passed.")

    def test_strength_heuristic(self):
        """The TeamStrengthHeuristic should react to rating differentials."""
        print("\n--- Running Strength Heuristic Test ---")

        heuristic = TeamStrengthHeuristic()

        match1 = Match(
            _id="t1",
            match_id="t1",
            home_team="Liverpool",
            away_team="Luton Town",
            kickoff_time=datetime.utcnow(),
        )
        verdict1 = asyncio.run(heuristic.analyze(match1, None))
        self.assertEqual(verdict1.predicted_outcome, Outcome.HOME_WIN)
        self.assertGreater(verdict1.confidence, 0.8)

        match2 = Match(
            _id="t2",
            match_id="t2",
            home_team="Swansea",
            away_team="Some Other Team",
            kickoff_time=datetime.utcnow(),
        )
        verdict2 = asyncio.run(heuristic.analyze(match2, None))
        self.assertEqual(verdict2.predicted_outcome, Outcome.DRAW)
        self.assertAlmostEqual(verdict2.confidence, 0.4)

        print("✅ Strength Heuristic test passed.")


if __name__ == "__main__":
    unittest.main()
