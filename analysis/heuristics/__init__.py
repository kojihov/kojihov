"""Collection of analysis heuristics."""

from .history import HistoryHeuristic
from .current_form import CurrentFormHeuristic
from .strength import TeamStrengthHeuristic

__all__ = [
    "HistoryHeuristic",
    "CurrentFormHeuristic",
    "TeamStrengthHeuristic",
]
