"""Standings command handler - shows driver championship standings."""
import logging
from telegram import Update
from telegram.ext import ContextTypes

from bot.services.api_client import get_api_client
from bot.services.message_builder import format_standings
from bot.keyboards.inline import build_standings_keyboard
from bot.config import get_settings

logger = logging.getLogger(__name__)


async def standings_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /standings [round] command."""
    settings = get_settings()
    api_client = get_api_client()

    # Parse optional round argument
    round_num = None
    if context.args:
        try:
            round_num = int(context.args[0])
        except ValueError:
            await update.message.reply_html(
                "Неверный формат номера этапа. Используйте:\n"
                "<code>/standings [номер_этапа]</code>\n\n"
                "Например: <code>/standings 5</code>"
            )
            return

    try:
        # Fetch standings from backend
        standings_data = await api_client.get_standings(settings.default_season, round_num)

        if not standings_data:
            await update.message.reply_html(
                "К сожалению, турнирная таблица недоступна для указанного этапа."
            )
            return

        # Format message
        message_text = format_standings(standings_data)

        # Build keyboard
        reply_markup = build_standings_keyboard(
            standings_data.get("round", 1),
            standings_data.get("total_rounds", 19)
        )

        await update.message.reply_html(message_text, reply_markup=reply_markup)

    except Exception as e:
        logger.error(f"Error fetching standings: {e}")
        await update.message.reply_html(
            "Произошла ошибка при получении данных. Пожалуйста, попробуйте позже."
        )


async def standings_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle standings_{round} button callback."""
    query = update.callback_query
    await query.answer()

    settings = get_settings()
    api_client = get_api_client()

    # Extract round from callback data
    callback_data = query.data
    round_num = None

    if callback_data != "standings_latest":
        try:
            round_num = int(callback_data.replace("standings_", ""))
        except ValueError:
            round_num = None

    try:
        # Fetch standings from backend
        standings_data = await api_client.get_standings(settings.default_season, round_num)

        if not standings_data:
            await query.edit_message_text(
                "К сожалению, турнирная таблица недоступна для указанного этапа.",
                parse_mode="HTML"
            )
            return

        # Format message
        message_text = format_standings(standings_data)

        # Build keyboard
        reply_markup = build_standings_keyboard(
            standings_data.get("round", 1),
            standings_data.get("total_rounds", 19)
        )

        await query.edit_message_text(
            message_text,
            reply_markup=reply_markup,
            parse_mode="HTML"
        )

    except Exception as e:
        logger.error(f"Error fetching standings: {e}")
        await query.edit_message_text(
            "Произошла ошибка при получении данных. Пожалуйста, попробуйте позже.",
            parse_mode="HTML"
        )
