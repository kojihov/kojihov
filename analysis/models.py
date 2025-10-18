"""Data structures used by the analysis engine."""

from enum import Enum

from pydantic import BaseModel, Field


class Outcome(str, Enum):
    """Possible predicted outcomes for a football match."""

    HOME_WIN = "Home Win"
    AWAY_WIN = "Away Win"
    DRAW = "Draw"
    UNDEFINED = "Undefined"


class HeuristicVerdict(BaseModel):
    """Verdict returned by an analysis heuristic."""

    heuristic_name: str = Field(..., description="Name of the heuristic producing the verdict.")
    predicted_outcome: Outcome = Field(..., description="Outcome predicted by the heuristic.")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence level for the prediction.")
    reasoning: str = Field(..., description="Short explanation describing the decision.")
