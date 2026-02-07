"""Subscription management handlers."""
import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes

from bot.services.api_client import get_api_client

logger = logging.getLogger(__name__)


async def subscribe_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /subscribe command."""
    user = update.effective_user
    api_client = get_api_client()

    try:
        # Activate subscription via backend API
        await api_client.update_subscriber(user.id, {"is_active": True})

        message = (
            "✅ <b>Подписка активирована!</b>\n\n"
            "Теперь вы будете получать ежедневные дайджесты с историческими событиями Формулы-1.\n\n"
            "Изменить настройки можно через команду /settings"
        )

        keyboard = [
            [InlineKeyboardButton("⚙️ Настройки", callback_data="settings_main")],
            [InlineKeyboardButton("📅 Что было сегодня?", callback_data="today")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)

        await update.message.reply_html(message, reply_markup=reply_markup)
        logger.info(f"User {user.id} subscribed to daily digests")

    except Exception as e:
        logger.error(f"Error subscribing user {user.id}: {e}")
        await update.message.reply_html(
            "Произошла ошибка при активации подписки. Пожалуйста, попробуйте позже."
        )


async def unsubscribe_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /unsubscribe command."""
    user = update.effective_user
    api_client = get_api_client()

    try:
        # Deactivate subscription via backend API
        await api_client.update_subscriber(user.id, {"is_active": False})

        message = (
            "🔕 <b>Подписка отключена</b>\n\n"
            "Вы больше не будете получать ежедневные дайджесты.\n\n"
            "Вы можете в любой момент подписаться снова командой /subscribe"
        )

        keyboard = [
            [InlineKeyboardButton("🔔 Подписаться снова", callback_data="subscribe")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)

        await update.message.reply_html(message, reply_markup=reply_markup)
        logger.info(f"User {user.id} unsubscribed from daily digests")

    except Exception as e:
        logger.error(f"Error unsubscribing user {user.id}: {e}")
        await update.message.reply_html(
            "Произошла ошибка при отключении подписки. Пожалуйста, попробуйте позже."
        )


async def subscribe_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle subscribe button callback."""
    query = update.callback_query
    await query.answer()

    user = query.from_user
    api_client = get_api_client()

    try:
        # Activate subscription via backend API
        await api_client.update_subscriber(user.id, {"is_active": True})

        message = (
            "✅ <b>Подписка активирована!</b>\n\n"
            "Теперь вы будете получать ежедневные дайджесты с историческими событиями Формулы-1.\n\n"
            "Изменить настройки можно через команду /settings"
        )

        keyboard = [
            [InlineKeyboardButton("⚙️ Настройки", callback_data="settings_main")],
            [InlineKeyboardButton("📅 Что было сегодня?", callback_data="today")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)

        await query.edit_message_text(message, reply_markup=reply_markup, parse_mode="HTML")
        logger.info(f"User {user.id} subscribed to daily digests via callback")

    except Exception as e:
        logger.error(f"Error subscribing user {user.id}: {e}")
        await query.edit_message_text(
            "Произошла ошибка при активации подписки. Пожалуйста, попробуйте позже.",
            parse_mode="HTML"
        )


async def unsubscribe_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle unsubscribe button callback."""
    query = update.callback_query
    await query.answer()

    user = query.from_user
    api_client = get_api_client()

    try:
        # Deactivate subscription via backend API
        await api_client.update_subscriber(user.id, {"is_active": False})

        message = (
            "🔕 <b>Подписка отключена</b>\n\n"
            "Вы больше не будете получать ежедневные дайджесты.\n\n"
            "Вы можете в любой момент подписаться снова."
        )

        keyboard = [
            [InlineKeyboardButton("🔔 Подписаться снова", callback_data="subscribe")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)

        await query.edit_message_text(message, reply_markup=reply_markup, parse_mode="HTML")
        logger.info(f"User {user.id} unsubscribed from daily digests via callback")

    except Exception as e:
        logger.error(f"Error unsubscribing user {user.id}: {e}")
        await query.edit_message_text(
            "Произошла ошибка при отключении подписки. Пожалуйста, попробуйте позже.",
            parse_mode="HTML"
        )
