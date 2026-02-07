"""
Import quotes from curated JSON files.
"""
import argparse
import json
from pathlib import Path

from common import get_db_connection, get_season_id, CURATED_DIR


def import_quotes(year: int) -> None:
    """
    Import quotes from data/curated/quotes_{year}.json.

    Expected JSON format:
    [
        {
            "date": "2010-03-14",
            "driver_ref": "alonso",
            "author_name": "Fernando Alonso",
            "author_role": "Ferrari Driver",
            "text": "Quote text here",
            "context": "Context of the quote",
            "source": "Source name",
            "language": "ru"
        }
    ]

    Args:
        year: Season year (e.g., 2010)
    """
    print(f"\nImporting quotes for {year} season...")

    quotes_file = CURATED_DIR / f"quotes_{year}.json"

    if not quotes_file.exists():
        print(f"  No quotes file found at {quotes_file}")
        return

    try:
        with open(quotes_file, 'r', encoding='utf-8') as f:
            quotes_data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"  Error parsing JSON: {e}")
        return
    except Exception as e:
        print(f"  Error reading file: {e}")
        return

    if not quotes_data:
        print("  No quotes to import")
        return

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        season_id = get_season_id(cursor, year)
        if not season_id:
            print(f"  Error: Season {year} not found.")
            return

        quotes_count = 0

        for quote in quotes_data:
            date = quote.get('date')
            driver_ref = quote.get('driver_ref')
            author_name = quote.get('author_name')
            author_role = quote.get('author_role')
            text = quote.get('text')
            context = quote.get('context')
            source = quote.get('source')
            source_url = quote.get('source_url')
            language = quote.get('language', 'ru')

            if not date or not author_name or not text:
                print(f"  Warning: Skipping quote with missing required fields")
                continue

            # Find matching calendar_day
            cursor.execute(
                "SELECT id FROM calendar_days WHERE season_id = ? AND date = ?",
                (season_id, date)
            )
            day_row = cursor.fetchone()
            if not day_row:
                print(f"  Warning: No calendar day found for date {date}, skipping quote")
                continue
            day_id = day_row[0]

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

            # Insert quote
            cursor.execute("""
                INSERT OR IGNORE INTO quotes (
                    day_id, season_id, driver_id, author_name, author_role,
                    text, context, source, source_url, language
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                day_id,
                season_id,
                driver_id,
                author_name,
                author_role,
                text,
                context,
                source,
                source_url,
                language
            ))

            if cursor.rowcount > 0:
                quotes_count += 1

                # Update has_content flag on calendar_day
                cursor.execute(
                    "UPDATE calendar_days SET has_content = 1 WHERE id = ?",
                    (day_id,)
                )

        conn.commit()
        print(f"  Imported {quotes_count} quotes")

    except Exception as e:
        conn.rollback()
        print(f"  Error: {e}")
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Import quotes for a season")
    parser.add_argument("--year", type=int, required=True, help="Season year (e.g., 2010)")
    args = parser.parse_args()

    import_quotes(args.year)
