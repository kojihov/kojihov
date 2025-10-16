# core/logger.py
import logging
import sys

from .config import settings


def setup_logger():
    logging.getLogger().handlers = []
    logger = logging.getLogger("ManusAnalytics")
    logger.setLevel(settings.LOG_LEVEL)
    formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    stream_handler = logging.StreamHandler(sys.stdout)
    stream_handler.setFormatter(formatter)
    logger.addHandler(stream_handler)
    return logger


log = setup_logger()
