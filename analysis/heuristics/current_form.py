"""Current form heuristic using recent scoreline as proxy."""

from analysis.models import HeuristicVerdict, Outcome
from models.match import Match

from .base import BaseHeuristic


class CurrentFormHeuristic(BaseHeuristic):
    """Infers advantage based on the latest reported score."""

    @property
    def name(self) -> str:
        return "Current Form Snapshot"

    async def analyze(self, match: Match, db_manager) -> HeuristicVerdict:
        """Use the current score as a lightweight representation of form."""

        if not match.score:
            return HeuristicVerdict(
                heuristic_name=self.name,
                predicted_outcome=Outcome.UNDEFINED,
                confidence=0.1,
                reasoning="No recent score data available to assess current form.",
            )

        try:
            home_score_str, away_score_str = match.score.split("-")
            home_score = int(home_score_str.strip())
            away_score = int(away_score_str.strip())
        except (ValueError, AttributeError):
            return HeuristicVerdict(
                heuristic_name=self.name,
                predicted_outcome=Outcome.UNDEFINED,
                confidence=0.1,
                reasoning="Unable to parse score for current form analysis.",
            )

        if home_score > away_score:
            outcome = Outcome.HOME_WIN
            reasoning = (
                f"Home side leads {home_score}-{away_score}, indicating stronger current form."
            )
        elif away_score > home_score:
            outcome = Outcome.AWAY_WIN
            reasoning = (
                f"Away side leads {away_score}-{home_score}, indicating stronger current form."
            )
        else:
            outcome = Outcome.DRAW
            reasoning = "Teams are level, suggesting evenly matched current form."

        confidence = 0.6 if outcome != Outcome.DRAW else 0.5

        return HeuristicVerdict(
            heuristic_name=self.name,
            predicted_outcome=outcome,
            confidence=confidence,
            reasoning=reasoning,
        )
