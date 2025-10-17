"""Inline keyboard definitions for Telegram interactions."""

from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup

from .callbacks import LeagueCallbackFactory

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
