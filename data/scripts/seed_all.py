"""
Master orchestrator to seed all data for a season.
"""
import argparse
import sys

# Import all the scripts
import db_schema
import fetch_races
import fetch_drivers
import fetch_results
import fetch_standings
import generate_days
import generate_events
import import_articles
import import_quotes
import validate_data

from common import DB_PATH


def print_step(step_num: int, total_steps: int, description: str) -> None:
    """Print formatted step header."""
    print("\n" + "=" * 70)
    print(f"Step {step_num}/{total_steps}: {description}")
    print("=" * 70)


def seed_all(year: int, reset: bool = False) -> None:
    """
    Run all data pipeline scripts in order.

    Args:
        year: Season year (e.g., 2010)
        reset: If True, drop and recreate database schema
    """
    total_steps = 13
    errors = []

    print("\n" + "#" * 70)
    print(f"# F1 Time Machine Data Pipeline - Season {year}")
    print("#" * 70)

    # Step 1: Create schema (only if reset)
    if reset:
        print_step(1, total_steps, "Create Database Schema")
        try:
            db_schema.create_schema(DB_PATH, reset=True)
        except Exception as e:
            error_msg = f"Step 1 failed: {e}"
            print(f"ERROR: {error_msg}")
            errors.append(error_msg)
    else:
        print_step(1, total_steps, "Create Database Schema (SKIPPED - no --reset flag)")

    # Step 2: Fetch races
    print_step(2, total_steps, "Fetch Race Calendar")
    try:
        fetch_races.fetch_season_races(year)
    except Exception as e:
        error_msg = f"Step 2 failed: {e}"
        print(f"ERROR: {error_msg}")
        errors.append(error_msg)

    # Step 3: Fetch drivers
    print_step(3, total_steps, "Fetch Drivers and Constructors")
    try:
        fetch_drivers.fetch_season_drivers(year)
    except Exception as e:
        error_msg = f"Step 3 failed: {e}"
        print(f"ERROR: {error_msg}")
        errors.append(error_msg)

    # Step 4: Fetch race results
    print_step(4, total_steps, "Fetch Race Results")
    try:
        fetch_results.fetch_race_results(year)
    except Exception as e:
        error_msg = f"Step 4 failed: {e}"
        print(f"ERROR: {error_msg}")
        errors.append(error_msg)

    # Step 5: Fetch qualifying results
    print_step(5, total_steps, "Fetch Qualifying Results")
    try:
        fetch_results.fetch_qualifying_results(year)
    except Exception as e:
        error_msg = f"Step 5 failed: {e}"
        print(f"ERROR: {error_msg}")
        errors.append(error_msg)

    # Step 6: Fetch driver standings
    print_step(6, total_steps, "Fetch Driver Standings")
    try:
        fetch_standings.fetch_driver_standings(year)
    except Exception as e:
        error_msg = f"Step 6 failed: {e}"
        print(f"ERROR: {error_msg}")
        errors.append(error_msg)

    # Step 7: Fetch constructor standings
    print_step(7, total_steps, "Fetch Constructor Standings")
    try:
        fetch_standings.fetch_constructor_standings(year)
    except Exception as e:
        error_msg = f"Step 7 failed: {e}"
        print(f"ERROR: {error_msg}")
        errors.append(error_msg)

    # Step 8: Generate calendar days
    print_step(8, total_steps, "Generate Calendar Days")
    try:
        generate_days.generate_days(year)
    except Exception as e:
        error_msg = f"Step 8 failed: {e}"
        print(f"ERROR: {error_msg}")
        errors.append(error_msg)

    # Step 9: Generate session events
    print_step(9, total_steps, "Generate Session Events")
    try:
        generate_events.generate_session_events(year)
    except Exception as e:
        error_msg = f"Step 9 failed: {e}"
        print(f"ERROR: {error_msg}")
        errors.append(error_msg)

    # Step 10: Import custom events
    print_step(10, total_steps, "Import Custom Events")
    try:
        generate_events.import_custom_events(year)
    except Exception as e:
        error_msg = f"Step 10 failed: {e}"
        print(f"ERROR: {error_msg}")
        errors.append(error_msg)

    # Step 11: Import articles
    print_step(11, total_steps, "Import Articles")
    try:
        import_articles.import_articles(year)
    except Exception as e:
        error_msg = f"Step 11 failed: {e}"
        print(f"ERROR: {error_msg}")
        errors.append(error_msg)

    # Step 12: Import quotes
    print_step(12, total_steps, "Import Quotes")
    try:
        import_quotes.import_quotes(year)
    except Exception as e:
        error_msg = f"Step 12 failed: {e}"
        print(f"ERROR: {error_msg}")
        errors.append(error_msg)

    # Step 13: Validate data
    print_step(13, total_steps, "Validate Data")
    try:
        validate_data.validate(year)
    except Exception as e:
        error_msg = f"Step 13 failed: {e}"
        print(f"ERROR: {error_msg}")
        errors.append(error_msg)

    # Print final summary
    print("\n" + "#" * 70)
    print("# PIPELINE SUMMARY")
    print("#" * 70)

    if errors:
        print(f"\nCompleted with {len(errors)} error(s):\n")
        for i, error in enumerate(errors, 1):
            print(f"{i}. {error}")
        print("\nSome steps failed. Please review the errors above.")
    else:
        print("\nAll steps completed successfully!")
        print(f"Database ready at: {DB_PATH}")

    print("#" * 70 + "\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Seed all F1 Time Machine data for a season",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python seed_all.py --year 2010
  python seed_all.py --year 2010 --reset
        """
    )
    parser.add_argument("--year", type=int, required=True, help="Season year (e.g., 2010)")
    parser.add_argument("--reset", action="store_true", help="Drop and recreate database schema")
    args = parser.parse_args()

    seed_all(args.year, args.reset)
