"""User settings management handlers."""
import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes

from bot.services.api_client import get_api_client
from bot.keyboards.inline import build_settings_keyboard

logger = logging.getLogger(__name__)


async def settings_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /settings command."""
    user = update.effective_user
    api_client = get_api_client()

    try:
        # Fetch current user settings from backend
        subscriber_data = await api_client.get_subscriber(user.id)

        if not subscriber_data:
            await update.message.reply_html(
                "Не удалось получить настройки. Пожалуйста, попробуйте позже."
            )
            return

        # Format settings message
        settings_text = (
            "<b>⚙️ Ваши настройки</b>\n\n"
            f"<b>Статус подписки:</b> {'✅ Активна' if subscriber_data.get('is_active') else '🔕 Отключена'}\n"
            f"<b>Часовой пояс:</b> {subscriber_data.get('timezone', 'Europe/Moscow')}\n"
            f"<b>Время отправки:</b> {subscriber_data.get('send_time', '09:00')}\n"
            f"<b>Язык:</b> {subscriber_data.get('language', 'ru')}\n\n"
            "<i>Используйте кнопки ниже для изменения настроек</i>"
        )

        reply_markup = build_settings_keyboard(subscriber_data)

        await update.message.reply_html(settings_text, reply_markup=reply_markup)

    except Exception as e:
        logger.error(f"Error fetching settings for user {user.id}: {e}")
        await update.message.reply_html(
            "Произошла ошибка при получении настроек. Пожалуйста, попробуйте позже."
        )


async def settings_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle settings button callbacks."""
    query = update.callback_query
    await query.answer()

    user = query.from_user
    callback_data = query.data
    api_client = get_api_client()

    # Handle main settings view
    if callback_data == "settings_main":
        try:
            subscriber_data = await api_client.get_subscriber(user.id)

            if not subscriber_data:
                await query.edit_message_text(
                    "Не удалось получить настройки. Пожалуйста, попробуйте позже.",
                    parse_mode="HTML"
                )
                return

            settings_text = (
                "<b>⚙️ Ваши настройки</b>\n\n"
                f"<b>Статус подписки:</b> {'✅ Активна' if subscriber_data.get('is_active') else '🔕 Отключена'}\n"
                f"<b>Часовой пояс:</b> {subscriber_data.get('timezone', 'Europe/Moscow')}\n"
                f"<b>Время отправки:</b> {subscriber_data.get('send_time', '09:00')}\n"
                f"<b>Язык:</b> {subscriber_data.get('language', 'ru')}\n\n"
                "<i>Используйте кнопки ниже для изменения настроек</i>"
            )

            reply_markup = build_settings_keyboard(subscriber_data)

            await query.edit_message_text(
                settings_text,
                reply_markup=reply_markup,
                parse_mode="HTML"
            )

        except Exception as e:
            logger.error(f"Error fetching settings for user {user.id}: {e}")
            await query.edit_message_text(
                "Произошла ошибка при получении настроек. Пожалуйста, попробуйте позже.",
                parse_mode="HTML"
            )

    # Handle timezone change menu
    elif callback_data == "settings_timezone":
        keyboard = [
            [
                InlineKeyboardButton("🇷🇺 Москва (UTC+3)", callback_data="set_tz_Europe/Moscow"),
            ],
            [
                InlineKeyboardButton("🇪🇺 Берлин (UTC+1)", callback_data="set_tz_Europe/Berlin"),
                InlineKeyboardButton("🇬🇧 Лондон (UTC+0)", callback_data="set_tz_Europe/London"),
            ],
            [
                InlineKeyboardButton("🇺🇸 Нью-Йорк (UTC-5)", callback_data="set_tz_America/New_York"),
                InlineKeyboardButton("🇺🇸 Лос-Анджелес (UTC-8)", callback_data="set_tz_America/Los_Angeles"),
            ],
            [
                InlineKeyboardButton("« Назад", callback_data="settings_main")
            ]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)

        await query.edit_message_text(
            "<b>Выберите часовой пояс:</b>",
            reply_markup=reply_markup,
            parse_mode="HTML"
        )

    # Handle timezone selection
    elif callback_data.startswith("set_tz_"):
        timezone = callback_data.replace("set_tz_", "")

        try:
            await api_client.update_subscriber(user.id, {"timezone": timezone})

            await query.answer("✅ Часовой пояс обновлен")

            # Return to settings main
            subscriber_data = await api_client.get_subscriber(user.id)
            settings_text = (
                "<b>⚙️ Ваши настройки</b>\n\n"
                f"<b>Статус подписки:</b> {'✅ Активна' if subscriber_data.get('is_active') else '🔕 Отключена'}\n"
                f"<b>Часовой пояс:</b> {subscriber_data.get('timezone', 'Europe/Moscow')}\n"
                f"<b>Время отправки:</b> {subscriber_data.get('send_time', '09:00')}\n"
                f"<b>Язык:</b> {subscriber_data.get('language', 'ru')}\n\n"
                "<i>Используйте кнопки ниже для изменения настроек</i>"
            )

            reply_markup = build_settings_keyboard(subscriber_data)

            await query.edit_message_text(
                settings_text,
                reply_markup=reply_markup,
                parse_mode="HTML"
            )

        except Exception as e:
            logger.error(f"Error updating timezone for user {user.id}: {e}")
            await query.answer("❌ Ошибка при обновлении")

    # Handle send time change menu
    elif callback_data == "settings_time":
        keyboard = [
            [
                InlineKeyboardButton("🌅 07:00", callback_data="set_time_07:00"),
                InlineKeyboardButton("☀️ 09:00", callback_data="set_time_09:00"),
                InlineKeyboardButton("🌞 12:00", callback_data="set_time_12:00"),
            ],
            [
                InlineKeyboardButton("🌆 18:00", callback_data="set_time_18:00"),
                InlineKeyboardButton("🌙 21:00", callback_data="set_time_21:00"),
            ],
            [
                InlineKeyboardButton("« Назад", callback_data="settings_main")
            ]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)

        await query.edit_message_text(
            "<b>Выберите время отправки дайджеста:</b>",
            reply_markup=reply_markup,
            parse_mode="HTML"
        )

    # Handle send time selection
    elif callback_data.startswith("set_time_"):
        send_time = callback_data.replace("set_time_", "")

        try:
            await api_client.update_subscriber(user.id, {"send_time": send_time})

            await query.answer("✅ Время отправки обновлено")

            # Return to settings main
            subscriber_data = await api_client.get_subscriber(user.id)
            settings_text = (
                "<b>⚙️ Ваши настройки</b>\n\n"
                f"<b>Статус подписки:</b> {'✅ Активна' if subscriber_data.get('is_active') else '🔕 Отключена'}\n"
                f"<b>Часовой пояс:</b> {subscriber_data.get('timezone', 'Europe/Moscow')}\n"
                f"<b>Время отправки:</b> {subscriber_data.get('send_time', '09:00')}\n"
                f"<b>Язык:</b> {subscriber_data.get('language', 'ru')}\n\n"
                "<i>Используйте кнопки ниже для изменения настроек</i>"
            )

            reply_markup = build_settings_keyboard(subscriber_data)

            await query.edit_message_text(
                settings_text,
                reply_markup=reply_markup,
                parse_mode="HTML"
            )

        except Exception as e:
            logger.error(f"Error updating send time for user {user.id}: {e}")
            await query.answer("❌ Ошибка при обновлении")
