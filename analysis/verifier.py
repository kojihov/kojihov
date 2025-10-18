"""Weighted consensus verifier for heuristic verdicts."""

from __future__ import annotations

from collections import defaultdict
from typing import DefaultDict, Dict, List

from analysis.models import HeuristicVerdict, Outcome
from core.logger import log

HEURISTIC_WEIGHTS: Dict[str, float] = {
    "Historical Head-to-Head": 0.20,
    "Current Form Snapshot": 0.30,
    "Team Strength Comparison": 0.50,
}
DEFAULT_WEIGHT: float = 0.1


class Verifier:
    """Combine heuristic verdicts into a single weighted outcome."""

    def calculate_final_verdict(
        self, verdicts: List[HeuristicVerdict]
    ) -> Dict[str, object]:
        """Return the weighted consensus across supplied heuristic verdicts."""

        log.info("Verifier starting final verdict calculation...")
        scores: DefaultDict[Outcome, float] = defaultdict(float)

        for verdict in verdicts:
            weight = HEURISTIC_WEIGHTS.get(verdict.heuristic_name, DEFAULT_WEIGHT)
            contribution = verdict.confidence * weight
            scores[verdict.predicted_outcome] += contribution
            log.info(
                "  - Verdict '%s' gets score %.2f from '%s'",
                verdict.predicted_outcome.value,
                contribution,
                verdict.heuristic_name,
            )

        if not scores:
            return {
                "final_outcome": Outcome.UNDEFINED,
                "final_confidence": 0.0,
                "reason": "No verdicts to process.",
            }

        best_outcome = max(scores, key=scores.get)
        total_weight = sum(
            HEURISTIC_WEIGHTS.get(verdict.heuristic_name, DEFAULT_WEIGHT)
            for verdict in verdicts
        )
        final_confidence = scores[best_outcome] / total_weight if total_weight else 0.0

        log.info(
            "Final verdict is '%s' with confidence %.2f",
            best_outcome.value,
            final_confidence,
        )

        return {
            "final_outcome": best_outcome,
            "final_confidence": final_confidence,
            "reason": f"Weighted consensus from {len(verdicts)} heuristics.",
        }


verifier = Verifier()

__all__ = ["Verifier", "verifier"]
