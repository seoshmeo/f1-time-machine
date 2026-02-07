"""Reply keyboard builders (persistent keyboards)."""
from telegram import KeyboardButton, ReplyKeyboardMarkup


def main_menu_keyboard() -> ReplyKeyboardMarkup:
    """
    Build main menu reply keyboard.

    Returns:
        ReplyKeyboardMarkup with main menu buttons
    """
    keyboard = [
        [
            KeyboardButton("📅 Сегодня"),
            KeyboardButton("🏆 Турнирная таблица")
        ],
        [
            KeyboardButton("⚙️ Настройки"),
            KeyboardButton("❓ Помощь")
        ]
    ]

    return ReplyKeyboardMarkup(
        keyboard,
        resize_keyboard=True,
        one_time_keyboard=False
    )
