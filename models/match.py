"""Pydantic models describing football matches and analyses."""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from analysis.models import HeuristicVerdict, Outcome


class MatchEvent(BaseModel):
    minute: int
    event_type: str  # e.g., "goal", "yellow_card"
    player_name: Optional[str] = None
    team: str


class Match(BaseModel):
    id: str = Field(..., alias="_id")
    match_id: str
    home_team: str
    away_team: str
    kickoff_time: datetime
    score: Optional[str] = None
    events: list[MatchEvent] = Field(default_factory=list)
    fetched_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "_id": "flashscore_12345",
                "match_id": "12345",
                "home_team": "Stuttgart",
                "away_team": "St. Pauli",
                "kickoff_time": "2025-09-19T18:30:00Z",
                "score": "2-0",
                "events": [
                    {
                        "minute": 34,
                        "event_type": "goal",
                        "player_name": "Guirassy",
                        "team": "Stuttgart",
                    }
                ],
            }
        }


class MatchAnalysis(BaseModel):
    """Persisted record of an analysis run for a specific match."""

    match_id: str = Field(..., alias="_id")
    analyzed_at: datetime = Field(..., description="Timestamp of the analysis execution.")
    final_outcome: Outcome = Field(..., description="Weighted final outcome selected by the verifier.")
    final_confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score of the final outcome.")
    verdicts: List[HeuristicVerdict] = Field(
        default_factory=list,
        description="Individual heuristic verdicts contributing to the final decision.",
    )
    is_prediction_correct: Optional[bool] = Field(
        default=None,
        description="Indicator showing whether the final prediction matched the real outcome.",
    )

    class Config:
        populate_by_name = True
