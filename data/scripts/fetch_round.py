"""
Per-round fetching of F1 session results.

Supports:
- Race results (Jolpica API)
- Qualifying results (Jolpica API)
- Sprint results (Jolpica API)
- Practice / Sprint Qualifying results (OpenF1 API)
- Driver & Constructor standings (Jolpica API)
"""
import time
from typing import Any, Dict, List, Optional, Tuple

import httpx

from common import (
    BASE_API_URL, fetch_with_cache, fetch_fresh, get_db_connection,
    ensure_driver, ensure_constructor, ensure_status, get_season_id, RAW_DIR
)

OPENF1_BASE_URL = "https://api.openf1.org/v1"
OPENF1_RATE_LIMIT = 0.5

_openf1_last_request_time = 0.0


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _openf1_get(path: str, params: Optional[Dict[str, Any]] = None) -> Any:
    """Fetch from OpenF1 API with rate limiting (no caching)."""
    global _openf1_last_request_time

    elapsed = time.time() - _openf1_last_request_time
    if elapsed < OPENF1_RATE_LIMIT:
        time.sleep(OPENF1_RATE_LIMIT - elapsed)

    url = f"{OPENF1_BASE_URL}{path}"
    print(f"  Fetching OpenF1: {url} params={params}")
    with httpx.Client(timeout=30.0) as client:
        resp = client.get(url, params=params)
        resp.raise_for_status()
        data = resp.json()

    _openf1_last_request_time = time.time()
    return data


