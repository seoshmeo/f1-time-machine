"""
Generate calendar_days entries for each day of the season.
"""
from datetime import datetime, timedelta
import argparse

from common import get_db_connection, get_season_id


def parse_date(date_str: str) -> datetime:
    """Parse ISO date string to datetime."""
    return datetime.strptime(date_str, "%Y-%m-%d")


def generate_days(year: int) -> None:
    """
    Generate calendar_days rows for every day in a season.

    Args:
        year: Season year (e.g., 2010)
    """
    print(f"\nGenerating calendar days for {year} season...")

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        season_id = get_season_id(cursor, year)
        if not season_id:
            print(f"  Error: Season {year} not found.")
            return

        # Get season date range
        cursor.execute(
            "SELECT start_date, end_date FROM seasons WHERE id = ?",
            (season_id,)
        )
        row = cursor.fetchone()
        if not row or not row[0] or not row[1]:
            print(f"  Error: Season {year} missing start_date or end_date.")
            return

        start_date = parse_date(row[0])
        end_date = parse_date(row[1])

        # Get all sessions with their dates and types
        cursor.execute("""
            SELECT s.date, s.type, s.race_id, r.name
            FROM sessions s
            LEFT JOIN races r ON s.race_id = r.id
            WHERE s.season_id = ?
            ORDER BY s.date, s.type
        """, (season_id,))
        sessions = cursor.fetchall()

        # Build a map of date -> (day_type, race_id, race_name, session_types)
        date_info = {}
        for session_date, session_type, race_id, race_name in sessions:
            if session_date not in date_info:
                date_info[session_date] = {
                    'race_id': race_id,
                    'race_name': race_name,
                    'session_types': []
                }
            date_info[session_date]['session_types'].append(session_type)

        # Generate a day for each date in the season range
        current_date = start_date
        days_count = 0

        while current_date <= end_date:
            date_str = current_date.strftime("%Y-%m-%d")

            if date_str in date_info:
                info = date_info[date_str]
                session_types = info['session_types']

                # Determine day_type based on sessions
                if 'R' in session_types:
                    day_type = 'race_day'
                    description = f"{info['race_name']} - Race Day"
                elif 'Q' in session_types:
                    day_type = 'quali_day'
                    description = f"{info['race_name']} - Qualifying Day"
                elif any(s in session_types for s in ['FP1', 'FP2', 'FP3']):
                    day_type = 'practice_day'
                    description = f"{info['race_name']} - Practice Day"
                elif 'TEST' in session_types:
                    day_type = 'test_day'
                    description = f"{info['race_name']} - Test Day"
                else:
                    day_type = 'off'
                    description = None

                race_id = info['race_id']
                has_content = 1 if day_type != 'off' else 0
            else:
                # Off day
                day_type = 'off'
                race_id = None
                description = None
                has_content = 0

            # Insert calendar day
            cursor.execute("""
                INSERT OR IGNORE INTO calendar_days (
                    season_id, date, day_type, race_id, description, has_content
                ) VALUES (?, ?, ?, ?, ?, ?)
            """, (
                season_id,
                date_str,
                day_type,
                race_id,
                description,
                has_content
            ))

            days_count += 1
            current_date += timedelta(days=1)

        conn.commit()
        print(f"  Generated {days_count} calendar days")

    except Exception as e:
        conn.rollback()
        print(f"  Error: {e}")
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate calendar days for a season")
    parser.add_argument("--year", type=int, required=True, help="Season year (e.g., 2010)")
    args = parser.parse_args()

    generate_days(args.year)
