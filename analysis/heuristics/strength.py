"""Team strength heuristic comparing predefined ratings."""

from analysis.models import HeuristicVerdict, Outcome
from models.match import Match

from .base import BaseHeuristic

# Mock "database" of team strengths
TEAM_STRENGTHS = {
    "Liverpool": 90,
    "Swansea": 75,
    "Manchester City": 95,
    "Luton Town": 60,
}


class TeamStrengthHeuristic(BaseHeuristic):
    """Estimate match outcome based on relative team strength ratings."""

    @property
    def name(self) -> str:
        return "Team Strength Comparison"

    async def analyze(self, match: Match, db_manager) -> HeuristicVerdict:
        """Compare rating differentials to infer a likely result."""

        home_strength = next(
            (value for key, value in TEAM_STRENGTHS.items() if key in match.home_team),
            65,
        )
        away_strength = next(
            (value for key, value in TEAM_STRENGTHS.items() if key in match.away_team),
            65,
        )

        diff = home_strength - away_strength

        if diff > 10:
            return HeuristicVerdict(
                heuristic_name=self.name,
                predicted_outcome=Outcome.HOME_WIN,
                confidence=min(0.5 + (diff / 50), 0.9),
                reasoning=(
                    "Home team is significantly stronger "
                    f"(Strength {home_strength} vs {away_strength})."
                ),
            )

        if diff < -10:
            return HeuristicVerdict(
                heuristic_name=self.name,
                predicted_outcome=Outcome.AWAY_WIN,
                confidence=min(0.5 + (abs(diff) / 50), 0.9),
                reasoning=(
                    "Away team is significantly stronger "
                    f"(Strength {away_strength} vs {home_strength})."
                ),
            )

        return HeuristicVerdict(
            heuristic_name=self.name,
            predicted_outcome=Outcome.DRAW,
            confidence=0.4,
            reasoning=(
                "Teams are of comparable strength "
                f"(Strength {home_strength} vs {away_strength})."
            ),
        )
