"""Handlers powering interactive match selection flows."""

from aiogram import F, Router
from aiogram.types import CallbackQuery

from bot.callbacks import LeagueCallbackFactory
from bot.keyboards import get_leagues_keyboard

router = Router()


@router.callback_query(F.data == "show_leagues")
async def cq_show_leagues(callback: CallbackQuery) -> None:
    """Show the league selection keyboard when requested."""

    await callback.message.edit_text(
        "Выберите лигу для просмотра матчей:",
        reply_markup=get_leagues_keyboard(),
    )
    await callback.answer()


@router.callback_query(LeagueCallbackFactory.filter())
async def cq_show_matches_for_league(
    callback: CallbackQuery, callback_data: LeagueCallbackFactory
) -> None:
    """Placeholder handler that acknowledges league selection."""

    await callback.message.edit_text(
        f"⏳ Загрузка матчей для: {callback_data.league_name}..."
    )
    await callback.answer(
        text=f"Выбрана лига ID: {callback_data.league_id}", show_alert=False
    )
