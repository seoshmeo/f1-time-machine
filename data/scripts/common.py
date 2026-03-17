"""
Common utilities for F1 Time Machine data pipeline.
"""
import json
import sqlite3
import time
from pathlib import Path
from typing import Any, Dict, Optional

import httpx

_SCRIPTS_DIR = Path(__file__).resolve().parent
_PROJECT_ROOT = _SCRIPTS_DIR.parent.parent

DB_PATH = _PROJECT_ROOT / "db" / "f1_time_machine.db"
RAW_DIR = _PROJECT_ROOT / "data" / "raw"
CURATED_DIR = _PROJECT_ROOT / "data" / "curated"
BASE_API_URL = "https://api.jolpi.ca/ergast/f1"
RATE_LIMIT_SECONDS = 2.0

_last_request_time = 0.0


def fetch_with_cache(url: str, cache_name: str) -> Dict[str, Any]:
    """
    Fetch data from URL with caching and rate limiting.

    Args:
        url: Full URL to fetch
        cache_name: Name for cache file (e.g., 'races_2010.json')

    Returns:
        Parsed JSON response
    """
    global _last_request_time

    cache_path = RAW_DIR / cache_name

    # Return cached data if exists and is non-empty
    if cache_path.exists() and cache_path.stat().st_size > 0:
        print(f"  Using cached data: {cache_name}")
        with open(cache_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    elif cache_path.exists():
        print(f"  Removing empty cache file: {cache_name}")
        cache_path.unlink()

    # Rate limiting
    time_since_last = time.time() - _last_request_time
    if time_since_last < RATE_LIMIT_SECONDS:
        sleep_time = RATE_LIMIT_SECONDS - time_since_last
        time.sleep(sleep_time)

    # Fetch from API
    print(f"  Fetching: {url}")
    with httpx.Client(timeout=30.0) as client:
        response = client.get(url)
        response.raise_for_status()
        data = response.json()

    _last_request_time = time.time()

    # Cache the response
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    with open(cache_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    return data


def fetch_fresh(url: str, cache_name: str) -> Dict[str, Any]:
    """
    Fetch from URL, deleting any existing cache first.

    Args:
        url: Full URL to fetch
        cache_name: Name for cache file

    Returns:
        Parsed JSON response
    """
    cache_path = RAW_DIR / cache_name
    if cache_path.exists():
        cache_path.unlink()
    return fetch_with_cache(url, cache_name)


def get_db_connection() -> sqlite3.Connection:
    """
    Get database connection with foreign keys enabled.

    Returns:
        SQLite connection object
    """
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON")
    conn.row_factory = sqlite3.Row
    return conn


def ensure_driver(cursor: sqlite3.Cursor, driver_data: Dict[str, Any]) -> int:
    """
    Upsert driver and return driver_id.

    Args:
        cursor: Database cursor
        driver_data: Driver data from API (must contain driverId, givenName, familyName)

    Returns:
        driver_id
    """
    driver_ref = driver_data.get('driverId')

    # Check if exists
    cursor.execute("SELECT id FROM drivers WHERE driver_ref = ?", (driver_ref,))
    row = cursor.fetchone()
    if row:
        return row[0]

    # Insert new driver
    cursor.execute("""
        INSERT INTO drivers (
            driver_ref, number, code, first_name, last_name,
            date_of_birth, nationality, url, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    """, (
        driver_ref,
        driver_data.get('permanentNumber'),
        driver_data.get('code'),
        driver_data.get('givenName'),
        driver_data.get('familyName'),
        driver_data.get('dateOfBirth'),
        driver_data.get('nationality'),
        driver_data.get('url')
    ))

    return cursor.lastrowid


def ensure_constructor(cursor: sqlite3.Cursor, constructor_data: Dict[str, Any]) -> int:
    """
    Upsert constructor and return constructor_id.

    Args:
        cursor: Database cursor
        constructor_data: Constructor data from API (must contain constructorId, name)

    Returns:
        constructor_id
    """
    constructor_ref = constructor_data.get('constructorId')

    # Check if exists
    cursor.execute("SELECT id FROM constructors WHERE constructor_ref = ?", (constructor_ref,))
    row = cursor.fetchone()
    if row:
        return row[0]

    # Insert new constructor
    cursor.execute("""
        INSERT INTO constructors (
            constructor_ref, name, full_name, nationality, url, created_at
        ) VALUES (?, ?, ?, ?, ?, datetime('now'))
    """, (
        constructor_ref,
        constructor_data.get('name'),
        constructor_data.get('name'),  # Use name as full_name for now
        constructor_data.get('nationality'),
        constructor_data.get('url')
    ))

    return cursor.lastrowid


def ensure_status(cursor: sqlite3.Cursor, status: str) -> int:
    """
    Upsert status and return status_id.

    Args:
        cursor: Database cursor
        status: Status string

    Returns:
        status_id
    """
    # Check if exists
    cursor.execute("SELECT id FROM statuses WHERE status = ?", (status,))
    row = cursor.fetchone()
    if row:
        return row[0]

    # Insert new status
    cursor.execute("INSERT INTO statuses (status) VALUES (?)", (status,))
    return cursor.lastrowid


def ensure_circuit(cursor: sqlite3.Cursor, circuit_data: Dict[str, Any]) -> int:
    """
    Upsert circuit and return circuit_id.

    Args:
        cursor: Database cursor
        circuit_data: Circuit data from API

    Returns:
        circuit_id
    """
    circuit_ref = circuit_data.get('circuitId')

    # Check if exists
    cursor.execute("SELECT id FROM circuits WHERE circuit_ref = ?", (circuit_ref,))
    row = cursor.fetchone()
    if row:
        return row[0]

    # Extract location data
    location = circuit_data.get('Location', {})

    # Insert new circuit
    cursor.execute("""
        INSERT INTO circuits (
            circuit_ref, name, location, country, lat, lng, alt, url, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    """, (
        circuit_ref,
        circuit_data.get('circuitName'),
        location.get('locality'),
        location.get('country'),
        location.get('lat'),
        location.get('long'),
        location.get('alt'),
        circuit_data.get('url')
    ))

    return cursor.lastrowid


def get_season_id(cursor: sqlite3.Cursor, year: int) -> Optional[int]:
    """
    Get season_id for a given year.

    Args:
        cursor: Database cursor
        year: Season year

    Returns:
        season_id or None if not found
    """
    cursor.execute("SELECT id FROM seasons WHERE year = ?", (year,))
    row = cursor.fetchone()
    return row[0] if row else None


def slugify(text: str) -> str:
    """
    Create URL-friendly slug from text.

    Args:
        text: Input text

    Returns:
        Slugified string
    """
    import re
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text.strip('-')
