"""Today command handler - shows what happened on this day in F1 history."""
import logging
from datetime import datetime
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes

from bot.services.api_client import get_api_client
from bot.services.message_builder import format_day
from bot.keyboards.inline import build_day_keyboard
from bot.config import get_settings

logger = logging.getLogger(__name__)


async def today_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /today command."""
    settings = get_settings()
    api_client = get_api_client()

    # Get today's date
    today = datetime.now().strftime("%Y-%m-%d")

    try:
        # Fetch today's data from backend
        today_data = await api_client.get_today(settings.default_season)

        if not today_data:
            await update.message.reply_html(
                "К сожалению, на эту дату нет исторических событий в базе данных."
            )
            return

        # Format message
        message_text = format_day(today_data)

        # Build keyboard
        reply_markup = build_day_keyboard(today_data)

        await update.message.reply_html(message_text, reply_markup=reply_markup)

    except Exception as e:
        logger.error(f"Error fetching today's data: {e}")
        await update.message.reply_html(
            "Произошла ошибка при получении данных. Пожалуйста, попробуйте позже."
        )


async def today_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle today button callback."""
    query = update.callback_query
    await query.answer()

    settings = get_settings()
    api_client = get_api_client()

    try:
        # Fetch today's data from backend
        today_data = await api_client.get_today(settings.default_season)

        if not today_data:
            await query.edit_message_text(
                "К сожалению, на эту дату нет исторических событий в базе данных.",
                parse_mode="HTML"
            )
            return

        # Format message
        message_text = format_day(today_data)

        # Build keyboard
        reply_markup = build_day_keyboard(today_data)

        await query.edit_message_text(
            message_text,
            reply_markup=reply_markup,
            parse_mode="HTML"
        )

    except Exception as e:
        logger.error(f"Error fetching today's data: {e}")
        await query.edit_message_text(
            "Произошла ошибка при получении данных. Пожалуйста, попробуйте позже.",
            parse_mode="HTML"
        )
