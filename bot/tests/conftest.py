"""Pytest configuration and fixtures for bot tests."""
import pytest
from unittest.mock import AsyncMock, MagicMock
from telegram import Update, User, Chat, Message
from telegram.ext import ContextTypes

from bot.config import Settings


@pytest.fixture
def mock_settings():
    """Mock settings for testing."""
    return Settings(
        telegram_bot_token="test_token",
        backend_api_url="http://localhost:8000/api/v1",
        default_timezone="Europe/Moscow",
        default_send_time="09:00",
        default_language="ru",
        default_season=2010,
        bot_admin_chat_id=12345,
        daily_broadcast_hour=6,
        daily_broadcast_minute=0
    )


@pytest.fixture
def mock_user():
    """Mock Telegram user."""
    return User(
        id=123456789,
        first_name="Test",
        last_name="User",
        username="testuser",
        is_bot=False
    )


@pytest.fixture
def mock_chat():
    """Mock Telegram chat."""
    return Chat(
        id=123456789,
        type="private"
    )


@pytest.fixture
def mock_message(mock_user, mock_chat):
    """Mock Telegram message."""
    message = MagicMock(spec=Message)
    message.from_user = mock_user
    message.chat = mock_chat
    message.message_id = 1
    message.date = None
    message.text = "/start"
    message.reply_html = AsyncMock()
    message.reply_text = AsyncMock()
    return message


@pytest.fixture
def mock_update(mock_message):
    """Mock Telegram update."""
    update = MagicMock(spec=Update)
    update.update_id = 1
    update.message = mock_message
    update.effective_user = mock_message.from_user
    update.effective_chat = mock_message.chat
    update.callback_query = None
    return update


@pytest.fixture
def mock_context():
    """Mock context for handlers."""
    context = MagicMock(spec=ContextTypes.DEFAULT_TYPE)
    context.bot = AsyncMock()
    context.args = []
    context.user_data = {}
    context.chat_data = {}
    return context


@pytest.fixture
def mock_api_client():
    """Mock API client."""
    client = AsyncMock()

    # Mock API responses
    client.get_today.return_value = {
        "date": "2010-03-14",
        "year": 2010,
        "events": [
            {
                "event_type": "race",
                "race_name": "Гран-при Бахрейна",
                "round": 1,
                "circuit_name": "Бахрейн",
                "importance_level": "high",
                "winner": {
                    "driver_name": "Фернандо Алонсо",
                    "team": "Ferrari"
                },
                "podium": [
                    {"driver_name": "Фернандо Алонсо", "team": "Ferrari"},
                    {"driver_name": "Фелипе Масса", "team": "Ferrari"},
                    {"driver_name": "Льюис Хэмилтон", "team": "McLaren"}
                ]
            }
        ],
        "quotes": []
    }

    client.get_standings.return_value = {
        "year": 2010,
        "round": 1,
        "total_rounds": 19,
        "standings": [
            {
                "position": 1,
                "driver_name": "Фернандо Алонсо",
                "team": "Ferrari",
                "points": 25
            },
            {
                "position": 2,
                "driver_name": "Фелипе Масса",
                "team": "Ferrari",
                "points": 18
            }
        ]
    }

    client.get_active_subscribers.return_value = []
    client.register_subscriber.return_value = {"telegram_id": 123456789}
    client.update_subscriber.return_value = {"telegram_id": 123456789}

    return client


@pytest.fixture
def sample_day_data():
    """Sample day data for testing."""
    return {
        "date": "2010-03-14",
        "year": 2010,
        "events": [
            {
                "event_type": "race",
                "race_name": "Гран-при Бахрейна",
                "round": 1,
                "circuit_name": "Бахрейн",
                "importance_level": "high",
                "winner": {
                    "driver_name": "Фернандо Алонсо",
                    "team": "Ferrari"
                },
                "podium": [
                    {"driver_name": "Фернандо Алонсо", "team": "Ferrari"},
                    {"driver_name": "Фелипе Масса", "team": "Ferrari"},
                    {"driver_name": "Льюис Хэмилтон", "team": "McLaren"}
                ]
            }
        ],
        "quotes": [
            {
                "quote_text": "Это была отличная гонка!",
                "driver_name": "Фернандо Алонсо"
            }
        ]
    }


@pytest.fixture
def sample_standings_data():
    """Sample standings data for testing."""
    return {
        "year": 2010,
        "round": 10,
        "total_rounds": 19,
        "standings": [
            {
                "position": 1,
                "driver_name": "Льюис Хэмилтон",
                "team": "McLaren",
                "points": 192
            },
            {
                "position": 2,
                "driver_name": "Дженсон Баттон",
                "team": "McLaren",
                "points": 189
            },
            {
                "position": 3,
                "driver_name": "Себастьян Феттель",
                "team": "Red Bull",
                "points": 182
            }
        ]
    }
