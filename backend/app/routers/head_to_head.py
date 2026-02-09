from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Constructor, Driver, Race, Result, Season, SeasonEntry
from app.models import Session as SessionModel
from app.models import Status

router = APIRouter()


class DriverInfo(BaseModel):
    driver_ref: str
    first_name: str
    last_name: str
    code: str | None = None


class QualifyingComparison(BaseModel):
    driver1_ahead: int
    driver2_ahead: int
    total: int


class RaceComparison(BaseModel):
    driver1_ahead: int
    driver2_ahead: int
    total: int


class FastestLaps(BaseModel):
    driver1_count: int
    driver2_count: int


class PointsStats(BaseModel):
    driver1_total: float
    driver2_total: float
    driver1_podiums: int
    driver2_podiums: int
    driver1_dnfs: int
    driver2_dnfs: int


class PointsProgressionRound(BaseModel):
    round: int
    driver1_points: float
    driver2_points: float


class HeadToHeadComparison(BaseModel):
    constructor_ref: str
    constructor_name: str
    driver1: DriverInfo
    driver2: DriverInfo
    qualifying: QualifyingComparison
    races: RaceComparison
    fastest_laps: FastestLaps
    points: PointsStats
    points_progression: list[PointsProgressionRound]


def is_dnf(status_text: str | None) -> bool:
    """Check if a status represents a DNF (Did Not Finish)."""
    if not status_text:
        return False

    # Finished normally
    if status_text == "Finished":
        return False

    # Lapped finishes (started with +)
    if status_text.startswith("+"):
        return False

    # Everything else is a DNF
    return True


