"""Message formatting utilities for Telegram messages."""
import logging
from typing import Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

# Telegram message length limit
MAX_MESSAGE_LENGTH = 4096


def importance_icon(level: str) -> str:
    """
    Get emoji icon for importance level.

    Args:
        level: Importance level (high, medium, low)

    Returns:
        Emoji string
    """
    icons = {
        "high": "🔴",
        "medium": "🟡",
        "low": "⚪"
    }
    return icons.get(level, "⚪")


def format_date_ru(date_str: str) -> str:
    """
    Format date in Russian format.

    Args:
        date_str: Date in YYYY-MM-DD format

    Returns:
        Formatted date string (e.g., "14 марта 2010")
    """
    try:
        date_obj = datetime.strptime(date_str, "%Y-%m-%d")
        months_ru = [
            "января", "февраля", "марта", "апреля", "мая", "июня",
            "июля", "августа", "сентября", "октября", "ноября", "декабря"
        ]
        return f"{date_obj.day} {months_ru[date_obj.month - 1]} {date_obj.year}"
    except Exception as e:
        logger.error(f"Error formatting date {date_str}: {e}")
        return date_str


def truncate_message(text: str, max_length: int = MAX_MESSAGE_LENGTH) -> str:
    """
    Truncate message to fit Telegram's length limit.

    Args:
        text: Message text
        max_length: Maximum length

    Returns:
        Truncated text
    """
    if len(text) <= max_length:
        return text

    truncated = text[:max_length - 50]
    truncated += "\n\n<i>... (сообщение обрезано)</i>"
    return truncated


def format_day(day_data: Dict[str, Any]) -> str:
    """
    Format full day view with events, results summary, and quotes.

    Args:
        day_data: Day data from backend API

    Returns:
        Formatted HTML message
    """
    date = day_data.get("date", "")
    date_formatted = format_date_ru(date)
    events = day_data.get("events", [])

    # Header
    message = f"<b>📅 {date_formatted}</b>\n\n"

    if not events:
        message += "<i>На эту дату не найдено событий в базе данных.</i>"
        return truncate_message(message)

    # Events
    for event in events:
        event_type = event.get("event_type", "")
        importance = event.get("importance_level", "low")
        icon = importance_icon(importance)

        if event_type == "race":
            race_name = event.get("race_name", "Гонка")
            round_num = event.get("round", "")
            circuit = event.get("circuit_name", "")

            message += f"{icon} <b>Гонка #{round_num}: {race_name}</b>\n"
            if circuit:
                message += f"   🏁 {circuit}\n"

            # Winner
            winner = event.get("winner")
            if winner:
                message += f"   🏆 Победитель: <b>{winner['driver_name']}</b> ({winner['team']})\n"

            # Podium
            podium = event.get("podium", [])
            if len(podium) >= 3:
                message += f"   🥈 {podium[1]['driver_name']} ({podium[1]['team']})\n"
                message += f"   🥉 {podium[2]['driver_name']} ({podium[2]['team']})\n"

            message += "\n"

        elif event_type == "qualifying":
            race_name = event.get("race_name", "Квалификация")
            pole = event.get("pole_position")

            message += f"{icon} <b>Квалификация: {race_name}</b>\n"
            if pole:
                message += f"   🏁 Поул: <b>{pole['driver_name']}</b> ({pole['team']})\n"
            message += "\n"

        elif event_type == "practice":
            session_name = event.get("session_name", "Практика")
            message += f"{icon} <b>{session_name}</b>\n\n"

    # Quotes (if available)
    quotes = day_data.get("quotes", [])
    if quotes:
        message += "<b>💬 Цитаты дня:</b>\n"
        for quote in quotes[:2]:  # Limit to 2 quotes
            text = quote.get("quote_text", "")
            author = quote.get("driver_name") or quote.get("author", "")
            if text and author:
                message += f"<i>"{text}"</i>\n— {author}\n\n"

    return truncate_message(message)


def format_daily_digest(today_data: Dict[str, Any]) -> str:
    """
    Format shorter daily digest for broadcasts.

    Args:
        today_data: Today's data from backend API

    Returns:
        Formatted HTML message
    """
    date = today_data.get("date", "")
    date_formatted = format_date_ru(date)
    events = today_data.get("events", [])

    # Header
    message = f"<b>🏎️ F1 Time Machine</b>\n"
    message += f"<b>📅 {date_formatted}</b>\n\n"

    if not events:
        message += "<i>Сегодня нет значимых событий из истории Формулы-1.</i>"
        return message

    # Count event types
    races = [e for e in events if e.get("event_type") == "race"]
    quals = [e for e in events if e.get("event_type") == "qualifying"]

    # Summary
    if races:
        race = races[0]
        race_name = race.get("race_name", "Гонка")
        winner = race.get("winner")

        message += f"<b>🏆 {race_name}</b>\n"
        if winner:
            message += f"Победитель: <b>{winner['driver_name']}</b>\n"
            message += f"Команда: {winner['team']}\n"

        # Podium
        podium = race.get("podium", [])
        if len(podium) >= 3:
            message += f"\n<b>Подиум:</b>\n"
            message += f"🥇 {podium[0]['driver_name']}\n"
            message += f"🥈 {podium[1]['driver_name']}\n"
            message += f"🥉 {podium[2]['driver_name']}\n"

    elif quals:
        qual = quals[0]
        race_name = qual.get("race_name", "Квалификация")
        pole = qual.get("pole_position")

        message += f"<b>🏁 Квалификация: {race_name}</b>\n"
        if pole:
            message += f"Поул: <b>{pole['driver_name']}</b> ({pole['team']})\n"

    message += f"\n<i>Нажмите кнопку ниже для подробностей</i>"

    return message


