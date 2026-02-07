"""Job registration for scheduled tasks."""
import logging
from datetime import time
from telegram.ext import Application

from bot.scheduler.daily_job import daily_broadcast
from bot.config import get_settings

logger = logging.getLogger(__name__)


def register_jobs(application: Application) -> None:
    """
    Register all scheduled jobs with the application's job queue.

    Args:
        application: The Telegram bot application instance
    """
    settings = get_settings()
    job_queue = application.job_queue

    if not job_queue:
        logger.warning("Job queue not available, scheduled jobs will not run")
        return

    # Register daily broadcast job
    # Runs every day at configured time (UTC)
    job_queue.run_daily(
        daily_broadcast,
        time=time(
            hour=settings.daily_broadcast_hour,
            minute=settings.daily_broadcast_minute
        ),
        name="daily_broadcast"
    )

    logger.info(
        f"Registered daily_broadcast job to run at "
        f"{settings.daily_broadcast_hour:02d}:{settings.daily_broadcast_minute:02d} UTC"
    )

    # Additional jobs can be registered here
    # Examples:
    # - Weekly standings summary
    # - Monthly race calendar
    # - Maintenance tasks
