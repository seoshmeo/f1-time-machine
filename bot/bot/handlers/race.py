"""Race command handler - shows race results and details."""
import logging
from telegram import Update
from telegram.ext import ContextTypes

from bot.services.api_client import get_api_client
from bot.services.message_builder import format_race_results
from bot.keyboards.inline import build_race_keyboard
from bot.config import get_settings

logger = logging.getLogger(__name__)


async def race_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /race [round] command."""
    if not context.args:
        await update.message.reply_html(
            "Пожалуйста, укажите номер этапа:\n"
            "<code>/race [номер_этапа]</code>\n\n"
            "Например: <code>/race 5</code>"
        )
        return

    try:
        round_num = int(context.args[0])
    except ValueError:
        await update.message.reply_html(
            "Неверный формат номера этапа. Используйте:\n"
            "<code>/race [номер_этапа]</code>\n\n"
            "Например: <code>/race 5</code>"
        )
        return

    settings = get_settings()
    api_client = get_api_client()

    try:
        # Fetch race data from backend
        race_data = await api_client.get_race(settings.default_season, round_num)

        if not race_data:
            await update.message.reply_html(
                f"Гонка с номером <b>{round_num}</b> не найдена."
            )
            return

        # Format message
        message_text = format_race_results(race_data)

        # Build keyboard
        reply_markup = build_race_keyboard(round_num)

        await update.message.reply_html(message_text, reply_markup=reply_markup)

    except Exception as e:
        logger.error(f"Error fetching race data for round {round_num}: {e}")
        await update.message.reply_html(
            "Произошла ошибка при получении данных. Пожалуйста, попробуйте позже."
        )


async def race_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle race_{round} button callback."""
    query = update.callback_query
    await query.answer()

    # Extract round from callback data (format: race_N)
    callback_data = query.data
    try:
        round_num = int(callback_data.replace("race_", ""))
    except ValueError:
        await query.edit_message_text(
            "Ошибка при обработке запроса.",
            parse_mode="HTML"
        )
        return

    settings = get_settings()
    api_client = get_api_client()

    try:
        # Fetch race data from backend
        race_data = await api_client.get_race(settings.default_season, round_num)

        if not race_data:
            await query.edit_message_text(
                f"Гонка с номером <b>{round_num}</b> не найдена.",
                parse_mode="HTML"
            )
            return

        # Format message
        message_text = format_race_results(race_data)

        # Build keyboard
        reply_markup = build_race_keyboard(round_num)

        await query.edit_message_text(
            message_text,
            reply_markup=reply_markup,
            parse_mode="HTML"
        )

    except Exception as e:
        logger.error(f"Error fetching race data for round {round_num}: {e}")
        await query.edit_message_text(
            "Произошла ошибка при получении данных. Пожалуйста, попробуйте позже.",
            parse_mode="HTML"
        )
