"""Common Telegram bot command handlers."""

from __future__ import annotations

from datetime import datetime
from typing import Optional, Tuple

from aiogram import F, Router
from aiogram.filters import Command, CommandObject
from aiogram.types import Message

from analysis.engine import AnalysisEngine
from analysis.models import Outcome
from analysis.verifier import verifier
from collector.parsers import fetch_factual_data
from core.config import settings
from models.match import MatchAnalysis

router = Router()


def parse_score(score: str) -> Optional[Tuple[int, int]]:
    """Parse a score string in the format 'X-Y' into integer components."""

    try:
        home, away = map(int, score.split("-"))
    except (AttributeError, ValueError):
        return None
    return home, away


@router.message(Command(commands=["start"]))
async def handle_start(message: Message) -> None:
    """Handle the /start command."""
    start_message = (
        "Добро пожаловать в 'Manus Analytics'!\n\n"
        "Я — аналитическая система для предсказания исходов спортивных событий.\n"
        "Архитектор: **Манус**\nСтратег: **Павел Сергеевич**"
    )
    await message.answer(start_message)


@router.message(Command(commands=["analyze"]), F.from_user.id == settings.ADMIN_USER_ID)
async def handle_analyze(
    message: Message,
    command: CommandObject,
    analysis_engine: AnalysisEngine,
) -> None:
    """Handle the /analyze command and run the full analysis workflow."""

    if not command.args:
        await message.answer(
            "Пожалуйста, укажите ID матча. Пример: `/analyze 441613`",
            parse_mode="Markdown",
        )
        return

    match_id = command.args.strip()
    await message.answer(
        f"Начинаю анализ для матча ID: `{match_id}`...",
        parse_mode="Markdown",
    )

    match_data = await fetch_factual_data(match_id)
    if not match_data:
        await message.answer(
            f"Не удалось получить данные для матча ID: `{match_id}`.",
            parse_mode="Markdown",
        )
        return

    verdicts = await analysis_engine.run_analysis(match_data)

    final_verdict = verifier.calculate_final_verdict(verdicts)

    if not getattr(analysis_engine.db_manager, "db", None):
        await message.answer(
            "Ошибка подключения к базе данных. Анализ не сохранён.",
            parse_mode="Markdown",
        )
        return

    analysis_doc = MatchAnalysis(
        match_id=match_data.match_id,
        analyzed_at=datetime.utcnow(),
        final_outcome=final_verdict["final_outcome"],
        final_confidence=final_verdict["final_confidence"],
        verdicts=verdicts,
    )

    await analysis_engine.db_manager.db["analyses"].insert_one(
        analysis_doc.model_dump(by_alias=True)
    )

    response_lines = [
        f"**Итоговый вердикт для матча {match_data.home_team} - {match_data.away_team}:**",
        "",
        f"🔥 **Прогноз:** {final_verdict['final_outcome'].value}",
        f"🎯 **Уверенность:** {final_verdict['final_confidence']:.0%}",
        "",
        "--- Детализация по методикам ---",
        "",
    ]

    for verdict in verdicts:
        response_lines.append(
            f"🔹 **{verdict.heuristic_name}:** {verdict.predicted_outcome.value} ({verdict.confidence:.0%})"
        )

    await message.answer("\n".join(response_lines), parse_mode="Markdown")


@router.message(Command(commands=["result"]), F.from_user.id == settings.ADMIN_USER_ID)
async def handle_result(
    message: Message,
    command: CommandObject,
    db_manager,
) -> None:
    """Handle the /result command to register the real match outcome."""

    if not command.args or len(command.args.split()) != 2:
        await message.answer(
            "Неверный формат. Пример: `/result 441613 2-0`",
            parse_mode="Markdown",
        )
        return

    match_id, score_str = command.args.split()
    score = parse_score(score_str)
    if score is None:
        await message.answer(
            "Неверный формат счёта. Используйте формат `X-Y`.",
            parse_mode="Markdown",
        )
        return

    home_score, away_score = score

    analysis_doc = await db_manager.db["analyses"].find_one({"_id": match_id})
    if not analysis_doc:
        await message.answer(
            f"Анализ для матча ID `{match_id}` не найден.",
            parse_mode="Markdown",
        )
        return

    if home_score > away_score:
        real_outcome = Outcome.HOME_WIN
    elif away_score > home_score:
        real_outcome = Outcome.AWAY_WIN
    else:
        real_outcome = Outcome.DRAW

    predicted_outcome = Outcome(analysis_doc["final_outcome"])
    is_correct = predicted_outcome == real_outcome

    await db_manager.db["analyses"].update_one(
        {"_id": match_id},
        {"$set": {"is_prediction_correct": is_correct}},
    )

    result_lines = [
        "✅ Результат зарегистрирован.",
        f"Прогноз был: **{predicted_outcome.value}**.",
        f"Реальный исход: **{real_outcome.value}**.",
        "Прогноз оказался **верным**." if is_correct else "Прогноз оказался **неверным**.",
    ]

    await message.answer("\n".join(result_lines), parse_mode="Markdown")
