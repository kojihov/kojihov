"""Inline keyboard definitions for Telegram interactions."""

from collections.abc import Sequence

from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup

from models.match import Match

from .callbacks import LeagueCallbackFactory, MatchCallbackFactory

# Dictionary of top leagues with their API identifiers
TOP_LEAGUES: dict[str, str] = {
    "🏴 Premier League": "4328",
    "🇪🇸 La Liga": "4335",
    "🇮🇹 Serie A": "4332",
    "🇩🇪 Bundesliga": "4331",
    "🇫🇷 Ligue 1": "4334",
}


def get_main_menu_keyboard() -> InlineKeyboardMarkup:
    """Return the inline keyboard for the main menu."""

    buttons = [[InlineKeyboardButton(text="⚽️ Топ Матчи", callback_data="show_leagues")]]
    return InlineKeyboardMarkup(inline_keyboard=buttons)


def get_leagues_keyboard() -> InlineKeyboardMarkup:
    """Return an inline keyboard for selecting a league."""

    buttons = [
        [
            InlineKeyboardButton(
                text=name,
                callback_data=LeagueCallbackFactory(
                    league_id=league_id, league_name=name
                ).pack(),
            )
        ]
        for name, league_id in TOP_LEAGUES.items()
    ]
    buttons.append(
        [InlineKeyboardButton(text="◀️ Назад в меню", callback_data="main_menu")]
    )
    return InlineKeyboardMarkup(inline_keyboard=buttons)


def _format_match_title(match: Match) -> str:
    """Format a match title for display in an inline button."""

    kickoff = match.kickoff_time.strftime("%d.%m %H:%M")
    title = f"{match.home_team} vs {match.away_team} · {kickoff}"
    if len(title) <= 60:
        return title
    return title[:57] + "…"


def get_matches_keyboard(
    matches: Sequence[Match], league_id: str, league_name: str
) -> InlineKeyboardMarkup:
    """Return an inline keyboard for selecting a specific match."""

    if not matches:
        return InlineKeyboardMarkup(
            inline_keyboard=[
                [InlineKeyboardButton(text="◀️ Назад к лигам", callback_data="show_leagues")],
                [InlineKeyboardButton(text="🏠 Главное меню", callback_data="main_menu")],
            ]
        )

    rows: list[list[InlineKeyboardButton]] = []
    for match in matches:
        rows.append(
            [
                InlineKeyboardButton(
                    text=_format_match_title(match),
                    callback_data=MatchCallbackFactory(
                        league_id=league_id,
                        league_name=league_name,
                        event_id=match.match_id,
                    ).pack(),
                )
            ]
        )

    rows.append(
        [
            InlineKeyboardButton(text="◀️ Назад к лигам", callback_data="show_leagues"),
            InlineKeyboardButton(text="🏠 Главное меню", callback_data="main_menu"),
        ]
    )
    return InlineKeyboardMarkup(inline_keyboard=rows)