def format_standings(standings_data: Dict[str, Any]) -> str:
    """
    Format driver standings as table with medals for top 3.

    Args:
        standings_data: Standings data from backend API

    Returns:
        Formatted HTML message
    """
    year = standings_data.get("year", "")
    round_num = standings_data.get("round")
    standings = standings_data.get("standings", [])

    # Header
    message = f"<b>🏆 Кубок пилотов {year}</b>\n"
    if round_num:
        message += f"<i>После этапа {round_num}</i>\n"
    message += "\n"

    if not standings:
        message += "<i>Нет данных о турнирной таблице.</i>"
        return message

    # Standings table
    for standing in standings[:15]:  # Show top 15
        position = standing.get("position", 0)
        driver_name = standing.get("driver_name", "")
        team = standing.get("team", "")
        points = standing.get("points", 0)

        # Medal for top 3
        medal = ""
        if position == 1:
            medal = "🥇 "
        elif position == 2:
            medal = "🥈 "
        elif position == 3:
            medal = "🥉 "

        message += f"{medal}<b>{position}.</b> {driver_name}\n"
        message += f"   {team} — <b>{points}</b> очков\n"

    if len(standings) > 15:
        message += f"\n<i>... и еще {len(standings) - 15} пилотов</i>"

    return truncate_message(message)


def format_race_results(race_data: Dict[str, Any]) -> str:
    """
    Format race results with podium and full results.

    Args:
        race_data: Race data from backend API

    Returns:
        Formatted HTML message
    """
    race_name = race_data.get("race_name", "Гонка")
    circuit = race_data.get("circuit_name", "")
    date = race_data.get("date", "")
    date_formatted = format_date_ru(date) if date else ""
    results = race_data.get("results", [])

    # Header
    message = f"<b>🏁 {race_name}</b>\n"
    if circuit:
        message += f"{circuit}\n"
    if date_formatted:
        message += f"<i>{date_formatted}</i>\n"
    message += "\n"

    if not results:
        message += "<i>Нет данных о результатах гонки.</i>"
        return message

    # Podium
    message += "<b>🏆 Подиум:</b>\n"
    for i, result in enumerate(results[:3]):
        driver = result.get("driver_name", "")
        team = result.get("team", "")
        time = result.get("time", "")

        medal = ["🥇", "🥈", "🥉"][i]
        message += f"{medal} <b>{driver}</b> ({team})\n"
        if time:
            message += f"   Время: {time}\n"

    message += "\n<b>Полные результаты:</b>\n"

    # Full results (top 10 + DNFs)
    finishers = [r for r in results if r.get("status") == "Finished"]
    dnfs = [r for r in results if r.get("status") != "Finished"]

    for result in finishers[:10]:
        position = result.get("position", "")
        driver = result.get("driver_name", "")
        team = result.get("team", "")
        points = result.get("points", 0)

        message += f"{position}. {driver} ({team})"
        if points > 0:
            message += f" — <b>{points}</b> очков"
        message += "\n"

    # DNFs
    if dnfs:
        message += f"\n<b>Не финишировали:</b>\n"
        for result in dnfs[:5]:  # Show first 5 DNFs
            driver = result.get("driver_name", "")
            status = result.get("status", "DNF")
            message += f"❌ {driver} — {status}\n"

    return truncate_message(message)


def format_help() -> str:
    """
    Format help message with available commands.

    Returns:
        Formatted HTML message
    """
    message = (
        "<b>❓ Доступные команды</b>\n\n"

        "<b>Просмотр событий:</b>\n"
        "/today — Что было сегодня в истории F1\n"
        "/day YYYY-MM-DD — События на конкретную дату\n"
        "/race [номер] — Результаты гонки\n"
        "/standings [этап] — Турнирная таблица\n\n"

        "<b>Подписка:</b>\n"
        "/subscribe — Включить ежедневные дайджесты\n"
        "/unsubscribe — Отключить рассылку\n"
        "/settings — Настроить время и часовой пояс\n\n"

        "<b>Прочее:</b>\n"
        "/help — Показать эту справку\n"
        "/start — Вернуться в главное меню\n\n"

        "<i>Используйте кнопки для быстрого доступа к функциям бота.</i>"
    )
    return message
