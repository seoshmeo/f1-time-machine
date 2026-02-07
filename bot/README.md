# F1 Time Machine - Telegram Bot

Telegram bot that sends daily digests of historical F1 events that happened on this day years ago.

## Features

- Daily automated broadcasts of F1 history
- Interactive commands to explore races, standings, and results
- User subscription management
- Customizable settings (timezone, delivery time)
- Rich inline keyboards for navigation
- Support for multiple languages (Russian by default)

## Tech Stack

- Python 3.11+
- python-telegram-bot v21+ (async with job queue)
- httpx for API communication
- APScheduler for daily broadcasts
- Pydantic for configuration management

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and set your values:

```bash
cp .env.example .env
```

Required settings:
- `TELEGRAM_BOT_TOKEN` - Get from @BotFather
- `BACKEND_API_URL` - URL of the F1 Time Machine backend API

### 3. Run the Bot

```bash
python -m bot.main
```

The bot will start in polling mode by default. For webhook mode, set `TELEGRAM_WEBHOOK_URL`.

## Docker Deployment

```bash
docker build -t f1-time-machine-bot .
docker run -d --env-file .env f1-time-machine-bot
```

## Available Commands

### User Commands

- `/start` - Initialize bot and show welcome message
- `/help` - Display help information
- `/today` - Show what happened today in F1 history
- `/day YYYY-MM-DD` - Show events on specific date
- `/race [round]` - Display race results
- `/standings [round]` - Show championship standings
- `/subscribe` - Enable daily digests
- `/unsubscribe` - Disable daily digests
- `/settings` - Configure user preferences

## Architecture

```
bot/
├── bot/
│   ├── handlers/         # Command and callback handlers
│   ├── scheduler/        # Daily broadcast jobs
│   ├── services/         # API client and message formatting
│   ├── keyboards/        # Keyboard builders
│   ├── config.py         # Configuration management
│   └── main.py          # Application entry point
├── tests/               # Test suite
├── Dockerfile          # Docker configuration
└── requirements.txt    # Python dependencies
```

## Configuration

All configuration is managed through environment variables or `.env` file:

| Variable | Description | Default |
|----------|-------------|---------|
| `TELEGRAM_BOT_TOKEN` | Bot token from BotFather | Required |
| `TELEGRAM_WEBHOOK_URL` | Webhook URL for production | "" (polling mode) |
| `BACKEND_API_URL` | Backend API endpoint | http://localhost:8000/api/v1 |
| `BOT_ADMIN_CHAT_ID` | Admin chat ID for notifications | 0 |
| `DEFAULT_TIMEZONE` | Default user timezone | Europe/Moscow |
| `DEFAULT_SEND_TIME` | Default daily send time | 09:00 |
| `DAILY_BROADCAST_HOUR` | Broadcast hour (UTC) | 6 |
| `MESSAGE_RATE_LIMIT` | Delay between messages (seconds) | 0.05 |

## Daily Broadcast

The bot automatically sends daily digests at the configured time. The scheduler:

1. Fetches today's historical F1 events from the backend
2. Retrieves all active subscribers
3. Formats and sends messages to each subscriber
4. Handles blocked users by deactivating them
5. Logs statistics and notifies admin

Schedule is configured via `DAILY_BROADCAST_HOUR` and `DAILY_BROADCAST_MINUTE` (UTC time).

## Development

### Running Tests

```bash
pytest
```

### Code Structure

- **Handlers**: Process commands and callback queries
- **Scheduler**: Manages timed jobs (daily broadcasts)
- **Services**: Business logic (API client, message formatting)
- **Keyboards**: Build Telegram inline/reply keyboards

### Adding New Commands

1. Create handler in `bot/handlers/`
2. Register in `bot/main.py`
3. Add keyboard button if needed
4. Update help text

## Production Deployment

For production use:

1. Set up webhook mode for better performance
2. Configure admin notifications
3. Set up monitoring and logging
4. Use environment-specific `.env` files
5. Deploy with Docker Compose alongside backend

## License

Part of the F1 Time Machine project.
