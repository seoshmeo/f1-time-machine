"""
Fetch race calendar for a season from Jolpica F1 API.
"""
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Set

from common import (
    BASE_API_URL, DB_PATH, fetch_with_cache, get_db_connection,
    ensure_circuit
)

# Sprint weekend rounds by year (round numbers that have sprint format)
SPRINT_ROUNDS: Dict[int, Set[int]] = {
    2026: {2, 6, 7, 11, 14, 18},  # China, Miami, Canada, Britain, Netherlands, Singapore
}


def parse_date(date_str: str) -> datetime:
    """Parse ISO date string to datetime."""
    return datetime.strptime(date_str, "%Y-%m-%d")


def generate_session_schedule(race_date: str, race_time: str = None,
                              year: int = 2010, has_sprint: bool = False) -> List[Tuple[str, str, str, str]]:
    """
    Generate session schedule for a race weekend.

    Args:
        race_date: Race date (Sunday) in YYYY-MM-DD format
        race_time: Race time (optional)
        year: Season year (affects session times)
        has_sprint: Whether this is a sprint weekend

    Returns:
        List of (session_type, session_name, date, time) tuples
    """
    race_dt = parse_date(race_date)

    friday = race_dt - timedelta(days=2)
    saturday = race_dt - timedelta(days=1)
    sunday = race_dt

    if has_sprint:
        # Sprint weekend format:
        # Friday: FP1, Sprint Qualifying
        # Saturday: Sprint Race, Qualifying
        # Sunday: Race
        sessions = [
            ('FP1', 'Free Practice 1', friday.strftime("%Y-%m-%d"), '13:30:00'),
            ('SQ', 'Sprint Qualifying', friday.strftime("%Y-%m-%d"), '17:30:00'),
            ('SPRINT', 'Sprint', saturday.strftime("%Y-%m-%d"), '12:00:00'),
            ('Q', 'Qualifying', saturday.strftime("%Y-%m-%d"), '16:00:00'),
            ('R', 'Race', sunday.strftime("%Y-%m-%d"), race_time or '15:00:00'),
        ]
    elif year >= 2016:
        # Modern weekend schedule with later session times
        sessions = [
            ('FP1', 'Free Practice 1', friday.strftime("%Y-%m-%d"), '13:30:00'),
            ('FP2', 'Free Practice 2', friday.strftime("%Y-%m-%d"), '17:00:00'),
            ('FP3', 'Free Practice 3', saturday.strftime("%Y-%m-%d"), '12:30:00'),
            ('Q', 'Qualifying', saturday.strftime("%Y-%m-%d"), '16:00:00'),
            ('R', 'Race', sunday.strftime("%Y-%m-%d"), race_time or '15:00:00'),
        ]
    else:
        # Classic weekend schedule (2010 era)
        sessions = [
            ('FP1', 'Free Practice 1', friday.strftime("%Y-%m-%d"), '10:00:00'),
            ('FP2', 'Free Practice 2', friday.strftime("%Y-%m-%d"), '14:00:00'),
            ('FP3', 'Free Practice 3', saturday.strftime("%Y-%m-%d"), '11:00:00'),
            ('Q', 'Qualifying', saturday.strftime("%Y-%m-%d"), '14:00:00'),
            ('R', 'Race', sunday.strftime("%Y-%m-%d"), race_time or '14:00:00'),
        ]

    return sessions


def fetch_season_races(year: int) -> None:
    """
    Fetch and store race calendar for a season.

    Args:
        year: Season year (e.g., 2010)
    """
    print(f"\nFetching races for {year} season...")

    # Fetch race calendar
    url = f"{BASE_API_URL}/{year}.json?limit=100"
    data = fetch_with_cache(url, f"races_{year}.json")

    races_data = data.get('MRData', {}).get('RaceTable', {}).get('Races', [])
    print(f"  Found {len(races_data)} races")

    if not races_data:
        print("  No races found!")
        return

    # Determine season date range
    season_start = min(r['date'] for r in races_data)
    season_end = max(r['date'] for r in races_data)

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Insert or update season
        cursor.execute("""
            INSERT INTO seasons (year, name, start_date, end_date, url)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(year) DO UPDATE SET
                start_date = excluded.start_date,
                end_date = excluded.end_date,
                updated_at = datetime('now')
        """, (
            year,
            f"{year} Formula 1 Season",
            season_start,
            season_end,
            f"https://en.wikipedia.org/wiki/{year}_Formula_One_World_Championship"
        ))

        season_id = cursor.execute("SELECT id FROM seasons WHERE year = ?", (year,)).fetchone()[0]

        # Process each race
        for race in races_data:
            round_num = int(race['round'])
            circuit_data = race['Circuit']

            # Ensure circuit exists
            circuit_id = ensure_circuit(cursor, circuit_data)

            # Insert or update race
            cursor.execute("""
                INSERT INTO races (
                    season_id, round, circuit_id, name, official_name,
                    date, time, url
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(season_id, round) DO UPDATE SET
                    circuit_id = excluded.circuit_id,
                    name = excluded.name,
                    date = excluded.date,
                    time = excluded.time,
                    updated_at = datetime('now')
            """, (
                season_id,
                round_num,
                circuit_id,
                race['raceName'],
                race['raceName'],
                race['date'],
                race.get('time'),
                race.get('url')
            ))

            race_id = cursor.execute(
                "SELECT id FROM races WHERE season_id = ? AND round = ?",
                (season_id, round_num)
            ).fetchone()[0]

            # Generate sessions for this race
            has_sprint = (round_num in SPRINT_ROUNDS.get(year, set()) or
                          'Sprint' in race.get('raceName', ''))
            sessions = generate_session_schedule(race['date'], race.get('time'),
                                                  year=year, has_sprint=has_sprint)

            for session_type, session_name, session_date, session_time in sessions:
                cursor.execute("""
                    INSERT OR IGNORE INTO sessions (
                        race_id, season_id, type, name, date, time, circuit_id, status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'completed')
                """, (
                    race_id,
                    season_id,
                    session_type,
                    session_name,
                    session_date,
                    session_time,
                    circuit_id
                ))

        conn.commit()
        print(f"  Inserted {len(races_data)} races with sessions")

    except Exception as e:
        conn.rollback()
        print(f"  Error: {e}")
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python fetch_races.py <year>")
        sys.exit(1)

    year = int(sys.argv[1])
    fetch_season_races(year)
