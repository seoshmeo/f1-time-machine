"""Start command handler."""
import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes

from bot.services.api_client import get_api_client
from bot.config import get_settings

logger = logging.getLogger(__name__)


async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /start command."""
    user = update.effective_user
    chat_id = update.effective_chat.id

    logger.info(f"User {user.id} ({user.username}) started the bot")

    # Register subscriber with backend API
    settings = get_settings()
    api_client = get_api_client()

    try:
        await api_client.register_subscriber({
            "telegram_id": user.id,
            "telegram_username": user.username,
            "telegram_chat_id": chat_id,
            "timezone": settings.default_timezone,
            "send_time": settings.default_send_time,
            "language": settings.default_language,
            "is_active": True
        })
        logger.info(f"Registered subscriber {user.id}")
    except Exception as e:
        logger.error(f"Failed to register subscriber: {e}")

    # Welcome message
    welcome_text = (
        f"Привет, {user.first_name}!\n\n"
        f"<b>Добро пожаловать в F1 Time Machine</b> 🏎️\n\n"
        f"Это бот, который каждый день отправляет вам события из истории Формулы-1, "
        f"произошедшие ровно N лет назад в этот день.\n\n"
        f"<b>Что умеет бот:</b>\n"
        f"• Ежедневные дайджесты исторических событий\n"
        f"• Просмотр результатов гонок и квалификаций\n"
        f"• Турнирные таблицы любого этапа\n"
        f"• Детальная информация о каждом дне сезона\n\n"
        f"Используйте команду /help для просмотра всех доступных команд.\n\n"
        f"<i>Приятного путешествия во времени!</i> ⏰"
    )

    # Inline keyboard
    keyboard = [
        [
            InlineKeyboardButton("📅 Что было сегодня?", callback_data="today"),
            InlineKeyboardButton("🏆 Турнирная таблица", callback_data="standings_latest")
        ],
        [
            InlineKeyboardButton("❓ Помощь", callback_data="help")
        ]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    await update.message.reply_html(welcome_text, reply_markup=reply_markup)


async def start_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle start button callback."""
    query = update.callback_query
    await query.answer()

    user = query.from_user
    welcome_text = (
        f"Привет, {user.first_name}!\n\n"
        f"<b>F1 Time Machine</b> — ваш гид по истории Формулы-1 🏎️\n\n"
        f"Используйте кнопки ниже или команду /help для начала работы."
    )

    keyboard = [
        [
            InlineKeyboardButton("📅 Что было сегодня?", callback_data="today"),
            InlineKeyboardButton("🏆 Турнирная таблица", callback_data="standings_latest")
        ],
        [
            InlineKeyboardButton("❓ Помощь", callback_data="help")
        ]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    await query.edit_message_text(welcome_text, reply_markup=reply_markup, parse_mode="HTML")
