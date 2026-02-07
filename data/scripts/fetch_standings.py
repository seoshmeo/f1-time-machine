"""
Fetch championship standings from Jolpica F1 API.
"""
from common import (
    BASE_API_URL, fetch_with_cache, get_db_connection,
    ensure_driver, ensure_constructor, get_season_id
)


def fetch_driver_standings(year: int) -> None:
    """
    Fetch and store driver standings for each round of a season.

    Args:
        year: Season year (e.g., 2010)
    """
    print(f"\nFetching driver standings for {year} season...")

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        season_id = get_season_id(cursor, year)
        if not season_id:
            print(f"  Error: Season {year} not found.")
            return

        # Get all race rounds
        cursor.execute(
            "SELECT id, round FROM races WHERE season_id = ? ORDER BY round",
            (season_id,)
        )
        races = cursor.fetchall()

        standings_count = 0

        # Fetch standings for each round
        for race_id, round_num in races:
            url = f"{BASE_API_URL}/{year}/{round_num}/driverStandings.json"
            data = fetch_with_cache(url, f"driver_standings_{year}_round_{round_num}.json")

            standings_lists = data.get('MRData', {}).get('StandingsTable', {}).get('StandingsLists', [])
            if not standings_lists:
                continue

            standings = standings_lists[0].get('DriverStandings', [])

            for standing in standings:
                # Ensure driver exists
                driver_id = ensure_driver(cursor, standing['Driver'])

                # Insert standing
                cursor.execute("""
                    INSERT OR REPLACE INTO driver_standings (
                        race_id, driver_id, points, position, position_text, wins
                    ) VALUES (?, ?, ?, ?, ?, ?)
                """, (
                    race_id,
                    driver_id,
                    float(standing.get('points', 0)),
                    int(standing.get('position', 0)),
                    standing.get('positionText'),
                    int(standing.get('wins', 0))
                ))

                standings_count += 1

        conn.commit()
        print(f"  Inserted {standings_count} driver standings entries")

    except Exception as e:
        conn.rollback()
        print(f"  Error: {e}")
        raise
    finally:
        conn.close()


def fetch_constructor_standings(year: int) -> None:
    """
    Fetch and store constructor standings for each round of a season.

    Args:
        year: Season year (e.g., 2010)
    """
    print(f"\nFetching constructor standings for {year} season...")

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        season_id = get_season_id(cursor, year)
        if not season_id:
            print(f"  Error: Season {year} not found.")
            return

        # Get all race rounds
        cursor.execute(
            "SELECT id, round FROM races WHERE season_id = ? ORDER BY round",
            (season_id,)
        )
        races = cursor.fetchall()

        standings_count = 0

        # Fetch standings for each round
        for race_id, round_num in races:
            url = f"{BASE_API_URL}/{year}/{round_num}/constructorStandings.json"
            data = fetch_with_cache(url, f"constructor_standings_{year}_round_{round_num}.json")

            standings_lists = data.get('MRData', {}).get('StandingsTable', {}).get('StandingsLists', [])
            if not standings_lists:
                continue

            standings = standings_lists[0].get('ConstructorStandings', [])

            for standing in standings:
                # Ensure constructor exists
                constructor_id = ensure_constructor(cursor, standing['Constructor'])

                # Insert standing
                cursor.execute("""
                    INSERT OR REPLACE INTO constructor_standings (
                        race_id, constructor_id, points, position, position_text, wins
                    ) VALUES (?, ?, ?, ?, ?, ?)
                """, (
                    race_id,
                    constructor_id,
                    float(standing.get('points', 0)),
                    int(standing.get('position', 0)),
                    standing.get('positionText'),
                    int(standing.get('wins', 0))
                ))

                standings_count += 1

        conn.commit()
        print(f"  Inserted {standings_count} constructor standings entries")

    except Exception as e:
        conn.rollback()
        print(f"  Error: {e}")
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python fetch_standings.py <year>")
        sys.exit(1)

    year = int(sys.argv[1])
    fetch_driver_standings(year)
    fetch_constructor_standings(year)
