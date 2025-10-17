"""Abstract base class for analysis heuristics."""

from abc import ABC, abstractmethod

from models.match import Match

from analysis.models import HeuristicVerdict


class BaseHeuristic(ABC):
    """Interface for heuristics plugged into the analysis engine."""

    @property
    @abstractmethod
    def name(self) -> str:
        """Human readable heuristic name."""

    @abstractmethod
    async def analyze(self, match: Match, db_manager) -> HeuristicVerdict:
        """Run the heuristic against the supplied match."""
