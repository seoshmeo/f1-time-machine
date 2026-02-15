"""
Generate events from race/qualifying results and import custom events.
"""
import argparse
import json
from pathlib import Path
from typing import Optional

from common import get_db_connection, get_season_id, CURATED_DIR, slugify


def generate_session_events(year: int) -> None:
    """
    Auto-generate event records from sessions that have results.

    Args:
        year: Season year (e.g., 2010)
    """
    print(f"\nGenerating session events for {year} season...")

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        season_id = get_season_id(cursor, year)
        if not season_id:
            print(f"  Error: Season {year} not found.")
            return

        events_count = 0

        # Generate Race winner events (importance=1)
        cursor.execute("""
            SELECT
                s.id as session_id,
                s.date,
                r.name as race_name,
                d.first_name,
                d.last_name,
                res.position
            FROM sessions s
            JOIN races r ON s.race_id = r.id
            JOIN results res ON res.session_id = s.id
            JOIN drivers d ON res.driver_id = d.id
            WHERE s.season_id = ?
                AND s.type = 'R'
                AND res.position = 1
            ORDER BY s.date
        """, (season_id,))

        race_winners = cursor.fetchall()

        for session_id, session_date, race_name, first_name, last_name, position in race_winners:
            # Find corresponding calendar_day
            cursor.execute(
                "SELECT id FROM calendar_days WHERE season_id = ? AND date = ?",
                (season_id, session_date)
            )
            day_row = cursor.fetchone()
            if not day_row:
                continue
            day_id = day_row[0]

            # Create event
            title = f"{first_name} {last_name} wins {race_name}"
            cursor.execute("""
                INSERT OR IGNORE INTO events (
                    day_id, season_id, session_id, type, title,
                    importance, sort_order
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                day_id,
                season_id,
                session_id,
                'race_result',
                title,
                1,
                1
            ))

            if cursor.rowcount > 0:
                events_count += 1

            # Update has_content flag
            cursor.execute(
                "UPDATE calendar_days SET has_content = 1 WHERE id = ?",
                (day_id,)
            )

        # Generate Qualifying pole events (importance=2)
        cursor.execute("""
            SELECT
                s.id as session_id,
                s.date,
                r.name as race_name,
                d.first_name,
                d.last_name,
                res.position
            FROM sessions s
            JOIN races r ON s.race_id = r.id
            JOIN results res ON res.session_id = s.id
            JOIN drivers d ON res.driver_id = d.id
            WHERE s.season_id = ?
                AND s.type = 'Q'
                AND res.position = 1
            ORDER BY s.date
        """, (season_id,))

        quali_poles = cursor.fetchall()

        for session_id, session_date, race_name, first_name, last_name, position in quali_poles:
            # Find corresponding calendar_day
            cursor.execute(
                "SELECT id FROM calendar_days WHERE season_id = ? AND date = ?",
                (season_id, session_date)
            )
            day_row = cursor.fetchone()
            if not day_row:
                continue
            day_id = day_row[0]

            # Create event
            title = f"{first_name} {last_name} takes pole at {race_name}"
            cursor.execute("""
                INSERT OR IGNORE INTO events (
                    day_id, season_id, session_id, type, title,
                    importance, sort_order
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                day_id,
                season_id,
                session_id,
                'qualifying_result',
                title,
                2,
                2
            ))

            if cursor.rowcount > 0:
                events_count += 1

            # Update has_content flag
            cursor.execute(
                "UPDATE calendar_days SET has_content = 1 WHERE id = ?",
                (day_id,)
            )

        # Generate Practice session events (importance=3)
        cursor.execute("""
            SELECT
                s.id as session_id,
                s.date,
                s.name,
                r.name as race_name
            FROM sessions s
            JOIN races r ON s.race_id = r.id
            WHERE s.season_id = ?
                AND s.type IN ('FP1', 'FP2', 'FP3')
            ORDER BY s.date, s.type
        """, (season_id,))

        practice_sessions = cursor.fetchall()

        for session_id, session_date, session_name, race_name in practice_sessions:
            # Find corresponding calendar_day
            cursor.execute(
                "SELECT id FROM calendar_days WHERE season_id = ? AND date = ?",
                (season_id, session_date)
            )
            day_row = cursor.fetchone()
            if not day_row:
                continue
            day_id = day_row[0]

            # Create event
            title = f"{session_name} - {race_name}"
            cursor.execute("""
                INSERT OR IGNORE INTO events (
                    day_id, season_id, session_id, type, title,
                    importance, sort_order
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                day_id,
                season_id,
                session_id,
                'practice',
                title,
                3,
                3
            ))

            if cursor.rowcount > 0:
                events_count += 1

            # Update has_content flag
            cursor.execute(
                "UPDATE calendar_days SET has_content = 1 WHERE id = ?",
                (day_id,)
            )

        # Generate Test session events (importance=2)
        cursor.execute("""
            SELECT
                s.id as session_id,
                s.date,
                s.name,
                d.first_name,
                d.last_name
            FROM sessions s
            JOIN results res ON res.session_id = s.id AND res.position = 1
            JOIN drivers d ON res.driver_id = d.id
            WHERE s.season_id = ?
                AND s.type = 'TEST'
            ORDER BY s.date
        """, (season_id,))

        test_sessions = cursor.fetchall()

        for session_id, session_date, session_name, first_name, last_name in test_sessions:
            # Find corresponding calendar_day
            cursor.execute(
                "SELECT id FROM calendar_days WHERE season_id = ? AND date = ?",
                (season_id, session_date)
            )
            day_row = cursor.fetchone()
            if not day_row:
                continue
            day_id = day_row[0]

            # Create event
            title = f"{session_name} — {first_name} {last_name} fastest"
            cursor.execute("""
                INSERT OR IGNORE INTO events (
                    day_id, season_id, session_id, type, title,
                    importance, sort_order
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                day_id,
                season_id,
                session_id,
                'testing',
                title,
                2,
                2
            ))

            if cursor.rowcount > 0:
                events_count += 1

            # Update has_content flag
            cursor.execute(
                "UPDATE calendar_days SET has_content = 1 WHERE id = ?",
                (day_id,)
            )

        conn.commit()
        print(f"  Generated {events_count} session events")

    except Exception as e:
        conn.rollback()
        print(f"  Error: {e}")
        raise
    finally:
        conn.close()


