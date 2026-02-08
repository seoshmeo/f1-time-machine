"""
Import penalties from curated JSON files.
"""
import argparse
import json
from pathlib import Path

from common import get_db_connection, get_season_id, CURATED_DIR


def import_penalties(year: int) -> None:
    """
    Import penalties from data/curated/penalties_{year}.json.

    Expected JSON format:
    [
        {
            "round": 10,
            "driver_ref": "alonso",
            "constructor_ref": "ferrari",
            "session_type": "R",
            "penalty_type": "fine",
            "timing": "post_race",
            "penalty_value": "$100,000",
            "reason": "Team orders",
            "description": "Ferrari fined for team orders",
            "incident_time": "Lap 49"
        }
    ]

    Args:
        year: Season year (e.g., 2010)
    """
    print(f"\nImporting penalties for {year} season...")

    penalties_file = CURATED_DIR / f"penalties_{year}.json"

    if not penalties_file.exists():
        print(f"  No penalties file found at {penalties_file}")
        return

    try:
        with open(penalties_file, 'r', encoding='utf-8') as f:
            penalties_data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"  Error parsing JSON: {e}")
        return
    except Exception as e:
        print(f"  Error reading file: {e}")
        return

    if not penalties_data:
        print("  No penalties to import")
        return

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        season_id = get_season_id(cursor, year)
        if not season_id:
            print(f"  Error: Season {year} not found.")
            return

        penalties_count = 0

        for penalty in penalties_data:
            round_num = penalty.get('round')
            driver_ref = penalty.get('driver_ref')
            constructor_ref = penalty.get('constructor_ref')
            session_type = penalty.get('session_type')
            penalty_type = penalty.get('penalty_type')
            timing = penalty.get('timing')
            penalty_value = penalty.get('penalty_value')
            reason = penalty.get('reason')
            description = penalty.get('description')
            incident_time = penalty.get('incident_time')

            if not round_num or not penalty_type or not timing or not reason:
                print(f"  Warning: Skipping penalty with missing required fields")
                continue

            # Find race_id
            cursor.execute(
                "SELECT id FROM races WHERE season_id = ? AND round = ?",
                (season_id, round_num)
            )
            race_row = cursor.fetchone()
            if not race_row:
                print(f"  Warning: No race found for round {round_num}, skipping penalty")
                continue
            race_id = race_row[0]

            # Optionally find session_id
            session_id = None
            if session_type:
                cursor.execute(
                    "SELECT id FROM sessions WHERE race_id = ? AND type = ?",
                    (race_id, session_type)
                )
                session_row = cursor.fetchone()
                if session_row:
                    session_id = session_row[0]

            # Optionally find driver_id
            driver_id = None
            if driver_ref:
                cursor.execute(
                    "SELECT id FROM drivers WHERE driver_ref = ?",
                    (driver_ref,)
                )
                driver_row = cursor.fetchone()
                if driver_row:
                    driver_id = driver_row[0]

            # Optionally find constructor_id
            constructor_id = None
            if constructor_ref:
                cursor.execute(
                    "SELECT id FROM constructors WHERE constructor_ref = ?",
                    (constructor_ref,)
                )
                constructor_row = cursor.fetchone()
                if constructor_row:
                    constructor_id = constructor_row[0]

            # Insert penalty
            cursor.execute("""
                INSERT INTO penalties (
                    race_id, session_id, driver_id, constructor_id, round,
                    penalty_type, timing, penalty_value, reason, description,
                    incident_time
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                race_id,
                session_id,
                driver_id,
                constructor_id,
                round_num,
                penalty_type,
                timing,
                penalty_value,
                reason,
                description,
                incident_time
            ))

            if cursor.rowcount > 0:
                penalties_count += 1

        conn.commit()
        print(f"  Imported {penalties_count} penalties")

    except Exception as e:
        conn.rollback()
        print(f"  Error: {e}")
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Import penalties for a season")
    parser.add_argument("--year", type=int, required=True, help="Season year (e.g., 2010)")
    args = parser.parse_args()

    import_penalties(args.year)
