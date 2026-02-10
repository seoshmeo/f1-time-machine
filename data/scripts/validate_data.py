"""
Validate data integrity for a season.
"""
import argparse

from common import get_db_connection, get_season_id


def validate(year: int) -> None:
    """
    Run integrity checks and print results.

    Args:
        year: Season year (e.g., 2010)
    """
    print(f"\nValidating data for {year} season...\n")
    print("=" * 60)

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Check 1: Season exists
        season_id = get_season_id(cursor, year)
        if season_id:
            print(f"[PASS] Season {year} exists (ID: {season_id})")
        else:
            print(f"[FAIL] Season {year} not found")
            return

        # Check 2: Race count
        cursor.execute(
            "SELECT COUNT(*) FROM races WHERE season_id = ?",
            (season_id,)
        )
        races_count = cursor.fetchone()[0]
        print(f"[PASS] Has {races_count} races")

        # Check 3: Each race has sessions (5 for standard, 5 for sprint)
        cursor.execute("""
            SELECT r.round, r.name, COUNT(s.id) as session_count
            FROM races r
            LEFT JOIN sessions s ON r.id = s.race_id
            WHERE r.season_id = ?
            GROUP BY r.id
            HAVING COUNT(s.id) < 5
        """, (season_id,))
        missing_sessions = cursor.fetchall()
        if not missing_sessions:
            print(f"[PASS] All races have at least 5 sessions")
        else:
            print(f"[FAIL] {len(missing_sessions)} races have fewer than 5 sessions:")
            for round_num, race_name, count in missing_sessions:
                print(f"       Round {round_num} ({race_name}): {count} sessions")

        # Check 4: Has race results for all rounds
        cursor.execute("""
            SELECT COUNT(DISTINCT r.round)
            FROM races r
            JOIN sessions s ON r.id = s.race_id AND s.type = 'R'
            JOIN results res ON s.id = res.session_id
            WHERE r.season_id = ?
        """, (season_id,))
        races_with_results = cursor.fetchone()[0]
        if races_with_results == races_count:
            print(f"[PASS] Has race results for all {races_count} rounds")
        else:
            print(f"[FAIL] Has race results for {races_with_results}/{races_count} rounds")

        # Check 5: Has qualifying results for all rounds
        cursor.execute("""
            SELECT COUNT(DISTINCT r.round)
            FROM races r
            JOIN sessions s ON r.id = s.race_id AND s.type = 'Q'
            JOIN results res ON s.id = res.session_id
            WHERE r.season_id = ?
        """, (season_id,))
        races_with_quali = cursor.fetchone()[0]
        if races_with_quali == races_count:
            print(f"[PASS] Has qualifying results for all {races_count} rounds")
        else:
            print(f"[FAIL] Has qualifying results for {races_with_quali}/{races_count} rounds")

        # Check 6: Calendar days generated
        cursor.execute(
            "SELECT COUNT(*) FROM calendar_days WHERE season_id = ?",
            (season_id,)
        )
        days_count = cursor.fetchone()[0]
        if days_count >= 200:
            print(f"[PASS] Has {days_count} calendar days (expected 200+)")
        else:
            print(f"[WARN] Has {days_count} calendar days (expected 200+)")

        # Check 7: Has driver standings after each round
        cursor.execute("""
            SELECT COUNT(DISTINCT race_id)
            FROM driver_standings
            WHERE race_id IN (SELECT id FROM races WHERE season_id = ?)
        """, (season_id,))
        rounds_with_driver_standings = cursor.fetchone()[0]
        if rounds_with_driver_standings == races_count:
            print(f"[PASS] Has driver standings for all {races_count} rounds")
        else:
            print(f"[FAIL] Has driver standings for {rounds_with_driver_standings}/{races_count} rounds")

        # Check 8: Has constructor standings
        cursor.execute("""
            SELECT COUNT(DISTINCT race_id)
            FROM constructor_standings
            WHERE race_id IN (SELECT id FROM races WHERE season_id = ?)
        """, (season_id,))
        rounds_with_constructor_standings = cursor.fetchone()[0]
        if rounds_with_constructor_standings == races_count:
            print(f"[PASS] Has constructor standings for all {races_count} rounds")
        else:
            print(f"[FAIL] Has constructor standings for {rounds_with_constructor_standings}/{races_count} rounds")

        # Check 9: No orphaned results
        cursor.execute("""
            SELECT COUNT(*)
            FROM results
            WHERE session_id NOT IN (SELECT id FROM sessions)
        """)
        orphaned_results = cursor.fetchone()[0]
        if orphaned_results == 0:
            print(f"[PASS] No orphaned results (all results linked to valid sessions)")
        else:
            print(f"[FAIL] Found {orphaned_results} orphaned results")

        # Check 10: Content statistics
        cursor.execute(
            "SELECT COUNT(*) FROM events WHERE season_id = ?",
            (season_id,)
        )
        events_count = cursor.fetchone()[0]
        print(f"[INFO] {events_count} events generated")

        cursor.execute(
            "SELECT COUNT(*) FROM articles WHERE season_id = ?",
            (season_id,)
        )
        articles_count = cursor.fetchone()[0]
        print(f"[INFO] {articles_count} articles imported")

        cursor.execute(
            "SELECT COUNT(*) FROM quotes WHERE season_id = ?",
            (season_id,)
        )
        quotes_count = cursor.fetchone()[0]
        print(f"[INFO] {quotes_count} quotes imported")

        cursor.execute(
            "SELECT COUNT(*) FROM calendar_days WHERE season_id = ? AND has_content = 1",
            (season_id,)
        )
        days_with_content = cursor.fetchone()[0]
        print(f"[INFO] {days_with_content}/{days_count} days have content")

        print("=" * 60)
        print("\nValidation complete!\n")

    except Exception as e:
        print(f"[ERROR] Validation failed: {e}")
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Validate data for a season")
    parser.add_argument("--year", type=int, required=True, help="Season year (e.g., 2010)")
    args = parser.parse_args()

    validate(args.year)
