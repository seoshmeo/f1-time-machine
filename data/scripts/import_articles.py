"""
Import articles from curated JSON files.
"""
import argparse
import json
from pathlib import Path

from common import get_db_connection, get_season_id, slugify, CURATED_DIR


def import_articles(year: int) -> None:
    """
    Import articles from data/curated/articles_{year}.json.

    Expected JSON format:
    [
        {
            "date": "2010-03-14",
            "title": "Article Title",
            "slug": "optional-slug",
            "lead": "Lead paragraph",
            "body": "Full article text",
            "source": "Source name",
            "source_url": "https://...",
            "author": "Author name",
            "language": "ru"
        }
    ]

    Args:
        year: Season year (e.g., 2010)
    """
    print(f"\nImporting articles for {year} season...")

    articles_file = CURATED_DIR / f"articles_{year}.json"

    if not articles_file.exists():
        print(f"  No articles file found at {articles_file}")
        return

    try:
        with open(articles_file, 'r', encoding='utf-8') as f:
            articles_data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"  Error parsing JSON: {e}")
        return
    except Exception as e:
        print(f"  Error reading file: {e}")
        return

    if not articles_data:
        print("  No articles to import")
        return

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        season_id = get_season_id(cursor, year)
        if not season_id:
            print(f"  Error: Season {year} not found.")
            return

        articles_count = 0

        for article in articles_data:
            date = article.get('date')
            title = article.get('title')
            slug = article.get('slug')
            lead = article.get('lead')
            body = article.get('body')
            source = article.get('source')
            source_url = article.get('source_url')
            author = article.get('author')
            language = article.get('language', 'ru')

            if not date or not title:
                print(f"  Warning: Skipping article with missing date or title")
                continue

            # Auto-generate slug if not provided
            if not slug:
                slug = slugify(title)

            # Find matching calendar_day
            cursor.execute(
                "SELECT id FROM calendar_days WHERE season_id = ? AND date = ?",
                (season_id, date)
            )
            day_row = cursor.fetchone()
            if not day_row:
                print(f"  Warning: No calendar day found for date {date}, skipping article: {title}")
                continue
            day_id = day_row[0]

            # Insert article
            cursor.execute("""
                INSERT OR IGNORE INTO articles (
                    day_id, season_id, title, slug, lead, body,
                    source, source_url, author, language, published_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                day_id,
                season_id,
                title,
                slug,
                lead,
                body,
                source,
                source_url,
                author,
                language,
                date
            ))

            if cursor.rowcount > 0:
                articles_count += 1

                # Update has_content flag on calendar_day
                cursor.execute(
                    "UPDATE calendar_days SET has_content = 1 WHERE id = ?",
                    (day_id,)
                )

        conn.commit()
        print(f"  Imported {articles_count} articles")

    except Exception as e:
        conn.rollback()
        print(f"  Error: {e}")
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Import articles for a season")
    parser.add_argument("--year", type=int, required=True, help="Season year (e.g., 2010)")
    args = parser.parse_args()

    import_articles(args.year)
