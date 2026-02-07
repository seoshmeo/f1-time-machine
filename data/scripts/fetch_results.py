"""
Fetch race results and qualifying results from Jolpica F1 API.
"""
from typing import Dict, List

from common import (
    BASE_API_URL, fetch_with_cache, get_db_connection,
    ensure_driver, ensure_constructor, ensure_status, get_season_id
)


def time_to_milliseconds(time_str: str) -> int:
    """
    Convert time string to milliseconds.

    Args:
        time_str: Time in format "1:34:50.616" or "1:34.123"

    Returns:
        Time in milliseconds
    """
    if not time_str:
        return 0

    try:
        parts = time_str.split(':')
        if len(parts) == 3:  # H:M:S.ms
            hours = int(parts[0])
            minutes = int(parts[1])
            seconds = float(parts[2])
            total_ms = (hours * 3600 + minutes * 60) * 1000 + int(seconds * 1000)
        elif len(parts) == 2:  # M:S.ms
            minutes = int(parts[0])
            seconds = float(parts[1])
            total_ms = minutes * 60 * 1000 + int(seconds * 1000)
        else:
            total_ms = 0
        return total_ms
    except:
        return 0


def fetch_race_results(year: int) -> None:
    """
    Fetch and store race results for a season.

    Args:
        year: Season year (e.g., 2010)
    """
    print(f"\nFetching race results for {year} season...")

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        season_id = get_season_id(cursor, year)
        if not season_id:
            print(f"  Error: Season {year} not found.")
            return

        # Fetch all results (paginated)
        offset = 0
        limit = 100
        all_results = []

        while True:
            url = f"{BASE_API_URL}/{year}/results.json?limit={limit}&offset={offset}"
            data = fetch_with_cache(url, f"results_{year}_offset_{offset}.json")

            races = data.get('MRData', {}).get('RaceTable', {}).get('Races', [])
            if not races:
                break

            all_results.extend(races)
            offset += limit

            # Check if we got all results
            total = int(data.get('MRData', {}).get('total', '0'))
            if offset >= total:
                break

        print(f"  Found results for {len(all_results)} races")

        # Process each race
        results_count = 0
        for race_data in all_results:
            round_num = int(race_data['round'])

            # Get race_id
            cursor.execute(
                "SELECT id FROM races WHERE season_id = ? AND round = ?",
                (season_id, round_num)
            )
            race_row = cursor.fetchone()
            if not race_row:
                print(f"  Warning: Race round {round_num} not found, skipping")
                continue
            race_id = race_row[0]

            # Get race session_id (type = 'R')
            cursor.execute(
                "SELECT id FROM sessions WHERE race_id = ? AND type = 'R'",
                (race_id,)
            )
            session_row = cursor.fetchone()
            if not session_row:
                print(f"  Warning: Race session for round {round_num} not found, skipping")
                continue
            session_id = session_row[0]

            # Process results
            results = race_data.get('Results', [])
            for result in results:
                # Ensure driver and constructor exist
                driver_id = ensure_driver(cursor, result['Driver'])
                constructor_id = ensure_constructor(cursor, result['Constructor'])

                # Get status_id
                status_str = result.get('status', 'Finished')
                status_id = ensure_status(cursor, status_str)

                # Extract fastest lap data
                fastest_lap_data = result.get('FastestLap', {})
                fastest_lap_num = fastest_lap_data.get('lap')
                fastest_lap_rank = fastest_lap_data.get('rank')
                fastest_lap_time = fastest_lap_data.get('Time', {}).get('time')
                fastest_lap_speed = fastest_lap_data.get('AverageSpeed', {}).get('speed')

                # Extract time data
                finish_time = result.get('Time', {}).get('time')
                finish_time_ms = result.get('Time', {}).get('millis')

                # Insert result
                cursor.execute("""
                    INSERT OR REPLACE INTO results (
                        session_id, driver_id, constructor_id, car_number,
                        grid_position, position, position_text, position_order,
                        points, laps_completed, finish_time, finish_time_ms,
                        fastest_lap, fastest_lap_rank, fastest_lap_time, fastest_lap_speed,
                        status_id
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    session_id,
                    driver_id,
                    constructor_id,
                    result.get('number'),
                    result.get('grid'),
                    result.get('position'),
                    result.get('positionText'),
                    result.get('position'),
                    float(result.get('points', 0)),
                    result.get('laps'),
                    finish_time,
                    finish_time_ms,
                    fastest_lap_num,
                    fastest_lap_rank,
                    fastest_lap_time,
                    fastest_lap_speed,
                    status_id
                ))

                results_count += 1

        conn.commit()
        print(f"  Inserted {results_count} race results")

    except Exception as e:
        conn.rollback()
        print(f"  Error: {e}")
        raise
    finally:
        conn.close()


def fetch_qualifying_results(year: int) -> None:
    """
    Fetch and store qualifying results for a season.

    Args:
        year: Season year (e.g., 2010)
    """
    print(f"\nFetching qualifying results for {year} season...")

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        season_id = get_season_id(cursor, year)
        if not season_id:
            print(f"  Error: Season {year} not found.")
            return

        # Fetch all qualifying results (paginated)
        offset = 0
        limit = 100
        all_results = []

        while True:
            url = f"{BASE_API_URL}/{year}/qualifying.json?limit={limit}&offset={offset}"
            data = fetch_with_cache(url, f"qualifying_{year}_offset_{offset}.json")

            races = data.get('MRData', {}).get('RaceTable', {}).get('Races', [])
            if not races:
                break

            all_results.extend(races)
            offset += limit

            # Check if we got all results
            total = int(data.get('MRData', {}).get('total', '0'))
            if offset >= total:
                break

        print(f"  Found qualifying results for {len(all_results)} races")

        # Process each race
        results_count = 0
        for race_data in all_results:
            round_num = int(race_data['round'])

            # Get race_id
            cursor.execute(
                "SELECT id FROM races WHERE season_id = ? AND round = ?",
                (season_id, round_num)
            )
            race_row = cursor.fetchone()
            if not race_row:
                print(f"  Warning: Race round {round_num} not found, skipping")
                continue
            race_id = race_row[0]

            # Get qualifying session_id (type = 'Q')
            cursor.execute(
                "SELECT id FROM sessions WHERE race_id = ? AND type = 'Q'",
                (race_id,)
            )
            session_row = cursor.fetchone()
            if not session_row:
                print(f"  Warning: Qualifying session for round {round_num} not found, skipping")
                continue
            session_id = session_row[0]

            # Process qualifying results
            results = race_data.get('QualifyingResults', [])
            for result in results:
                # Ensure driver and constructor exist
                driver_id = ensure_driver(cursor, result['Driver'])
                constructor_id = ensure_constructor(cursor, result['Constructor'])

                # Insert or update result
                cursor.execute("""
                    INSERT OR REPLACE INTO results (
                        session_id, driver_id, constructor_id, car_number,
                        position, position_text, position_order,
                        q1_time, q2_time, q3_time
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    session_id,
                    driver_id,
                    constructor_id,
                    result.get('number'),
                    result.get('position'),
                    result.get('position'),
                    result.get('position'),
                    result.get('Q1'),
                    result.get('Q2'),
                    result.get('Q3')
                ))

                results_count += 1

        conn.commit()
        print(f"  Inserted {results_count} qualifying results")

    except Exception as e:
        conn.rollback()
        print(f"  Error: {e}")
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python fetch_results.py <year>")
        sys.exit(1)

    year = int(sys.argv[1])
    fetch_race_results(year)
    fetch_qualifying_results(year)
