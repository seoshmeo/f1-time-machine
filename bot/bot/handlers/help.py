"""Help command handler."""
import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes

from bot.services.message_builder import format_help

logger = logging.getLogger(__name__)


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /help command."""
    help_text = format_help()

    keyboard = [
        [
            InlineKeyboardButton("📅 Что было сегодня?", callback_data="today"),
        ],
        [
            InlineKeyboardButton("🏆 Турнирная таблица", callback_data="standings_latest"),
        ],
        [
            InlineKeyboardButton("⚙️ Настройки", callback_data="settings_main")
        ]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    await update.message.reply_html(help_text, reply_markup=reply_markup)


async def help_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle help button callback."""
    query = update.callback_query
    await query.answer()

    help_text = format_help()

    keyboard = [
        [
            InlineKeyboardButton("📅 Что было сегодня?", callback_data="today"),
        ],
        [
            InlineKeyboardButton("🏆 Турнирная таблица", callback_data="standings_latest"),
        ],
        [
            InlineKeyboardButton("⚙️ Настройки", callback_data="settings_main")
        ]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    await query.edit_message_text(help_text, reply_markup=reply_markup, parse_mode="HTML")
