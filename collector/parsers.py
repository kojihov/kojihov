from __future__ import annotations

from datetime import datetime
from typing import Optional

import httpx

from core.logger import log
from models.match import Match


API_KEY = "3"
API_URL_TEMPLATE = (
    "https://www.thesportsdb.com/api/v1/json/{api_key}/lookupevent.php?id={event_id}"
)
MATCHES_URL_TEMPLATE = (
    "https://www.thesportsdb.com/api/v1/json/{api_key}/eventsnextleague.php?id={league_id}"
)


def _parse_kickoff(
    date_str: Optional[str],
    time_str: Optional[str],
    timestamp: Optional[str],
) -> datetime:
    """Parse the kickoff date and time provided by TheSportsDB."""
    if timestamp:
        try:
            return datetime.fromisoformat(timestamp)
        except ValueError:
            log.debug("Failed to parse strTimestamp '%s'", timestamp)

    if not date_str:
        return datetime.utcnow()

    if time_str:
        for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M"):
            try:
                return datetime.strptime(f"{date_str} {time_str}", fmt)
            except ValueError:
                continue

    return datetime.strptime(date_str, "%Y-%m-%d")


async def fetch_factual_data(event_id: str) -> Optional[Match]:
    """Fetch and parse event data from TheSportsDB."""

    url = API_URL_TEMPLATE.format(api_key=API_KEY, event_id=event_id)
    log.info("Fetching real data for event_id %s from %s", event_id, url)

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=15.0)
        response.raise_for_status()
        payload = response.json()
    except httpx.HTTPStatusError as exc:
        log.error(
            "HTTP error occurred while fetching event %s: %s - %s",
            event_id,
            exc.response.status_code,
            exc.response.text,
        )
        return None
    except httpx.HTTPError as exc:  # pragma: no cover - network failures
        log.error("Network error while fetching event %s: %s", event_id, exc)
        return None
    except Exception as exc:  # pragma: no cover - unexpected parsing
        log.exception("Unexpected error while requesting event %s: %s", event_id, exc)
        return None

    events = payload.get("events") if isinstance(payload, dict) else None
    if not events:
        log.warning("No event data found for event_id: %s", event_id)
        return None

    event_data = events[0]

    kickoff_dt = _parse_kickoff(
        event_data.get("dateEvent"),
        event_data.get("strTime"),
        event_data.get("strTimestamp"),
    )

    home_score = event_data.get("intHomeScore")
    away_score = event_data.get("intAwayScore")
    score = None
    if home_score is not None and away_score is not None:
        score = f"{home_score}-{away_score}"

    match = Match(
        _id=f"thesportsdb_{event_data['idEvent']}",
        match_id=event_data["idEvent"],
        home_team=event_data.get("strHomeTeam", ""),
        away_team=event_data.get("strAwayTeam", ""),
        kickoff_time=kickoff_dt,
        score=score,
    )

    log.info(
        "✅ Successfully fetched and parsed data for: %s vs %s",
        match.home_team,
        match.away_team,
    )
    return match


async def fetch_matches_by_league(league_id: str, limit: int = 8) -> list[Match]:
    """Fetch upcoming matches for the given league.

    Parameters
    ----------
    league_id:
        Identifier of the league in TheSportsDB API.
    limit:
        Maximum number of matches to return. Set to ``0`` or a negative
        value to disable the limit.
    """

    url = MATCHES_URL_TEMPLATE.format(api_key=API_KEY, league_id=league_id)
    log.info("Fetching upcoming matches for league %s", league_id)

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=15.0)
        response.raise_for_status()
        payload = response.json()
    except httpx.HTTPStatusError as exc:
        log.error(
            "HTTP error occurred while fetching league %s: %s - %s",
            league_id,
            exc.response.status_code,
            exc.response.text,
        )
        return []
    except httpx.HTTPError as exc:  # pragma: no cover - network failures
        log.error("Network error while fetching league %s: %s", league_id, exc)
        return []
    except Exception as exc:  # pragma: no cover - unexpected parsing
        log.exception(
            "Unexpected error while requesting matches for league %s: %s",
            league_id,
            exc,
        )
        return []

    events = payload.get("events") if isinstance(payload, dict) else None
    if not events:
        log.warning("No upcoming matches found for league: %s", league_id)
        return []

    matches: list[Match] = []
    for event in events:
        event_id = event.get("idEvent")
        if not event_id:
            continue

        try:
            kickoff_dt = _parse_kickoff(
                event.get("dateEvent"),
                event.get("strTime"),
                event.get("strTimestamp"),
            )

            match = Match(
                _id=f"thesportsdb_{event_id}",
                match_id=event_id,
                home_team=event.get("strHomeTeam", ""),
                away_team=event.get("strAwayTeam", ""),
                kickoff_time=kickoff_dt,
            )
        except Exception as exc:  # pragma: no cover - defensive guard
            log.exception(
                "Failed to parse match %s for league %s: %s",
                event_id,
                league_id,
                exc,
            )
            continue

        matches.append(match)

    if not matches:
        log.warning("No parsable upcoming matches for league: %s", league_id)
        return []

    matches.sort(key=lambda match: match.kickoff_time)

    if limit > 0:
        matches = matches[:limit]

    log.info("Prepared %s upcoming matches for league %s", len(matches), league_id)
    return matches
