"""Main entry point for the F1 Time Machine Telegram bot."""
import logging
import sys
from telegram import Update
from telegram.ext import (
    Application,
    CommandHandler,
    CallbackQueryHandler,
    MessageHandler,
    filters,
)

from bot.config import get_settings
from bot.handlers import start, help, today, day, standings, race, subscribe, settings
from bot.scheduler.jobs import register_jobs

# Configure logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)


async def error_handler(update: object, context) -> None:
    """Handle errors in the bot."""
    logger.error(f"Exception while handling an update: {context.error}", exc_info=context.error)

    # Notify admin if configured
    settings = get_settings()
    if settings.bot_admin_chat_id:
        try:
            error_message = (
                f"<b>Error in bot:</b>\n"
                f"<pre>{str(context.error)[:500]}</pre>"
            )
            await context.bot.send_message(
                chat_id=settings.bot_admin_chat_id,
                text=error_message,
                parse_mode="HTML"
            )
        except Exception as e:
            logger.error(f"Failed to notify admin: {e}")


def main() -> None:
    """Start the bot."""
    settings = get_settings()

    # Validate required settings
    if not settings.telegram_bot_token:
        logger.error("TELEGRAM_BOT_TOKEN is not set")
        sys.exit(1)

    logger.info("Starting F1 Time Machine bot...")

    # Create application
    application = (
        Application.builder()
        .token(settings.telegram_bot_token)
        .build()
    )

    # Register command handlers
    application.add_handler(CommandHandler("start", start.start_command))
    application.add_handler(CommandHandler("help", help.help_command))
    application.add_handler(CommandHandler("today", today.today_command))
    application.add_handler(CommandHandler("day", day.day_command))
    application.add_handler(CommandHandler("standings", standings.standings_command))
    application.add_handler(CommandHandler("race", race.race_command))
    application.add_handler(CommandHandler("subscribe", subscribe.subscribe_command))
    application.add_handler(CommandHandler("unsubscribe", subscribe.unsubscribe_command))
    application.add_handler(CommandHandler("settings", settings.settings_command))

    # Register callback query handlers
    application.add_handler(CallbackQueryHandler(start.start_callback, pattern="^start$"))
    application.add_handler(CallbackQueryHandler(help.help_callback, pattern="^help$"))
    application.add_handler(CallbackQueryHandler(today.today_callback, pattern="^today$"))
    application.add_handler(CallbackQueryHandler(day.day_callback, pattern="^day_"))
    application.add_handler(CallbackQueryHandler(standings.standings_callback, pattern="^standings"))
    application.add_handler(CallbackQueryHandler(race.race_callback, pattern="^race_"))
    application.add_handler(CallbackQueryHandler(settings.settings_callback, pattern="^settings"))
    application.add_handler(CallbackQueryHandler(subscribe.subscribe_callback, pattern="^subscribe$"))
    application.add_handler(CallbackQueryHandler(subscribe.unsubscribe_callback, pattern="^unsubscribe$"))

    # Register error handler
    application.add_error_handler(error_handler)

    # Register scheduled jobs
    register_jobs(application)

    # Start bot
    if settings.telegram_webhook_url:
        logger.info(f"Starting webhook mode on {settings.telegram_webhook_url}")
        application.run_webhook(
            listen="0.0.0.0",
            port=settings.telegram_webhook_port,
            url_path=settings.telegram_bot_token,
            webhook_url=f"{settings.telegram_webhook_url}/{settings.telegram_bot_token}"
        )
    else:
        logger.info("Starting polling mode")
        application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
