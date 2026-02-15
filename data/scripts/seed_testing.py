"""
Seed pre-season testing data into the SQLite database from curated JSON files.
"""
import argparse
import json
from pathlib import Path
from typing import Optional

from common import get_db_connection, get_season_id, CURATED_DIR


def parse_lap_time(lap_time_str: Optional[str]) -> Optional[int]:
    """
    Convert lap time string like "1:34.669" to milliseconds.

    Args:
        lap_time_str: Lap time in format "M:SS.mmm" or None

    Returns:
        Lap time in milliseconds or None
    """
    if not lap_time_str:
        return None

    try:
        # Split on colon to get minutes and seconds
        parts = lap_time_str.split(':')
        if len(parts) != 2:
            return None

        minutes = int(parts[0])
        seconds = float(parts[1])

        total_ms = (minutes * 60 * 1000) + int(seconds * 1000)
        return total_ms
    except (ValueError, IndexError):
        return None


def seed_testing(year: int) -> None:
    """
    Seed pre-season testing data from curated JSON files.

    Finds all testing_{year}_*.json files in CURATED_DIR and imports them.
    Creates sessions with type='TEST' and race_id=NULL.
    Updates season start_date if testing dates are earlier.

    Expected JSON format:
    {
        "event_name": "Bahrain Pre-Season Test 1",
        "circuit_ref": "bahrain",
        "circuit_name": "...",
        "location": "...",
        "start_date": "2026-02-11",
        "end_date": "2026-02-13",
        "days": [
            {
                "date": "2026-02-11",
                "day_number": 1,
                "notes": "...",
                "results": [
                    {
                        "position": 1,
                        "driver_ref": "norris",
                        "constructor_ref": "mclaren",
                        "fastest_lap_time": "1:34.669",
                        "laps_completed": 58
                    }
                ]
            }
        ]
    }

    Args:
        year: Season year (e.g., 2026)
    """
    print(f"\nSeeding pre-season testing data for {year}...")

    # Find all testing files for this year
    testing_files = sorted(CURATED_DIR.glob(f"testing_{year}_*.json"))

    if not testing_files:
        print(f"  No testing files found matching testing_{year}_*.json")
        return

    print(f"  Found {len(testing_files)} testing file(s)")

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Get season_id
        season_id = get_season_id(cursor, year)
        if not season_id:
            print(f"  Error: Season {year} not found in database")
            return

        # Get current season start_date
        cursor.execute("SELECT start_date FROM seasons WHERE id = ?", (season_id,))
        season_row = cursor.fetchone()
        current_start_date = season_row[0] if season_row else None
        earliest_test_date = current_start_date

        total_sessions = 0
        total_results = 0

        for testing_file in testing_files:
            print(f"\n  Processing: {testing_file.name}")

            try:
                with open(testing_file, 'r', encoding='utf-8') as f:
                    test_data = json.load(f)
            except json.JSONDecodeError as e:
                print(f"    Error parsing JSON: {e}")
                continue
            except Exception as e:
                print(f"    Error reading file: {e}")
                continue

            # Extract data
            event_name = test_data.get('event_name', 'Pre-Season Test')
            circuit_ref = test_data.get('circuit_ref')
            days = test_data.get('days', [])

            if not circuit_ref:
                print(f"    Error: Missing circuit_ref")
                continue

            # Look up circuit_id
            cursor.execute(
                "SELECT id FROM circuits WHERE circuit_ref = ?",
                (circuit_ref,)
            )
            circuit_row = cursor.fetchone()
            if not circuit_row:
                print(f"    Error: Circuit '{circuit_ref}' not found in database")
                continue
            circuit_id = circuit_row[0]

            # Process each day
            for day in days:
                day_date = day.get('date')
                day_number = day.get('day_number')
                results = day.get('results', [])

                if not day_date or not day_number:
                    print(f"    Warning: Skipping day with missing date or day_number")
                    continue

                # Track earliest test date
                if not earliest_test_date or day_date < earliest_test_date:
                    earliest_test_date = day_date

                # Create session name like "Bahrain Test 1 - Day 1"
                # Extract test number from event name if possible
                test_number = ""
                if "Test" in event_name:
                    # Try to extract number after "Test"
                    import re
                    match = re.search(r'Test\s+(\d+)', event_name)
                    if match:
                        test_number = f" {match.group(1)}"

                session_name = f"{test_data.get('circuit_name', circuit_ref.title())} Test{test_number} - Day {day_number}"

                # Create session (use INSERT OR IGNORE to be idempotent)
                cursor.execute("""
                    INSERT OR IGNORE INTO sessions (
                        race_id, season_id, type, name, date, circuit_id, status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    None,  # race_id is NULL for testing
                    season_id,
                    'TEST',
                    session_name,
                    day_date,
                    circuit_id,
                    'completed'
                ))

                # Get the session_id (either just inserted or existing)
                cursor.execute("""
                    SELECT id FROM sessions
                    WHERE season_id = ? AND type = 'TEST' AND name = ? AND date = ?
                """, (season_id, session_name, day_date))
                session_row = cursor.fetchone()
                if not session_row:
                    print(f"    Warning: Could not find or create session for {session_name}")
                    continue
                session_id = session_row[0]

                if cursor.rowcount > 0:
                    total_sessions += 1
                    print(f"    Created session: {session_name}")

                # Insert results for this day
                results_count = 0
                for result in results:
                    driver_ref = result.get('driver_ref')
                    constructor_ref = result.get('constructor_ref')
                    position = result.get('position')
                    fastest_lap_time = result.get('fastest_lap_time')
                    laps_completed = result.get('laps_completed')

                    if not driver_ref or not constructor_ref:
                        print(f"      Warning: Skipping result with missing driver_ref or constructor_ref")
                        continue

                    # Look up driver_id
                    cursor.execute(
                        "SELECT id FROM drivers WHERE driver_ref = ?",
                        (driver_ref,)
                    )
                    driver_row = cursor.fetchone()
                    if not driver_row:
                        print(f"      Warning: Driver '{driver_ref}' not found in database, skipping")
                        continue
                    driver_id = driver_row[0]

                    # Look up constructor_id
                    cursor.execute(
                        "SELECT id FROM constructors WHERE constructor_ref = ?",
                        (constructor_ref,)
                    )
                    constructor_row = cursor.fetchone()
                    if not constructor_row:
                        print(f"      Warning: Constructor '{constructor_ref}' not found in database, skipping")
                        continue
                    constructor_id = constructor_row[0]

                    # Convert lap time to milliseconds
                    fastest_lap_ms = parse_lap_time(fastest_lap_time)

                    # Insert result (use INSERT OR IGNORE for idempotency)
                    cursor.execute("""
                        INSERT OR IGNORE INTO results (
                            session_id, driver_id, constructor_id,
                            position, position_order, fastest_lap_time,
                            laps_completed
                        ) VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, (
                        session_id,
                        driver_id,
                        constructor_id,
                        position,
                        position,  # position_order same as position
                        fastest_lap_time,
                        laps_completed
                    ))

                    if cursor.rowcount > 0:
                        results_count += 1

                total_results += results_count
                if results_count > 0:
                    print(f"      Inserted {results_count} result(s)")

        # Update season start_date if testing dates are earlier
        if earliest_test_date and earliest_test_date != current_start_date:
            if not current_start_date or earliest_test_date < current_start_date:
                cursor.execute(
                    "UPDATE seasons SET start_date = ? WHERE id = ?",
                    (earliest_test_date, season_id)
                )
                print(f"\n  Updated season start_date to {earliest_test_date}")

        conn.commit()
        print(f"\n  Summary:")
        print(f"    Sessions created: {total_sessions}")
        print(f"    Results inserted: {total_results}")
        print(f"  Testing data seeded successfully!")

    except Exception as e:
        conn.rollback()
        print(f"  Error: {e}")
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Seed pre-season testing data for a season",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python seed_testing.py --year 2026
        """
    )
    parser.add_argument(
        "--year",
        type=int,
        required=True,
        help="Season year (e.g., 2026)"
    )
    args = parser.parse_args()

    seed_testing(args.year)
