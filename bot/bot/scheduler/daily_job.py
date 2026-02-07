"""Daily broadcast job - sends historical F1 events to active subscribers."""
import asyncio
import logging
from datetime import datetime
from telegram.error import Forbidden, BadRequest
from telegram.ext import ContextTypes

from bot.services.api_client import get_api_client
from bot.services.message_builder import format_daily_digest
from bot.keyboards.inline import build_day_keyboard
from bot.config import get_settings

logger = logging.getLogger(__name__)


async def daily_broadcast(context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    Daily broadcast job that sends today's F1 history to all active subscribers.

    This job:
    1. Fetches today's historical F1 events from the backend API
    2. Gets list of all active subscribers
    3. Formats the digest message
    4. Sends to each subscriber with rate limiting
    5. Handles blocked/deactivated users
    6. Logs success/failure statistics
    """
    logger.info("Starting daily broadcast job")

    settings = get_settings()
    api_client = get_api_client()

    success_count = 0
    failure_count = 0
    blocked_count = 0

    try:
        # Fetch today's historical F1 events
        today_data = await api_client.get_today(settings.default_season)

        if not today_data:
            logger.warning("No data available for today's broadcast")
            return

        # Format the daily digest message
        message_text = format_daily_digest(today_data)
        reply_markup = build_day_keyboard(today_data)

        # Get all active subscribers
        subscribers = await api_client.get_active_subscribers()

        if not subscribers:
            logger.info("No active subscribers found")
            return

        logger.info(f"Broadcasting to {len(subscribers)} active subscribers")

        # Send to each subscriber with rate limiting
        for subscriber in subscribers:
            telegram_chat_id = subscriber.get("telegram_chat_id")
            telegram_id = subscriber.get("telegram_id")

            if not telegram_chat_id:
                logger.warning(f"Subscriber {telegram_id} has no chat_id, skipping")
                continue

            try:
                # Send message
                await context.bot.send_message(
                    chat_id=telegram_chat_id,
                    text=message_text,
                    parse_mode="HTML",
                    reply_markup=reply_markup
                )

                success_count += 1
                logger.debug(f"Sent to {telegram_id}")

                # Rate limiting to avoid hitting Telegram limits
                await asyncio.sleep(settings.message_rate_limit)

            except Forbidden:
                # User blocked the bot or chat doesn't exist
                logger.info(f"User {telegram_id} blocked the bot, deactivating")
                blocked_count += 1

                try:
                    await api_client.deactivate_subscriber(telegram_id)
                except Exception as e:
                    logger.error(f"Failed to deactivate subscriber {telegram_id}: {e}")

            except BadRequest as e:
                # Invalid chat_id or other bad request
                logger.warning(f"Bad request for user {telegram_id}: {e}")
                failure_count += 1

            except Exception as e:
                # Other errors
                logger.error(f"Failed to send to {telegram_id}: {e}")
                failure_count += 1

        # Log summary statistics
        logger.info(
            f"Daily broadcast completed: "
            f"{success_count} sent, "
            f"{blocked_count} blocked, "
            f"{failure_count} failed"
        )

        # Notify admin if configured
        if settings.bot_admin_chat_id:
            summary = (
                f"<b>Daily Broadcast Summary</b>\n\n"
                f"✅ Sent: {success_count}\n"
                f"🚫 Blocked: {blocked_count}\n"
                f"❌ Failed: {failure_count}\n"
                f"📊 Total subscribers: {len(subscribers)}"
            )

            try:
                await context.bot.send_message(
                    chat_id=settings.bot_admin_chat_id,
                    text=summary,
                    parse_mode="HTML"
                )
            except Exception as e:
                logger.error(f"Failed to notify admin: {e}")

    except Exception as e:
        logger.error(f"Error in daily broadcast job: {e}", exc_info=True)

        # Notify admin of critical error
        if settings.bot_admin_chat_id:
            try:
                error_message = (
                    f"<b>Daily Broadcast Error</b>\n\n"
                    f"<pre>{str(e)[:500]}</pre>"
                )
                await context.bot.send_message(
                    chat_id=settings.bot_admin_chat_id,
                    text=error_message,
                    parse_mode="HTML"
                )
            except Exception as notify_error:
                logger.error(f"Failed to notify admin of error: {notify_error}")
