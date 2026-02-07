from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Circuit, Constructor, Driver, DriverStanding, Race, Result, Season, SeasonEntry, Status
from app.models import Session as SessionModel
from app.schemas.driver import DriverBrief, DriverDetail, DriverRaceResultOut, SeasonStatsOut

router = APIRouter()


@router.get("/seasons/{year}/drivers", response_model=list[DriverBrief])
def get_season_drivers(year: int, db: Session = Depends(get_db)):
    season = db.query(Season).filter(Season.year == year).first()
    if not season:
        raise HTTPException(status_code=404, detail=f"Season {year} not found")

    drivers = (
        db.query(Driver)
        .join(SeasonEntry)
        .filter(
            SeasonEntry.season_id == season.id,
            SeasonEntry.is_test_driver.is_(False),
        )
        .order_by(Driver.last_name, Driver.first_name)
        .all()
    )

    return [DriverBrief.model_validate(driver) for driver in drivers]


@router.get("/drivers/{driver_ref}", response_model=DriverDetail)
def get_driver(
    driver_ref: str,
    season: int | None = Query(None, description="Season year for stats"),
    db: Session = Depends(get_db),
):
    driver = db.query(Driver).filter(Driver.driver_ref == driver_ref).first()
    if not driver:
        raise HTTPException(status_code=404, detail=f"Driver {driver_ref} not found")

    result = DriverDetail.model_validate(driver)

    # Compute season stats if season year provided
    if season:
        season_obj = db.query(Season).filter(Season.year == season).first()
        if season_obj:
            # Get race results for this driver in this season
            race_results = (
                db.query(Result)
                .join(SessionModel, Result.session_id == SessionModel.id)
                .filter(
                    SessionModel.season_id == season_obj.id,
                    SessionModel.type == "R",
                    Result.driver_id == driver.id,
                )
                .all()
            )

            # Get qualifying results for poles
            quali_results = (
                db.query(Result)
                .join(SessionModel, Result.session_id == SessionModel.id)
                .filter(
                    SessionModel.season_id == season_obj.id,
                    SessionModel.type == "Q",
                    Result.driver_id == driver.id,
                )
                .all()
            )

            races = len(race_results)
            wins = sum(1 for r in race_results if r.position == 1)
            podiums = sum(1 for r in race_results if r.position is not None and r.position <= 3)
            poles = sum(1 for r in quali_results if r.position == 1)
            points = sum(r.points for r in race_results)

            # Final championship position
            last_race = (
                db.query(Race)
                .filter(Race.season_id == season_obj.id)
                .order_by(Race.round.desc())
                .first()
            )
            final_position = None
            if last_race:
                standing = (
                    db.query(DriverStanding)
                    .filter(
                        DriverStanding.race_id == last_race.id,
                        DriverStanding.driver_id == driver.id,
                    )
                    .first()
                )
                if standing:
                    final_position = standing.position

            # Constructor name
            entry = (
                db.query(SeasonEntry)
                .filter(
                    SeasonEntry.season_id == season_obj.id,
                    SeasonEntry.driver_id == driver.id,
                )
                .first()
            )
            constructor_name = None
            if entry:
                constructor = db.query(Constructor).filter(Constructor.id == entry.constructor_id).first()
                if constructor:
                    constructor_name = constructor.name

            result.season_stats = SeasonStatsOut(
                races=races,
                wins=wins,
                podiums=podiums,
                poles=poles,
                points=points,
                final_position=final_position,
                constructor_name=constructor_name,
            )

    return result


@router.get("/drivers/{driver_ref}/race-results", response_model=list[DriverRaceResultOut])
def get_driver_race_results(
    driver_ref: str,
    season: int = Query(..., description="Season year"),
    db: Session = Depends(get_db),
):
    driver = db.query(Driver).filter(Driver.driver_ref == driver_ref).first()
    if not driver:
        raise HTTPException(status_code=404, detail=f"Driver {driver_ref} not found")

    season_obj = db.query(Season).filter(Season.year == season).first()
    if not season_obj:
        raise HTTPException(status_code=404, detail=f"Season {season} not found")

    races = (
        db.query(Race)
        .filter(Race.season_id == season_obj.id)
        .order_by(Race.round)
        .all()
    )

    results = []
    for race in races:
        circuit = db.query(Circuit).filter(Circuit.id == race.circuit_id).first()

        # Race result
        race_session = (
            db.query(SessionModel)
            .filter(SessionModel.race_id == race.id, SessionModel.type == "R")
            .first()
        )
        race_result = None
        if race_session:
            race_result = (
                db.query(Result)
                .filter(Result.session_id == race_session.id, Result.driver_id == driver.id)
                .first()
            )

        # Qualifying result
        quali_session = (
            db.query(SessionModel)
            .filter(SessionModel.race_id == race.id, SessionModel.type == "Q")
            .first()
        )
        quali_position = None
        if quali_session:
            quali_result = (
                db.query(Result)
                .filter(Result.session_id == quali_session.id, Result.driver_id == driver.id)
                .first()
            )
            if quali_result:
                quali_position = quali_result.position

        # Status text
        status_text = None
        if race_result and race_result.status_id:
            status = db.query(Status).filter(Status.id == race_result.status_id).first()
            if status:
                status_text = status.status

        results.append(
            DriverRaceResultOut(
                round=race.round,
                race_name=race.name,
                circuit_name=circuit.name if circuit else "Unknown",
                date=race.date,
                grid_position=race_result.grid_position if race_result else None,
                position=race_result.position if race_result else None,
                position_text=race_result.position_text if race_result else None,
                points=race_result.points if race_result else 0,
                laps_completed=race_result.laps_completed if race_result else None,
                finish_time=race_result.finish_time if race_result else None,
                fastest_lap_time=race_result.fastest_lap_time if race_result else None,
                fastest_lap_speed=race_result.fastest_lap_speed if race_result else None,
                fastest_lap_rank=race_result.fastest_lap_rank if race_result else None,
                status=status_text,
                qualifying_position=quali_position,
            )
        )

    return results
