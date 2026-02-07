from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Constructor, ConstructorStanding, Driver, Race, Result, Season, SeasonEntry
from app.models import Session as SessionModel
from app.schemas.constructor import (
    ConstructorBrief,
    ConstructorDetail,
    ConstructorDriverOut,
    ConstructorSeasonStatsOut,
)

router = APIRouter()

CONSTRUCTOR_TECH_2010 = {
    "red_bull": {"chassis": "RB6", "engine": "Renault RS27"},
    "mclaren": {"chassis": "MP4-25", "engine": "Mercedes FO 108X"},
    "ferrari": {"chassis": "F10", "engine": "Ferrari 056"},
    "mercedes": {"chassis": "MGP W01", "engine": "Mercedes FO 108X"},
    "renault": {"chassis": "R30", "engine": "Renault RS27"},
    "williams": {"chassis": "FW32", "engine": "Cosworth CA2010"},
    "force_india": {"chassis": "VJM03", "engine": "Mercedes FO 108X"},
    "sauber": {"chassis": "C29", "engine": "Ferrari 056"},
    "toro_rosso": {"chassis": "STR5", "engine": "Ferrari 056"},
    "lotus_racing": {"chassis": "T127", "engine": "Cosworth CA2010"},
    "hrt": {"chassis": "F110", "engine": "Cosworth CA2010"},
    "virgin": {"chassis": "VR-01", "engine": "Cosworth CA2010"},
}


@router.get("/seasons/{year}/constructors", response_model=list[ConstructorBrief])
def get_season_constructors(year: int, db: Session = Depends(get_db)):
    season = db.query(Season).filter(Season.year == year).first()
    if not season:
        raise HTTPException(status_code=404, detail=f"Season {year} not found")

    constructors = (
        db.query(Constructor)
        .join(SeasonEntry)
        .filter(SeasonEntry.season_id == season.id)
        .distinct()
        .order_by(Constructor.name)
        .all()
    )

    return [ConstructorBrief.model_validate(constructor) for constructor in constructors]


@router.get("/constructors/{constructor_ref}", response_model=ConstructorDetail)
def get_constructor(
    constructor_ref: str,
    season: int | None = Query(None, description="Season year for stats"),
    db: Session = Depends(get_db),
):
    constructor = (
        db.query(Constructor).filter(Constructor.constructor_ref == constructor_ref).first()
    )
    if not constructor:
        raise HTTPException(status_code=404, detail=f"Constructor {constructor_ref} not found")

    result = ConstructorDetail.model_validate(constructor)

    if season:
        season_obj = db.query(Season).filter(Season.year == season).first()
        if season_obj:
            # Race results
            race_results = (
                db.query(Result)
                .join(SessionModel, Result.session_id == SessionModel.id)
                .filter(
                    SessionModel.season_id == season_obj.id,
                    SessionModel.type == "R",
                    Result.constructor_id == constructor.id,
                )
                .all()
            )

            # Qualifying results
            quali_results = (
                db.query(Result)
                .join(SessionModel, Result.session_id == SessionModel.id)
                .filter(
                    SessionModel.season_id == season_obj.id,
                    SessionModel.type == "Q",
                    Result.constructor_id == constructor.id,
                )
                .all()
            )

            races = len(set(r.session_id for r in race_results))
            wins = sum(1 for r in race_results if r.position == 1)
            podiums = sum(1 for r in race_results if r.position is not None and r.position <= 3)
            poles = sum(1 for r in quali_results if r.position == 1)
            points = sum(r.points for r in race_results)
            fastest_laps = sum(1 for r in race_results if r.fastest_lap_rank == 1)

            # Final position
            last_race = (
                db.query(Race)
                .filter(Race.season_id == season_obj.id)
                .order_by(Race.round.desc())
                .first()
            )
            final_position = None
            if last_race:
                standing = (
                    db.query(ConstructorStanding)
                    .filter(
                        ConstructorStanding.race_id == last_race.id,
                        ConstructorStanding.constructor_id == constructor.id,
                    )
                    .first()
                )
                if standing:
                    final_position = standing.position

            # Drivers
            entries = (
                db.query(SeasonEntry)
                .filter(
                    SeasonEntry.season_id == season_obj.id,
                    SeasonEntry.constructor_id == constructor.id,
                    SeasonEntry.is_test_driver.is_(False),
                )
                .all()
            )
            drivers = []
            for entry in entries:
                driver = db.query(Driver).filter(Driver.id == entry.driver_id).first()
                if driver:
                    drivers.append(
                        ConstructorDriverOut(
                            driver_ref=driver.driver_ref,
                            code=driver.code,
                            first_name=driver.first_name,
                            last_name=driver.last_name,
                            car_number=entry.car_number,
                        )
                    )

            # Per-race results
            all_races = (
                db.query(Race)
                .filter(Race.season_id == season_obj.id)
                .order_by(Race.round)
                .all()
            )
            race_results_list = []
            for race in all_races:
                race_session = (
                    db.query(SessionModel)
                    .filter(SessionModel.race_id == race.id, SessionModel.type == "R")
                    .first()
                )
                if race_session:
                    results = (
                        db.query(Result)
                        .filter(
                            Result.session_id == race_session.id,
                            Result.constructor_id == constructor.id,
                        )
                        .all()
                    )
                    driver_results = []
                    for res in results:
                        driver = db.query(Driver).filter(Driver.id == res.driver_id).first()
                        driver_results.append({
                            "driver_code": driver.code if driver else None,
                            "position": res.position,
                            "points": res.points,
                        })
                    race_results_list.append({
                        "round": race.round,
                        "race_name": race.name,
                        "driver_results": driver_results,
                    })

            # Technical data
            tech_data = CONSTRUCTOR_TECH_2010.get(constructor_ref, {})

            result.season_stats = ConstructorSeasonStatsOut(
                races=races,
                wins=wins,
                podiums=podiums,
                poles=poles,
                points=points,
                final_position=final_position,
                fastest_laps=fastest_laps,
                drivers=drivers,
                chassis=tech_data.get("chassis"),
                engine=tech_data.get("engine"),
                race_results=race_results_list,
            )

    return result