@router.get("/seasons/{year}/head-to-head", response_model=list[HeadToHeadComparison])
def get_head_to_head_comparisons(year: int, db: Session = Depends(get_db)):
    """Get head-to-head teammate comparisons for a season."""

    # Get season
    season = db.query(Season).filter(Season.year == year).first()
    if not season:
        raise HTTPException(status_code=404, detail=f"Season {year} not found")

    # Get all season entries grouped by constructor
    entries = (
        db.query(SeasonEntry)
        .options(joinedload(SeasonEntry.driver), joinedload(SeasonEntry.constructor))
        .filter(
            SeasonEntry.season_id == season.id,
            SeasonEntry.is_test_driver.is_(False)
        )
        .all()
    )

    # Group drivers by constructor
    constructor_drivers = defaultdict(list)
    for entry in entries:
        constructor_drivers[entry.constructor_id].append({
            "driver": entry.driver,
            "constructor": entry.constructor,
            "driver_id": entry.driver_id
        })

    # Get all races for this season
    races = (
        db.query(Race)
        .filter(Race.season_id == season.id)
        .order_by(Race.round)
        .all()
    )

    comparisons = []

    # Process each constructor
    for constructor_id, drivers_data in constructor_drivers.items():
        # For teams with more than 2 drivers, find the two who raced most together
        if len(drivers_data) > 2:
            # Count races for each driver
            race_counts = []
            for driver_data in drivers_data:
                count = (
                    db.query(func.count(Result.id))
                    .join(SessionModel, Result.session_id == SessionModel.id)
                    .filter(
                        SessionModel.season_id == season.id,
                        SessionModel.type == "R",
                        Result.driver_id == driver_data["driver_id"],
                        Result.constructor_id == constructor_id
                    )
                    .scalar()
                )
                race_counts.append((count, driver_data))

            # Sort by race count and take top 2
            race_counts.sort(reverse=True, key=lambda x: x[0])
            drivers_data = [x[1] for x in race_counts[:2]]

        # Skip if not exactly 2 drivers
        if len(drivers_data) != 2:
            continue

        driver1_data = drivers_data[0]
        driver2_data = drivers_data[1]

        driver1_id = driver1_data["driver_id"]
        driver2_id = driver2_data["driver_id"]

        # Initialize counters
        quali_d1_ahead = 0
        quali_d2_ahead = 0
        race_d1_ahead = 0
        race_d2_ahead = 0
        fastest_laps_d1 = 0
        fastest_laps_d2 = 0

        # Points tracking
        d1_cumulative_points = 0.0
        d2_cumulative_points = 0.0
        d1_total_points = 0.0
        d2_total_points = 0.0
        d1_podiums = 0
        d2_podiums = 0
        d1_dnfs = 0
        d2_dnfs = 0
        points_progression = []

        # Process each race
        for race in races:
            # Get qualifying session
            quali_session = (
                db.query(SessionModel)
                .filter(
                    SessionModel.race_id == race.id,
                    SessionModel.type == "Q"
                )
                .first()
            )

            # Compare qualifying positions
            if quali_session:
                d1_quali = (
                    db.query(Result)
                    .filter(
                        Result.session_id == quali_session.id,
                        Result.driver_id == driver1_id,
                        Result.position.isnot(None)
                    )
                    .first()
                )
                d2_quali = (
                    db.query(Result)
                    .filter(
                        Result.session_id == quali_session.id,
                        Result.driver_id == driver2_id,
                        Result.position.isnot(None)
                    )
                    .first()
                )

                # Count if both participated
                if d1_quali and d2_quali:
                    if d1_quali.position < d2_quali.position:
                        quali_d1_ahead += 1
                    else:
                        quali_d2_ahead += 1

            # Get race session
            race_session = (
                db.query(SessionModel)
                .filter(
                    SessionModel.race_id == race.id,
                    SessionModel.type == "R"
                )
                .first()
            )

            if not race_session:
                continue

            # Get race results with status
            d1_race = (
                db.query(Result)
                .options(joinedload(Result.status))
                .filter(
                    Result.session_id == race_session.id,
                    Result.driver_id == driver1_id
                )
                .first()
            )
            d2_race = (
                db.query(Result)
                .options(joinedload(Result.status))
                .filter(
                    Result.session_id == race_session.id,
                    Result.driver_id == driver2_id
                )
                .first()
            )

            # Compare race positions
            if d1_race and d2_race:
                d1_status = d1_race.status.status if d1_race.status else None
                d2_status = d2_race.status.status if d2_race.status else None

                d1_is_dnf = is_dnf(d1_status)
                d2_is_dnf = is_dnf(d2_status)

                # Both finished or both DNF'd - compare positions
                if not d1_is_dnf and not d2_is_dnf:
                    # Both finished
                    if d1_race.position and d2_race.position:
                        if d1_race.position < d2_race.position:
                            race_d1_ahead += 1
                        else:
                            race_d2_ahead += 1
                elif d1_is_dnf and not d2_is_dnf:
                    # D1 DNF'd, D2 finished
                    race_d2_ahead += 1
                elif not d1_is_dnf and d2_is_dnf:
                    # D2 DNF'd, D1 finished
                    race_d1_ahead += 1
                # If both DNF'd, skip

                # Count DNFs
                if d1_is_dnf:
                    d1_dnfs += 1
                if d2_is_dnf:
                    d2_dnfs += 1

            # Count fastest laps
            if d1_race and d1_race.fastest_lap_rank == 1:
                fastest_laps_d1 += 1
            if d2_race and d2_race.fastest_lap_rank == 1:
                fastest_laps_d2 += 1

            # Accumulate points
            if d1_race:
                d1_cumulative_points += d1_race.points
                d1_total_points += d1_race.points
                if d1_race.position and d1_race.position <= 3:
                    d1_podiums += 1

            if d2_race:
                d2_cumulative_points += d2_race.points
                d2_total_points += d2_race.points
                if d2_race.position and d2_race.position <= 3:
                    d2_podiums += 1

            # Add to progression
            points_progression.append(
                PointsProgressionRound(
                    round=race.round,
                    driver1_points=d1_cumulative_points,
                    driver2_points=d2_cumulative_points
                )
            )

        # Create comparison
        comparison = HeadToHeadComparison(
            constructor_ref=driver1_data["constructor"].constructor_ref,
            constructor_name=driver1_data["constructor"].name,
            driver1=DriverInfo(
                driver_ref=driver1_data["driver"].driver_ref,
                first_name=driver1_data["driver"].first_name,
                last_name=driver1_data["driver"].last_name,
                code=driver1_data["driver"].code
            ),
            driver2=DriverInfo(
                driver_ref=driver2_data["driver"].driver_ref,
                first_name=driver2_data["driver"].first_name,
                last_name=driver2_data["driver"].last_name,
                code=driver2_data["driver"].code
            ),
            qualifying=QualifyingComparison(
                driver1_ahead=quali_d1_ahead,
                driver2_ahead=quali_d2_ahead,
                total=quali_d1_ahead + quali_d2_ahead
            ),
            races=RaceComparison(
                driver1_ahead=race_d1_ahead,
                driver2_ahead=race_d2_ahead,
                total=race_d1_ahead + race_d2_ahead
            ),
            fastest_laps=FastestLaps(
                driver1_count=fastest_laps_d1,
                driver2_count=fastest_laps_d2
            ),
            points=PointsStats(
                driver1_total=d1_total_points,
                driver2_total=d2_total_points,
                driver1_podiums=d1_podiums,
                driver2_podiums=d2_podiums,
                driver1_dnfs=d1_dnfs,
                driver2_dnfs=d2_dnfs
            ),
            points_progression=points_progression
        )

        comparisons.append(comparison)

    # Sort by constructor name
    comparisons.sort(key=lambda x: x.constructor_name)

    return comparisons
