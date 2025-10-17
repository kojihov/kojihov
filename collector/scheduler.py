import asyncio

from core.database import db_manager
from core.logger import log
from models.match import Match
from .parsers import fetch_factual_data


async def collect_and_store_match(match_id: str):
    """
    Orchestrates fetching data for a single match and storing it in the database.
    """
    try:
        log.info("Starting collection task for match_id: %s", match_id)
        match_data: Match | None = await fetch_factual_data(match_id)

        if match_data is None:
            log.warning(
                "Skipping storage for match_id: %s as no data was fetched.",
                match_id,
            )
            return

        matches_collection = db_manager.get_collection("matches")

        await matches_collection.update_one(
            {"_id": match_data.id},
            {"$set": match_data.model_dump(by_alias=True)},
            upsert=True,
        )
        log.info(
            "✅ Successfully stored data for match_id: %s in the database.",
            match_id,
        )

    except Exception as e:
        log.exception(
            "Failed to collect and store data for match_id: %s. Error: %s",
            match_id,
            e,
        )


async def run_collector_once():
    """
    A single run of the collector for testing purposes.
    In the future, this will be a long-running process.
    """
    log.info("--- Starting Single Collector Run (Real Data) ---")
    target_match_ids = ["441613"]

    tasks = [collect_and_store_match(match_id) for match_id in target_match_ids]
    await asyncio.gather(*tasks)
    log.info("--- Single Collector Run Finished ---")
