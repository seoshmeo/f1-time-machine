"""Day command handler - shows events on a specific date."""
import logging
import re
from datetime import datetime
from telegram import Update
from telegram.ext import ContextTypes

from bot.services.api_client import get_api_client
from bot.services.message_builder import format_day
from bot.keyboards.inline import build_day_keyboard
from bot.config import get_settings

logger = logging.getLogger(__name__)


async def day_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /day YYYY-MM-DD command."""
    if not context.args:
        await update.message.reply_html(
            "Пожалуйста, укажите дату в формате:\n"
            "<code>/day YYYY-MM-DD</code>\n\n"
            "Например: <code>/day 2010-03-14</code>"
        )
        return

    date_str = context.args[0]

    # Validate date format
    date_pattern = r"^\d{4}-\d{2}-\d{2}$"
    if not re.match(date_pattern, date_str):
        await update.message.reply_html(
            "Неверный формат даты. Используйте: <code>YYYY-MM-DD</code>\n"
            "Например: <code>/day 2010-03-14</code>"
        )
        return

    try:
        # Validate date
        datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        await update.message.reply_html("Указана некорректная дата.")
        return

    # Extract year from date
    year = int(date_str[:4])

    api_client = get_api_client()

    try:
        # Fetch day data from backend
        day_data = await api_client.get_day(year, date_str)

        if not day_data:
            await update.message.reply_html(
                f"На дату <b>{date_str}</b> не найдено событий в базе данных."
            )
            return

        # Format message
        message_text = format_day(day_data)

        # Build keyboard
        reply_markup = build_day_keyboard(day_data)

        await update.message.reply_html(message_text, reply_markup=reply_markup)

    except Exception as e:
        logger.error(f"Error fetching day data for {date_str}: {e}")
        await update.message.reply_html(
            "Произошла ошибка при получении данных. Пожалуйста, попробуйте позже."
        )


async def day_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle day_{date} button callback."""
    query = update.callback_query
    await query.answer()

    # Extract date from callback data (format: day_YYYY-MM-DD)
    callback_data = query.data
    date_str = callback_data.replace("day_", "")

    # Extract year from date
    year = int(date_str[:4])

    api_client = get_api_client()

    try:
        # Fetch day data from backend
        day_data = await api_client.get_day(year, date_str)

        if not day_data:
            await query.edit_message_text(
                f"На дату <b>{date_str}</b> не найдено событий в базе данных.",
                parse_mode="HTML"
            )
            return

        # Format message
        message_text = format_day(day_data)

        # Build keyboard
        reply_markup = build_day_keyboard(day_data)

        await query.edit_message_text(
            message_text,
            reply_markup=reply_markup,
            parse_mode="HTML"
        )

    except Exception as e:
        logger.error(f"Error fetching day data for {date_str}: {e}")
        await query.edit_message_text(
            "Произошла ошибка при получении данных. Пожалуйста, попробуйте позже.",
            parse_mode="HTML"
        )
