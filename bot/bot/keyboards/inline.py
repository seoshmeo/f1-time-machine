"""Inline keyboard builders for bot responses."""
from typing import Dict, Any, Optional
from telegram import InlineKeyboardButton, InlineKeyboardMarkup
from datetime import datetime, timedelta


def build_day_keyboard(day_data: Dict[str, Any]) -> InlineKeyboardMarkup:
    """
    Build inline keyboard for day view.

    Args:
        day_data: Day data containing date and events

    Returns:
        InlineKeyboardMarkup with navigation buttons
    """
    keyboard = []

    # Navigation buttons (prev/next day)
    date_str = day_data.get("date")
    if date_str:
        try:
            date_obj = datetime.strptime(date_str, "%Y-%m-%d")
            prev_date = (date_obj - timedelta(days=1)).strftime("%Y-%m-%d")
            next_date = (date_obj + timedelta(days=1)).strftime("%Y-%m-%d")

            keyboard.append([
                InlineKeyboardButton("« Предыдущий день", callback_data=f"day_{prev_date}"),
                InlineKeyboardButton("Следующий день »", callback_data=f"day_{next_date}")
            ])
        except ValueError:
            pass

    # Check if it's a race day
    events = day_data.get("events", [])
    races = [e for e in events if e.get("event_type") == "race"]

    if races:
        race = races[0]
        round_num = race.get("round")

        if round_num:
            keyboard.append([
                InlineKeyboardButton("📊 Полные результаты", callback_data=f"race_{round_num}"),
                InlineKeyboardButton("🏆 Турнирная таблица", callback_data=f"standings_{round_num}")
            ])
    else:
        # Generic standings button
        keyboard.append([
            InlineKeyboardButton("🏆 Турнирная таблица", callback_data="standings_latest")
        ])

    # Help button
    keyboard.append([
        InlineKeyboardButton("❓ Помощь", callback_data="help")
    ])

    return InlineKeyboardMarkup(keyboard)


def build_standings_keyboard(
    current_round: int,
    total_rounds: int
) -> InlineKeyboardMarkup:
    """
    Build inline keyboard for standings navigation.

    Args:
        current_round: Current round number
        total_rounds: Total number of rounds in season

    Returns:
        InlineKeyboardMarkup with round navigation
    """
    keyboard = []

    # Round navigation
    nav_buttons = []
    if current_round > 1:
        nav_buttons.append(
            InlineKeyboardButton(
                f"« Этап {current_round - 1}",
                callback_data=f"standings_{current_round - 1}"
            )
        )

    if current_round < total_rounds:
        nav_buttons.append(
            InlineKeyboardButton(
                f"Этап {current_round + 1} »",
                callback_data=f"standings_{current_round + 1}"
            )
        )

    if nav_buttons:
        keyboard.append(nav_buttons)

    # Jump to specific rounds
    keyboard.append([
        InlineKeyboardButton("Начало сезона", callback_data="standings_1"),
        InlineKeyboardButton("Последний этап", callback_data="standings_latest")
    ])

    # Other actions
    keyboard.append([
        InlineKeyboardButton("📅 Что было сегодня?", callback_data="today"),
        InlineKeyboardButton("❓ Помощь", callback_data="help")
    ])

    return InlineKeyboardMarkup(keyboard)


def build_race_keyboard(round_num: int) -> InlineKeyboardMarkup:
    """
    Build inline keyboard for race view.

    Args:
        round_num: Race round number

    Returns:
        InlineKeyboardMarkup with race-related buttons
    """
    keyboard = [
        [
            InlineKeyboardButton("🏆 Турнирная таблица", callback_data=f"standings_{round_num}")
        ],
        [
            InlineKeyboardButton("📅 Что было сегодня?", callback_data="today"),
            InlineKeyboardButton("❓ Помощь", callback_data="help")
        ]
    ]

    return InlineKeyboardMarkup(keyboard)


def build_settings_keyboard(current_settings: Dict[str, Any]) -> InlineKeyboardMarkup:
    """
    Build inline keyboard for settings management.

    Args:
        current_settings: Current user settings

    Returns:
        InlineKeyboardMarkup with settings options
    """
    is_active = current_settings.get("is_active", True)

    keyboard = []

    # Subscription toggle
    if is_active:
        keyboard.append([
            InlineKeyboardButton("🔕 Отключить подписку", callback_data="unsubscribe")
        ])
    else:
        keyboard.append([
            InlineKeyboardButton("🔔 Включить подписку", callback_data="subscribe")
        ])

    # Settings options
    keyboard.append([
        InlineKeyboardButton("🌍 Часовой пояс", callback_data="settings_timezone"),
        InlineKeyboardButton("⏰ Время отправки", callback_data="settings_time")
    ])

    # Back to main
    keyboard.append([
        InlineKeyboardButton("« Назад", callback_data="start")
    ])

    return InlineKeyboardMarkup(keyboard)
