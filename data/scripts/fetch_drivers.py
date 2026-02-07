"""
Fetch drivers and constructors for a season from Jolpica F1 API.
"""
from typing import Dict

from common import (
    BASE_API_URL, fetch_with_cache, get_db_connection,
    ensure_driver, ensure_constructor, get_season_id
)

# Team colors for 2010 season
TEAM_COLORS_2010 = {
    'red_bull': ('#1E41FF', '#FFD700'),
    'mclaren': ('#FF8700', '#FFFFFF'),
    'ferrari': ('#DC0000', '#FFFFFF'),
    'mercedes': ('#00D2BE', '#000000'),
    'renault': ('#FFF500', '#000000'),
    'williams': ('#005AFF', '#FFFFFF'),
    'force_india': ('#F596C8', '#FF8000'),
    'sauber': ('#006EFF', '#FFFFFF'),
    'toro_rosso': ('#469BFF', '#C8102E'),
    'lotus': ('#B6A434', '#2D2D2D'),
    'lotus_racing': ('#B6A434', '#2D2D2D'),
    'virgin': ('#C80815', '#000000'),
    'marussia_virgin': ('#C80815', '#000000'),
    'hispania': ('#6B7D85', '#C0A23D'),
    'hrt': ('#6B7D85', '#C0A23D'),
}


def fetch_season_drivers(year: int) -> None:
    """
    Fetch and store drivers and constructors for a season.

    Args:
        year: Season year (e.g., 2010)
    """
    print(f"\nFetching drivers and constructors for {year} season...")

    # Fetch drivers
    drivers_url = f"{BASE_API_URL}/{year}/drivers.json?limit=100"
    drivers_data = fetch_with_cache(drivers_url, f"drivers_{year}.json")
    drivers_list = drivers_data.get('MRData', {}).get('DriverTable', {}).get('Drivers', [])
    print(f"  Found {len(drivers_list)} drivers")

    # Fetch constructors
    constructors_url = f"{BASE_API_URL}/{year}/constructors.json?limit=100"
    constructors_data = fetch_with_cache(constructors_url, f"constructors_{year}.json")
    constructors_list = constructors_data.get('MRData', {}).get('ConstructorTable', {}).get('Constructors', [])
    print(f"  Found {len(constructors_list)} constructors")

    # Fetch driver standings to get driver-constructor pairings
    standings_url = f"{BASE_API_URL}/{year}/driverStandings.json?limit=100"
    standings_data = fetch_with_cache(standings_url, f"driver_standings_{year}_full.json")
    standings_list = standings_data.get('MRData', {}).get('StandingsTable', {}).get('StandingsLists', [])

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        season_id = get_season_id(cursor, year)
        if not season_id:
            print(f"  Error: Season {year} not found. Run fetch_races.py first.")
            return

        # Insert drivers
        for driver_data in drivers_list:
            ensure_driver(cursor, driver_data)

        # Insert constructors with colors
        for constructor_data in constructors_list:
            constructor_ref = constructor_data.get('constructorId')

            # Get colors for this team
            colors = TEAM_COLORS_2010.get(constructor_ref, ('#000000', '#FFFFFF'))

            # Check if exists
            cursor.execute(
                "SELECT id FROM constructors WHERE constructor_ref = ?",
                (constructor_ref,)
            )
            row = cursor.fetchone()

            if row:
                # Update colors
                cursor.execute("""
                    UPDATE constructors
                    SET color_primary = ?, color_secondary = ?
                    WHERE constructor_ref = ?
                """, (colors[0], colors[1], constructor_ref))
            else:
                # Insert new
                cursor.execute("""
                    INSERT INTO constructors (
                        constructor_ref, name, full_name, nationality, url,
                        color_primary, color_secondary, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
                """, (
                    constructor_ref,
                    constructor_data.get('name'),
                    constructor_data.get('name'),
                    constructor_data.get('nationality'),
                    constructor_data.get('url'),
                    colors[0],
                    colors[1]
                ))

        # Extract driver-constructor pairings from standings
        pairings = []
        for standings_list_item in standings_list:
            driver_standings = standings_list_item.get('DriverStandings', [])
            for standing in driver_standings:
                driver_ref = standing['Driver']['driverId']
                constructors = standing.get('Constructors', [])
                for constructor in constructors:
                    constructor_ref = constructor['constructorId']
                    car_number = standing['Driver'].get('permanentNumber')
                    pairings.append((driver_ref, constructor_ref, car_number))

        # Remove duplicates
        pairings = list(set(pairings))

        # Insert season entries
        for driver_ref, constructor_ref, car_number in pairings:
            # Get driver_id
            cursor.execute("SELECT id FROM drivers WHERE driver_ref = ?", (driver_ref,))
            driver_row = cursor.fetchone()
            if not driver_row:
                continue
            driver_id = driver_row[0]

            # Get constructor_id
            cursor.execute("SELECT id FROM constructors WHERE constructor_ref = ?", (constructor_ref,))
            constructor_row = cursor.fetchone()
            if not constructor_row:
                continue
            constructor_id = constructor_row[0]

            # Insert season entry
            cursor.execute("""
                INSERT OR IGNORE INTO season_entries (
                    season_id, driver_id, constructor_id, car_number, is_test_driver
                ) VALUES (?, ?, ?, ?, 0)
            """, (season_id, driver_id, constructor_id, car_number))

        conn.commit()
        print(f"  Inserted {len(drivers_list)} drivers, {len(constructors_list)} constructors")
        print(f"  Created {len(pairings)} season entries")

    except Exception as e:
        conn.rollback()
        print(f"  Error: {e}")
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python fetch_drivers.py <year>")
        sys.exit(1)

    year = int(sys.argv[1])
    fetch_season_drivers(year)