def import_custom_events(year: int) -> None:
    """
    Import custom events from JSON file.

    Args:
        year: Season year (e.g., 2010)
    """
    print(f"\nImporting custom events for {year} season...")

    events_file = CURATED_DIR / f"events_{year}_custom.json"

    if not events_file.exists():
        print(f"  No custom events file found at {events_file}")
        return

    try:
        with open(events_file, 'r', encoding='utf-8') as f:
            custom_events = json.load(f)
    except json.JSONDecodeError as e:
        print(f"  Error parsing JSON: {e}")
        return
    except Exception as e:
        print(f"  Error reading file: {e}")
        return

    if not custom_events:
        print("  No custom events to import")
        return

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        season_id = get_season_id(cursor, year)
        if not season_id:
            print(f"  Error: Season {year} not found.")
            return

        events_count = 0

        for event_data in custom_events:
            date = event_data.get('date')
            title = event_data.get('title')
            event_type = event_data.get('type', 'custom')
            summary = event_data.get('summary')
            detail = event_data.get('detail')
            importance = event_data.get('importance', 3)
            source_url = event_data.get('source_url')

            if not date or not title:
                print(f"  Warning: Skipping event with missing date or title")
                continue

            # Find corresponding calendar_day
            cursor.execute(
                "SELECT id FROM calendar_days WHERE season_id = ? AND date = ?",
                (season_id, date)
            )
            day_row = cursor.fetchone()
            if not day_row:
                print(f"  Warning: No calendar day found for date {date}, skipping")
                continue
            day_id = day_row[0]

            # Insert event
            cursor.execute("""
                INSERT OR IGNORE INTO events (
                    day_id, season_id, type, title, summary, detail,
                    importance, source_url
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                day_id,
                season_id,
                event_type,
                title,
                summary,
                detail,
                importance,
                source_url
            ))

            if cursor.rowcount > 0:
                events_count += 1
                event_id = cursor.lastrowid
            else:
                # Event already existed, get the event_id
                cursor.execute(
                    "SELECT id FROM events WHERE day_id = ? AND season_id = ? AND title = ?",
                    (day_id, season_id, title)
                )
                event_row = cursor.fetchone()
                if event_row:
                    event_id = event_row[0]
                else:
                    event_id = None

            # Process driver_refs if event_id is available
            if event_id:
                driver_refs = event_data.get('driver_refs', [])
                for driver_ref in driver_refs:
                    # Look up driver by driver_ref
                    cursor.execute(
                        "SELECT id FROM drivers WHERE driver_ref = ?",
                        (driver_ref,)
                    )
                    driver_row = cursor.fetchone()
                    if driver_row:
                        driver_id = driver_row[0]
                        # Insert into event_drivers table
                        cursor.execute(
                            "INSERT OR IGNORE INTO event_drivers (event_id, driver_id) VALUES (?, ?)",
                            (event_id, driver_id)
                        )
                    else:
                        print(f"  Warning: Driver ref '{driver_ref}' not found, skipping")

                # Process tags
                tags = event_data.get('tags', [])
                for tag_name in tags:
                    tag_slug = slugify(tag_name)
                    # Create or get tag
                    cursor.execute(
                        "INSERT OR IGNORE INTO tags (name, slug) VALUES (?, ?)",
                        (tag_name, tag_slug)
                    )
                    # Get tag id
                    cursor.execute(
                        "SELECT id FROM tags WHERE slug = ?",
                        (tag_slug,)
                    )
                    tag_row = cursor.fetchone()
                    if tag_row:
                        tag_id = tag_row[0]
                        # Insert into event_tags table
                        cursor.execute(
                            "INSERT OR IGNORE INTO event_tags (event_id, tag_id) VALUES (?, ?)",
                            (event_id, tag_id)
                        )

            # Update has_content flag
            cursor.execute(
                "UPDATE calendar_days SET has_content = 1 WHERE id = ?",
                (day_id,)
            )

        conn.commit()
        print(f"  Imported {events_count} custom events")

    except Exception as e:
        conn.rollback()
        print(f"  Error: {e}")
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate events for a season")
    parser.add_argument("--year", type=int, required=True, help="Season year (e.g., 2010)")
    parser.add_argument("--custom-only", action="store_true", help="Only import custom events")
    args = parser.parse_args()

    if args.custom_only:
        import_custom_events(args.year)
    else:
        generate_session_events(args.year)
        import_custom_events(args.year)