def _openf1_get_cached(path: str, params: Optional[Dict[str, Any]] = None,
                       cache_name: Optional[str] = None) -> Any:
    """Fetch from OpenF1 API with caching and rate limiting."""
    global _openf1_last_request_time

    if cache_name:
        cache_path = RAW_DIR / cache_name
        if cache_path.exists() and cache_path.stat().st_size > 0:
            import json
            print(f"  Using cached data: {cache_name}")
            with open(cache_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        elif cache_path.exists():
            print(f"  Removing empty cache file: {cache_name}")
            cache_path.unlink()

    elapsed = time.time() - _openf1_last_request_time
    if elapsed < OPENF1_RATE_LIMIT:
        time.sleep(OPENF1_RATE_LIMIT - elapsed)

    url = f"{OPENF1_BASE_URL}{path}"
    print(f"  Fetching OpenF1: {url} params={params}")
    with httpx.Client(timeout=30.0) as client:
        resp = client.get(url, params=params)
        resp.raise_for_status()
        data = resp.json()

    _openf1_last_request_time = time.time()

    if cache_name:
        import json
        RAW_DIR.mkdir(parents=True, exist_ok=True)
        with open(RAW_DIR / cache_name, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    return data


def _seconds_to_lap_time(seconds: float) -> str:
    """Convert seconds (e.g. 92.869) to lap time string '1:32.869'."""
    if seconds is None or seconds <= 0:
        return ""
    minutes = int(seconds // 60)
    remainder = seconds - minutes * 60
    return f"{minutes}:{remainder:06.3f}"


def _build_openf1_driver_map(cursor, season_id: int) -> Dict[int, Tuple[int, int]]:
    """
    Build mapping from car_number -> (driver_id, constructor_id)
    using season_entries table.

    Returns:
        Dict mapping car_number to (driver_id, constructor_id)
    """
    cursor.execute("""
        SELECT car_number, driver_id, constructor_id
        FROM season_entries
        WHERE season_id = ? AND is_test_driver = 0
    """, (season_id,))
    return {row[0]: (row[1], row[2]) for row in cursor.fetchall()}


def _resolve_openf1_session_key(year: int, country_name: str,
                                session_name: str) -> Optional[int]:
    """
    Find OpenF1 session_key for a given session.

    Args:
        year: Season year
        country_name: Country name (e.g. 'Australia')
        session_name: OpenF1 session name (e.g. 'Practice 1', 'Sprint Qualifying')

    Returns:
        session_key or None
    """
    sessions = _openf1_get("/sessions", params={
        "year": year,
        "session_name": session_name,
        "country_name": country_name,
    })
    if sessions and isinstance(sessions, list) and len(sessions) > 0:
        return sessions[0].get("session_key")
    return None


def _get_race_country(cursor, season_id: int, round_num: int) -> Optional[str]:
    """Get country name for a race round from the circuit data."""
    cursor.execute("""
        SELECT c.country
        FROM races r
        JOIN circuits c ON r.circuit_id = c.id
        WHERE r.season_id = ? AND r.round = ?
    """, (season_id, round_num))
    row = cursor.fetchone()
    return row[0] if row else None


# Session type -> OpenF1 session_name mapping
OPENF1_SESSION_NAMES = {
    'FP1': 'Practice 1',
    'FP2': 'Practice 2',
    'FP3': 'Practice 3',
    'SQ': 'Sprint Qualifying',
}


# ---------------------------------------------------------------------------
# Race results (Jolpica)
# ---------------------------------------------------------------------------

def fetch_race_results_for_round(year: int, round_num: int) -> int:
    """
    Fetch and store race results for a specific round.

    Returns:
        Number of results inserted
    """
    print(f"\nFetching race results for {year} round {round_num}...")

    url = f"{BASE_API_URL}/{year}/{round_num}/results.json"
    cache_name = f"results_{year}_round_{round_num}.json"
    data = fetch_with_cache(url, cache_name)

    races = data.get('MRData', {}).get('RaceTable', {}).get('Races', [])
    if not races:
        print(f"  No race results available for round {round_num}")
        return 0

    race_data = races[0]
    results = race_data.get('Results', [])
    if not results:
        print(f"  Empty results for round {round_num}")
        return 0

    conn = get_db_connection()
    cursor = conn.cursor()
    count = 0

    try:
        season_id = get_season_id(cursor, year)
        if not season_id:
            print(f"  Error: Season {year} not found.")
            return 0

        # Get race_id and session_id
        cursor.execute(
            "SELECT id FROM races WHERE season_id = ? AND round = ?",
            (season_id, round_num)
        )
        race_row = cursor.fetchone()
        if not race_row:
            print(f"  Warning: Race round {round_num} not found")
            return 0
        race_id = race_row[0]

        cursor.execute(
            "SELECT id FROM sessions WHERE race_id = ? AND type = 'R'",
            (race_id,)
        )
        session_row = cursor.fetchone()
        if not session_row:
            print(f"  Warning: Race session not found for round {round_num}")
            return 0
        session_id = session_row[0]

        for result in results:
            driver_id = ensure_driver(cursor, result['Driver'])
            constructor_id = ensure_constructor(cursor, result['Constructor'])
            status_id = ensure_status(cursor, result.get('status', 'Finished'))

            fastest_lap_data = result.get('FastestLap', {})
            fastest_lap_num = fastest_lap_data.get('lap')
            fastest_lap_rank = fastest_lap_data.get('rank')
            fastest_lap_time = fastest_lap_data.get('Time', {}).get('time')
            fastest_lap_speed = fastest_lap_data.get('AverageSpeed', {}).get('speed')

            finish_time = result.get('Time', {}).get('time')
            finish_time_ms = result.get('Time', {}).get('millis')

            cursor.execute("""
                INSERT OR REPLACE INTO results (
                    session_id, driver_id, constructor_id, car_number,
                    grid_position, position, position_text, position_order,
                    points, laps_completed, finish_time, finish_time_ms,
                    fastest_lap, fastest_lap_rank, fastest_lap_time, fastest_lap_speed,
                    status_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                session_id, driver_id, constructor_id,
                result.get('number'),
                result.get('grid'),
                result.get('position'),
                result.get('positionText'),
                result.get('position'),
                float(result.get('points', 0)),
                result.get('laps'),
                finish_time, finish_time_ms,
                fastest_lap_num, fastest_lap_rank,
                fastest_lap_time, fastest_lap_speed,
                status_id
            ))
            count += 1

        conn.commit()
        print(f"  Inserted {count} race results for round {round_num}")

    except Exception as e:
        conn.rollback()
        print(f"  Error: {e}")
        raise
    finally:
        conn.close()

    return count


# ---------------------------------------------------------------------------
# Qualifying results (Jolpica)
# ---------------------------------------------------------------------------

def fetch_qualifying_for_round(year: int, round_num: int) -> int:
    """
    Fetch and store qualifying results for a specific round.

    Returns:
        Number of results inserted
    """
    print(f"\nFetching qualifying results for {year} round {round_num}...")

    url = f"{BASE_API_URL}/{year}/{round_num}/qualifying.json"
    cache_name = f"qualifying_{year}_round_{round_num}.json"
    data = fetch_with_cache(url, cache_name)

    races = data.get('MRData', {}).get('RaceTable', {}).get('Races', [])
    if not races:
        print(f"  No qualifying results available for round {round_num}")
        return 0

    race_data = races[0]
    results = race_data.get('QualifyingResults', [])
    if not results:
        print(f"  Empty qualifying results for round {round_num}")
        return 0

    conn = get_db_connection()
    cursor = conn.cursor()
    count = 0

    try:
        season_id = get_season_id(cursor, year)
        if not season_id:
            print(f"  Error: Season {year} not found.")
            return 0

        cursor.execute(
            "SELECT id FROM races WHERE season_id = ? AND round = ?",
            (season_id, round_num)
        )
        race_row = cursor.fetchone()
        if not race_row:
            print(f"  Warning: Race round {round_num} not found")
            return 0
        race_id = race_row[0]

        cursor.execute(
            "SELECT id FROM sessions WHERE race_id = ? AND type = 'Q'",
            (race_id,)
        )
        session_row = cursor.fetchone()
        if not session_row:
            print(f"  Warning: Qualifying session not found for round {round_num}")
            return 0
        session_id = session_row[0]

        for result in results:
            driver_id = ensure_driver(cursor, result['Driver'])
            constructor_id = ensure_constructor(cursor, result['Constructor'])

            cursor.execute("""
                INSERT OR REPLACE INTO results (
                    session_id, driver_id, constructor_id, car_number,
                    position, position_text, position_order,
                    q1_time, q2_time, q3_time
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                session_id, driver_id, constructor_id,
                result.get('number'),
                result.get('position'),
                result.get('position'),
                result.get('position'),
                result.get('Q1'),
                result.get('Q2'),
                result.get('Q3')
            ))
            count += 1

        conn.commit()
        print(f"  Inserted {count} qualifying results for round {round_num}")

    except Exception as e:
        conn.rollback()
        print(f"  Error: {e}")
        raise
    finally:
        conn.close()

    return count


# ---------------------------------------------------------------------------
# Sprint results (Jolpica)
# ---------------------------------------------------------------------------

def fetch_sprint_for_round(year: int, round_num: int) -> int:
    """
    Fetch and store sprint race results for a specific round.

    Returns:
        Number of results inserted
    """
    print(f"\nFetching sprint results for {year} round {round_num}...")

    url = f"{BASE_API_URL}/{year}/{round_num}/sprint.json"
    cache_name = f"sprint_{year}_round_{round_num}.json"
    data = fetch_with_cache(url, cache_name)

    races = data.get('MRData', {}).get('RaceTable', {}).get('Races', [])
    if not races:
        print(f"  No sprint results available for round {round_num}")
        return 0

    race_data = races[0]
    results = race_data.get('SprintResults', [])
    if not results:
        print(f"  Empty sprint results for round {round_num}")
        return 0

    conn = get_db_connection()
    cursor = conn.cursor()
    count = 0

    try:
        season_id = get_season_id(cursor, year)
        if not season_id:
            print(f"  Error: Season {year} not found.")
            return 0

        cursor.execute(
            "SELECT id FROM races WHERE season_id = ? AND round = ?",
            (season_id, round_num)
        )
        race_row = cursor.fetchone()
        if not race_row:
            print(f"  Warning: Race round {round_num} not found")
            return 0
        race_id = race_row[0]

        cursor.execute(
            "SELECT id FROM sessions WHERE race_id = ? AND type = 'SPRINT'",
            (race_id,)
        )
        session_row = cursor.fetchone()
        if not session_row:
            print(f"  Warning: Sprint session not found for round {round_num}")
            return 0
        session_id = session_row[0]

        for result in results:
            driver_id = ensure_driver(cursor, result['Driver'])
            constructor_id = ensure_constructor(cursor, result['Constructor'])
            status_id = ensure_status(cursor, result.get('status', 'Finished'))

            fastest_lap_data = result.get('FastestLap', {})
            fastest_lap_num = fastest_lap_data.get('lap')
            fastest_lap_rank = fastest_lap_data.get('rank')
            fastest_lap_time = fastest_lap_data.get('Time', {}).get('time')
            fastest_lap_speed = fastest_lap_data.get('AverageSpeed', {}).get('speed')

            finish_time = result.get('Time', {}).get('time')
            finish_time_ms = result.get('Time', {}).get('millis')

            cursor.execute("""
                INSERT OR REPLACE INTO results (
                    session_id, driver_id, constructor_id, car_number,
                    grid_position, position, position_text, position_order,
                    points, laps_completed, finish_time, finish_time_ms,
                    fastest_lap, fastest_lap_rank, fastest_lap_time, fastest_lap_speed,
                    status_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                session_id, driver_id, constructor_id,
                result.get('number'),
                result.get('grid'),
                result.get('position'),
                result.get('positionText'),
                result.get('position'),
                float(result.get('points', 0)),
                result.get('laps'),
                finish_time, finish_time_ms,
                fastest_lap_num, fastest_lap_rank,
                fastest_lap_time, fastest_lap_speed,
                status_id
            ))
            count += 1

        conn.commit()
        print(f"  Inserted {count} sprint results for round {round_num}")

    except Exception as e:
        conn.rollback()
        print(f"  Error: {e}")
        raise
    finally:
        conn.close()

    return count


# ---------------------------------------------------------------------------
# Practice / Sprint Qualifying results (OpenF1)
# ---------------------------------------------------------------------------

def fetch_practice_for_round(year: int, round_num: int, session_type: str) -> int:
    """
    Fetch and store practice or sprint qualifying results via OpenF1 API.

    Workflow:
    1. Find session_key via /v1/sessions
    2. Get all laps via /v1/laps?session_key=...
    3. For each driver, pick the best lap_duration (min, excluding None)
    4. Rank by best time → positions
    5. Map driver_number → (driver_id, constructor_id) via season_entries
    6. INSERT OR REPLACE into results

    Args:
        year: Season year
        round_num: Race round number
        session_type: One of 'FP1', 'FP2', 'FP3', 'SQ'

    Returns:
        Number of results inserted
    """
    print(f"\nFetching {session_type} results for {year} round {round_num} via OpenF1...")

    conn = get_db_connection()
    cursor = conn.cursor()
    count = 0

    try:
        season_id = get_season_id(cursor, year)
        if not season_id:
            print(f"  Error: Season {year} not found.")
            return 0

        # Get country name for this round
        country = _get_race_country(cursor, season_id, round_num)
        if not country:
            print(f"  Error: Cannot determine country for round {round_num}")
            return 0

        # Resolve OpenF1 session name
        openf1_session_name = OPENF1_SESSION_NAMES.get(session_type)
        if not openf1_session_name:
            print(f"  Error: Unknown session type '{session_type}' for OpenF1")
            return 0

        # Find session_key
        session_key = _resolve_openf1_session_key(year, country, openf1_session_name)
        if not session_key:
            print(f"  No OpenF1 session found for {openf1_session_name} at {country} {year}")
            return 0

        print(f"  Found session_key={session_key} for {openf1_session_name} at {country}")

        # Get all laps
        cache_name = f"openf1_laps_{year}_r{round_num}_{session_type.lower()}.json"
        laps = _openf1_get_cached("/laps", params={"session_key": session_key},
                                  cache_name=cache_name)

        if not laps:
            print(f"  No lap data found for session_key={session_key}")
            return 0

        # Find best lap for each driver
        best_laps: Dict[int, float] = {}  # driver_number -> best lap_duration
        for lap in laps:
            driver_num = lap.get("driver_number")
            duration = lap.get("lap_duration")
            if driver_num is None or duration is None or duration <= 0:
                continue
            # Filter out pit out laps (is_pit_out_lap)
            if lap.get("is_pit_out_lap", False):
                continue
            if driver_num not in best_laps or duration < best_laps[driver_num]:
                best_laps[driver_num] = duration

        if not best_laps:
            print(f"  No valid laps found")
            return 0

        # Rank by best time
        ranked = sorted(best_laps.items(), key=lambda x: x[1])

        # Build driver map from season_entries
        driver_map = _build_openf1_driver_map(cursor, season_id)

        # Get DB session_id
        cursor.execute(
            "SELECT r.id FROM races r WHERE r.season_id = ? AND r.round = ?",
            (season_id, round_num)
        )
        race_row = cursor.fetchone()
        if not race_row:
            print(f"  Warning: Race round {round_num} not found")
            return 0
        race_id = race_row[0]

        cursor.execute(
            "SELECT id FROM sessions WHERE race_id = ? AND type = ?",
            (race_id, session_type)
        )
        session_row = cursor.fetchone()
        if not session_row:
            print(f"  Warning: {session_type} session not found for round {round_num}")
            return 0
        session_id = session_row[0]

        # Insert results
        finished_status_id = ensure_status(cursor, "Finished")

        for position, (driver_num, best_time) in enumerate(ranked, start=1):
            mapping = driver_map.get(driver_num)
            if not mapping:
                print(f"  Warning: No season_entry for car #{driver_num}, skipping")
                continue

            driver_id, constructor_id = mapping
            lap_time_str = _seconds_to_lap_time(best_time)

            cursor.execute("""
                INSERT OR REPLACE INTO results (
                    session_id, driver_id, constructor_id, car_number,
                    position, position_text, position_order,
                    fastest_lap_time, status_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                session_id, driver_id, constructor_id, driver_num,
                position, str(position), position,
                lap_time_str, finished_status_id
            ))
            count += 1

        conn.commit()
        print(f"  Inserted {count} {session_type} results for round {round_num}")

    except Exception as e:
        conn.rollback()
        print(f"  Error fetching {session_type} for round {round_num}: {e}")
        raise
    finally:
        conn.close()

    return count


# ---------------------------------------------------------------------------
# Standings (Jolpica)
# ---------------------------------------------------------------------------

def fetch_standings_for_round(year: int, round_num: int) -> int:
    """
    Fetch driver and constructor standings after a specific round.
    Deletes any existing (potentially empty) cache first.

    Returns:
        Total standings entries inserted
    """
    print(f"\nFetching standings for {year} round {round_num}...")

    conn = get_db_connection()
    cursor = conn.cursor()
    total = 0

    try:
        season_id = get_season_id(cursor, year)
        if not season_id:
            print(f"  Error: Season {year} not found.")
            return 0

        cursor.execute(
            "SELECT id FROM races WHERE season_id = ? AND round = ?",
            (season_id, round_num)
        )
        race_row = cursor.fetchone()
        if not race_row:
            print(f"  Warning: Race round {round_num} not found")
            return 0
        race_id = race_row[0]

        # --- Driver standings ---
        ds_cache = f"driver_standings_{year}_round_{round_num}.json"
        ds_url = f"{BASE_API_URL}/{year}/{round_num}/driverStandings.json"
        data = fetch_fresh(ds_url, ds_cache)

        standings_lists = data.get('MRData', {}).get('StandingsTable', {}).get('StandingsLists', [])
        if standings_lists:
            for standing in standings_lists[0].get('DriverStandings', []):
                driver_id = ensure_driver(cursor, standing['Driver'])
                cursor.execute("""
                    INSERT OR REPLACE INTO driver_standings (
                        race_id, driver_id, points, position, position_text, wins
                    ) VALUES (?, ?, ?, ?, ?, ?)
                """, (
                    race_id, driver_id,
                    float(standing.get('points', 0)),
                    int(standing.get('position', 0)),
                    standing.get('positionText'),
                    int(standing.get('wins', 0))
                ))
                total += 1

        # --- Constructor standings ---
        cs_cache = f"constructor_standings_{year}_round_{round_num}.json"
        cs_url = f"{BASE_API_URL}/{year}/{round_num}/constructorStandings.json"
        data = fetch_fresh(cs_url, cs_cache)

        standings_lists = data.get('MRData', {}).get('StandingsTable', {}).get('StandingsLists', [])
        if standings_lists:
            for standing in standings_lists[0].get('ConstructorStandings', []):
                constructor_id = ensure_constructor(cursor, standing['Constructor'])
                cursor.execute("""
                    INSERT OR REPLACE INTO constructor_standings (
                        race_id, constructor_id, points, position, position_text, wins
                    ) VALUES (?, ?, ?, ?, ?, ?)
                """, (
                    race_id, constructor_id,
                    float(standing.get('points', 0)),
                    int(standing.get('position', 0)),
                    standing.get('positionText'),
                    int(standing.get('wins', 0))
                ))
                total += 1

        conn.commit()
        print(f"  Inserted {total} standings entries for round {round_num}")

    except Exception as e:
        conn.rollback()
        print(f"  Error: {e}")
        raise
    finally:
        conn.close()

    return total


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Fetch results for a specific round")
    parser.add_argument("--year", type=int, required=True)
    parser.add_argument("--round", type=int, required=True)
    parser.add_argument("--type", choices=["R", "Q", "SPRINT", "FP1", "FP2", "FP3", "SQ"],
                        help="Session type (default: all available)")
    args = parser.parse_args()

    session_type = args.type

    if session_type is None or session_type == "R":
        fetch_race_results_for_round(args.year, args.round)
    if session_type is None or session_type == "Q":
        fetch_qualifying_for_round(args.year, args.round)
    if session_type is None or session_type == "SPRINT":
        fetch_sprint_for_round(args.year, args.round)
    if session_type is None or session_type in ("FP1", "FP2", "FP3", "SQ"):
        if session_type:
            fetch_practice_for_round(args.year, args.round, session_type)
        else:
            for st in ("FP1", "FP2", "FP3", "SQ"):
                fetch_practice_for_round(args.year, args.round, st)
    if session_type is None or session_type == "R":
        fetch_standings_for_round(args.year, args.round)
