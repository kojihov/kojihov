"""Callback data factories for inline interactions."""

from aiogram.filters.callback_data import CallbackData


class LeagueCallbackFactory(CallbackData, prefix="league"):
    """Structured callback data for selecting a league."""

    league_id: str
    league_name: str


class MatchCallbackFactory(CallbackData, prefix="match"):
    """Callback data for selecting a concrete match within a league."""

    league_id: str
    league_name: str
    event_id: str
