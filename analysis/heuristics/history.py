"""Historical performance heuristic."""

from analysis.models import HeuristicVerdict, Outcome
from models.match import Match

from .base import BaseHeuristic


class HistoryHeuristic(BaseHeuristic):
    """Naive heuristic that checks historical dominance cues."""

    @property
    def name(self) -> str:
        return "Historical Head-to-Head"

    async def analyze(self, match: Match, db_manager) -> HeuristicVerdict:
        """Return a verdict based on simple historical assumptions."""

        if "Liverpool" in match.home_team:
            return HeuristicVerdict(
                heuristic_name=self.name,
                predicted_outcome=Outcome.HOME_WIN,
                confidence=0.7,
                reasoning=(
                    "Liverpool has historically dominated at home in this fixture."
                ),
            )

        return HeuristicVerdict(
            heuristic_name=self.name,
            predicted_outcome=Outcome.UNDEFINED,
            confidence=0.0,
            reasoning="Historical data insufficient for a prediction.",
        )
