"""Handlers powering interactive match selection flows."""

from __future__ import annotations

from aiogram import F, Router
from aiogram.types import CallbackQuery

from bot.callbacks import LeagueCallbackFactory, MatchCallbackFactory
from bot.keyboards import (
    get_leagues_keyboard,
    get_matches_keyboard,
)
from collector.parsers import fetch_factual_data, fetch_matches_by_league
from core.logger import log

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
    """Fetch matches for the selected league and present them as buttons."""

    league_name = callback_data.league_name
    await callback.message.edit_text(
        f"⏳ Загружаю матчи для: {league_name}...",
    )

    matches = await fetch_matches_by_league(callback_data.league_id)
    if not matches:
        log.info("No matches available for league %s", callback_data.league_id)
        await callback.message.edit_text(
            (
                "Матчи для выбранной лиги сейчас недоступны.\n"
                "Попробуйте выбрать другую лигу."
            ),
            reply_markup=get_leagues_keyboard(),
        )
        await callback.answer("Нет доступных матчей", show_alert=False)
        return

    await callback.message.edit_text(
        f"Выберите матч лиги {league_name}:",
        reply_markup=get_matches_keyboard(
            matches, callback_data.league_id, league_name
        ),
    )
    await callback.answer()


@router.callback_query(MatchCallbackFactory.filter())
async def cq_show_match_details(
    callback: CallbackQuery, callback_data: MatchCallbackFactory
) -> None:
    """Display details for the selected match."""

    match = await fetch_factual_data(callback_data.event_id)
    if not match:
        await callback.answer(
            "Не удалось загрузить данные матча. Попробуйте позже.",
            show_alert=True,
        )
        return

    kickoff_text = match.kickoff_time.strftime("%d.%m.%Y %H:%M UTC")
    score_line = (
        f"Счёт: {match.score}" if match.score is not None else "Счёт недоступен."
    )

    message_lines = [
        f"**{match.home_team} — {match.away_team}**",
        f"Начало: {kickoff_text}",
        score_line,
        "",
        "Выберите другой матч или вернитесь к списку лиг.",
    ]

    matches = await fetch_matches_by_league(
        callback_data.league_id
    )

    reply_markup = get_matches_keyboard(
        matches, callback_data.league_id, callback_data.league_name
    )

    await callback.message.edit_text(
        "\n".join(message_lines),
        reply_markup=reply_markup,
        parse_mode="Markdown",
    )
    await callback.answer()
