"""
Database schema for F1 Time Machine.
"""
from pathlib import Path
import sqlite3

SCHEMA_SQL = """
-- Drop existing tables (for reset mode)
DROP TABLE IF EXISTS event_tags;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS event_drivers;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS quotes;
DROP TABLE IF EXISTS articles;
DROP TABLE IF EXISTS calendar_days;
DROP TABLE IF EXISTS bot_subscribers;
DROP TABLE IF EXISTS season_entries;
DROP TABLE IF EXISTS constructor_standings;
DROP TABLE IF EXISTS driver_standings;
DROP TABLE IF EXISTS results;
DROP TABLE IF EXISTS statuses;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS races;
DROP TABLE IF EXISTS constructors;
DROP TABLE IF EXISTS drivers;
DROP TABLE IF EXISTS circuits;
DROP TABLE IF EXISTS seasons;

-- Seasons
CREATE TABLE seasons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER NOT NULL UNIQUE,
    name TEXT,
    url TEXT,
    start_date TEXT,
    end_date TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Circuits
CREATE TABLE circuits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    circuit_ref TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    location TEXT,
    country TEXT,
    lat REAL,
    lng REAL,
    alt REAL,
    url TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_circuits_ref ON circuits(circuit_ref);

-- Drivers
CREATE TABLE drivers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    driver_ref TEXT NOT NULL UNIQUE,
    number INTEGER,
    code TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth TEXT,
    nationality TEXT,
    url TEXT,
    photo_url TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_drivers_ref ON drivers(driver_ref);

-- Constructors
CREATE TABLE constructors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    constructor_ref TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    full_name TEXT,
    nationality TEXT,
    url TEXT,
    color_primary TEXT,
    color_secondary TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_constructors_ref ON constructors(constructor_ref);

-- Races
CREATE TABLE races (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    season_id INTEGER NOT NULL,
    round INTEGER NOT NULL,
    circuit_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    official_name TEXT,
    date TEXT NOT NULL,
    time TEXT,
    url TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (season_id) REFERENCES seasons(id) ON DELETE CASCADE,
    FOREIGN KEY (circuit_id) REFERENCES circuits(id),
    UNIQUE(season_id, round)
);

CREATE INDEX idx_races_season ON races(season_id);
CREATE INDEX idx_races_date ON races(date);

-- Sessions
CREATE TABLE sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    race_id INTEGER,
    season_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('FP1', 'FP2', 'FP3', 'Q', 'R', 'TEST', 'SPRINT')),
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT,
    circuit_id INTEGER,
    status TEXT DEFAULT 'completed',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (race_id) REFERENCES races(id) ON DELETE CASCADE,
    FOREIGN KEY (season_id) REFERENCES seasons(id) ON DELETE CASCADE,
    FOREIGN KEY (circuit_id) REFERENCES circuits(id)
);

CREATE INDEX idx_sessions_race ON sessions(race_id);
CREATE INDEX idx_sessions_season ON sessions(season_id);
CREATE INDEX idx_sessions_date ON sessions(date);
CREATE INDEX idx_sessions_type ON sessions(type);

-- Statuses
CREATE TABLE statuses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    status TEXT NOT NULL UNIQUE
);

-- Results
CREATE TABLE results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    driver_id INTEGER NOT NULL,
    constructor_id INTEGER NOT NULL,
    car_number INTEGER,
    grid_position INTEGER,
    position INTEGER,
    position_text TEXT,
    position_order INTEGER,
    points REAL DEFAULT 0,
    laps_completed INTEGER,
    finish_time TEXT,
    finish_time_ms INTEGER,
    fastest_lap INTEGER,
    fastest_lap_rank INTEGER,
    fastest_lap_time TEXT,
    fastest_lap_speed REAL,
    q1_time TEXT,
    q2_time TEXT,
    q3_time TEXT,
    status_id INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES drivers(id),
    FOREIGN KEY (constructor_id) REFERENCES constructors(id),
    FOREIGN KEY (status_id) REFERENCES statuses(id),
    UNIQUE(session_id, driver_id)
);

CREATE INDEX idx_results_session ON results(session_id);
CREATE INDEX idx_results_driver ON results(driver_id);
CREATE INDEX idx_results_constructor ON results(constructor_id);

-- Driver Standings
CREATE TABLE driver_standings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    race_id INTEGER NOT NULL,
    driver_id INTEGER NOT NULL,
    points REAL DEFAULT 0,
    position INTEGER NOT NULL,
    position_text TEXT,
    wins INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (race_id) REFERENCES races(id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES drivers(id),
    UNIQUE(race_id, driver_id)
);

CREATE INDEX idx_driver_standings_race ON driver_standings(race_id);
CREATE INDEX idx_driver_standings_driver ON driver_standings(driver_id);

-- Constructor Standings
CREATE TABLE constructor_standings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    race_id INTEGER NOT NULL,
    constructor_id INTEGER NOT NULL,
    points REAL DEFAULT 0,
    position INTEGER NOT NULL,
    position_text TEXT,
    wins INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (race_id) REFERENCES races(id) ON DELETE CASCADE,
    FOREIGN KEY (constructor_id) REFERENCES constructors(id),
    UNIQUE(race_id, constructor_id)
);

CREATE INDEX idx_constructor_standings_race ON constructor_standings(race_id);
CREATE INDEX idx_constructor_standings_constructor ON constructor_standings(constructor_id);

-- Season Entries
CREATE TABLE season_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    season_id INTEGER NOT NULL,
    driver_id INTEGER NOT NULL,
    constructor_id INTEGER NOT NULL,
    car_number INTEGER,
    is_test_driver INTEGER DEFAULT 0,
    FOREIGN KEY (season_id) REFERENCES seasons(id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES drivers(id),
    FOREIGN KEY (constructor_id) REFERENCES constructors(id),
    UNIQUE(season_id, driver_id, constructor_id)
);

CREATE INDEX idx_season_entries_season ON season_entries(season_id);
CREATE INDEX idx_season_entries_driver ON season_entries(driver_id);
CREATE INDEX idx_season_entries_constructor ON season_entries(constructor_id);

-- Calendar Days
CREATE TABLE calendar_days (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    season_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    day_type TEXT DEFAULT 'off',
    race_id INTEGER,
    description TEXT,
    has_content INTEGER DEFAULT 0,
    FOREIGN KEY (season_id) REFERENCES seasons(id) ON DELETE CASCADE,
    FOREIGN KEY (race_id) REFERENCES races(id) ON DELETE SET NULL,
    UNIQUE(season_id, date)
);

CREATE INDEX idx_calendar_days_season ON calendar_days(season_id);
CREATE INDEX idx_calendar_days_date ON calendar_days(date);
CREATE INDEX idx_calendar_days_type ON calendar_days(day_type);

-- Events
CREATE TABLE events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day_id INTEGER NOT NULL,
    season_id INTEGER NOT NULL,
    session_id INTEGER,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    detail TEXT,
    importance INTEGER DEFAULT 3 CHECK(importance >= 1 AND importance <= 5),
    sort_order INTEGER DEFAULT 0,
    source_url TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (day_id) REFERENCES calendar_days(id) ON DELETE CASCADE,
    FOREIGN KEY (season_id) REFERENCES seasons(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL
);

CREATE INDEX idx_events_day ON events(day_id);
CREATE INDEX idx_events_season ON events(season_id);
CREATE INDEX idx_events_session ON events(session_id);

-- Event Drivers (many-to-many)
CREATE TABLE event_drivers (
    event_id INTEGER NOT NULL,
    driver_id INTEGER NOT NULL,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE,
    PRIMARY KEY (event_id, driver_id)
);

CREATE INDEX idx_event_drivers_event ON event_drivers(event_id);
CREATE INDEX idx_event_drivers_driver ON event_drivers(driver_id);

-- Articles
CREATE TABLE articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day_id INTEGER NOT NULL,
    season_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    lead TEXT,
    body TEXT,
    source TEXT,
    source_url TEXT,
    author TEXT,
    language TEXT DEFAULT 'ru',
    published_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (day_id) REFERENCES calendar_days(id) ON DELETE CASCADE,
    FOREIGN KEY (season_id) REFERENCES seasons(id) ON DELETE CASCADE,
    UNIQUE(season_id, slug)
);

CREATE INDEX idx_articles_day ON articles(day_id);
CREATE INDEX idx_articles_season ON articles(season_id);
CREATE INDEX idx_articles_slug ON articles(slug);

-- Quotes
CREATE TABLE quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day_id INTEGER NOT NULL,
    season_id INTEGER NOT NULL,
    driver_id INTEGER,
    author_name TEXT NOT NULL,
    author_role TEXT,
    text TEXT NOT NULL,
    context TEXT,
    source TEXT,
    source_url TEXT,
    language TEXT DEFAULT 'ru',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (day_id) REFERENCES calendar_days(id) ON DELETE CASCADE,
    FOREIGN KEY (season_id) REFERENCES seasons(id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL
);

CREATE INDEX idx_quotes_day ON quotes(day_id);
CREATE INDEX idx_quotes_season ON quotes(season_id);
CREATE INDEX idx_quotes_driver ON quotes(driver_id);

-- Tags
CREATE TABLE tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE
);

CREATE INDEX idx_tags_slug ON tags(slug);

-- Event Tags (many-to-many)
CREATE TABLE event_tags (
    event_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (event_id, tag_id)
);

CREATE INDEX idx_event_tags_event ON event_tags(event_id);
CREATE INDEX idx_event_tags_tag ON event_tags(tag_id);

-- Bot Subscribers
CREATE TABLE bot_subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id INTEGER NOT NULL UNIQUE,
    chat_id INTEGER NOT NULL,
    username TEXT,
    first_name TEXT,
    language TEXT DEFAULT 'ru',
    timezone TEXT DEFAULT 'Europe/Moscow',
    send_time TEXT DEFAULT '09:00',
    is_active INTEGER DEFAULT 1,
    season_filter TEXT,
    subscribed_at TEXT DEFAULT (datetime('now')),
    last_message_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_bot_subscribers_telegram ON bot_subscribers(telegram_id);
CREATE INDEX idx_bot_subscribers_active ON bot_subscribers(is_active);
"""


def create_schema(db_path: Path, reset: bool = False) -> None:
    """
    Create database schema.

    Args:
        db_path: Path to database file
        reset: If True, drop all tables before creating
    """
    db_path.parent.mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA foreign_keys = ON")

    try:
        if reset:
            print("Dropping existing tables...")

        # Execute schema
        conn.executescript(SCHEMA_SQL)
        conn.commit()

        print(f"Schema created successfully at: {db_path}")

    except sqlite3.Error as e:
        print(f"Error creating schema: {e}")
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    import sys
    from common import DB_PATH

    reset = "--reset" in sys.argv
    create_schema(DB_PATH, reset=reset)
