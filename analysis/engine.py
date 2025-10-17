"""Core analysis engine orchestrating heuristics."""

from typing import Iterable, List

from core.logger import log
from models.match import Match

from analysis.models import HeuristicVerdict
from analysis.heuristics import (
    CurrentFormHeuristic,
    HistoryHeuristic,
    TeamStrengthHeuristic,
)
from analysis.heuristics.base import BaseHeuristic


class AnalysisEngine:
    """Runs a suite of heuristics against a match."""

    def __init__(self, db_manager, heuristics: Iterable[BaseHeuristic] | None = None) -> None:
        self.db_manager = db_manager
        self.heuristics: List[BaseHeuristic] = list(
            heuristics
            if heuristics is not None
            else (
                HistoryHeuristic(),
                CurrentFormHeuristic(),
                TeamStrengthHeuristic(),
            )
        )
        log.info("AnalysisEngine initialized with %d heuristics.", len(self.heuristics))

    async def run_analysis(self, match: Match) -> List[HeuristicVerdict]:
        """Execute each heuristic and return their verdicts."""

        log.info("Running analysis for match: %s vs %s", match.home_team, match.away_team)
        verdicts: List[HeuristicVerdict] = []

        for heuristic in self.heuristics:
            verdict = await heuristic.analyze(match, self.db_manager)
            verdicts.append(verdict)
            log.info(
                "Heuristic '%s' verdict: %s (Confidence: %.2f)",
                verdict.heuristic_name,
                verdict.predicted_outcome.value,
                verdict.confidence,
            )

        return verdicts
