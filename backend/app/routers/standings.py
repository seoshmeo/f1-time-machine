from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import (
    Constructor,
    ConstructorStanding,
    Driver,
    DriverStanding,
    Race,
    Result,
    Season,
    SeasonEntry,
)
from app.schemas.constructor import ConstructorBrief
from app.schemas.driver import DriverBrief
from app.schemas.standing import (
    ConstructorStandingOut,
    DriverStandingOut,
    PointsAfterRound,
    StandingsProgressionOut,
)

router = APIRouter()


@router.get("/seasons/{year}/standings/drivers", response_model=list[DriverStandingOut])
def get_driver_standings(
    year: int, round: int | None = Query(None), db: Session = Depends(get_db)
):
    season = db.query(Season).filter(Season.year == year).first()
    if not season:
        raise HTTPException(status_code=404, detail=f"Season {year} not found")

    if round is None:
        race = (
            db.query(Race)
            .filter(Race.season_id == season.id)
            .order_by(Race.round.desc())
            .first()
        )
    else:
        race = (
            db.query(Race).filter(Race.season_id == season.id, Race.round == round).first()
        )

    if not race:
        return []

    standings = (
        db.query(DriverStanding)
        .options(joinedload(DriverStanding.driver))
        .filter(DriverStanding.race_id == race.id)
        .order_by(DriverStanding.position)
        .all()
    )

    result = []
    for standing in standings:
        entry = (
            db.query(SeasonEntry)
            .join(Constructor)
            .filter(
                SeasonEntry.season_id == season.id,
                SeasonEntry.driver_id == standing.driver_id,
            )
            .first()
        )

        constructor_name = entry.constructor.name if entry else "Unknown"

        result.append(
            DriverStandingOut(
                position=standing.position,
                driver=DriverBrief.model_validate(standing.driver),
                constructor_name=constructor_name,
                points=standing.points,
                wins=standing.wins,
            )
        )

    return result


@router.get("/seasons/{year}/standings/constructors", response_model=list[ConstructorStandingOut])
def get_constructor_standings(
    year: int, round: int | None = Query(None), db: Session = Depends(get_db)
):
    season = db.query(Season).filter(Season.year == year).first()
    if not season:
        raise HTTPException(status_code=404, detail=f"Season {year} not found")

    if round is None:
        race = (
            db.query(Race)
            .filter(Race.season_id == season.id)
            .order_by(Race.round.desc())
            .first()
        )
    else:
        race = (
            db.query(Race).filter(Race.season_id == season.id, Race.round == round).first()
        )

    if not race:
        return []

    standings = (
        db.query(ConstructorStanding)
        .options(joinedload(ConstructorStanding.constructor))
        .filter(ConstructorStanding.race_id == race.id)
        .order_by(ConstructorStanding.position)
        .all()
    )

    return [
        ConstructorStandingOut(
            position=standing.position,
            constructor=ConstructorBrief.model_validate(standing.constructor),
            points=standing.points,
            wins=standing.wins,
        )
        for standing in standings
    ]


@router.get("/seasons/{year}/standings/drivers/progression", response_model=list[StandingsProgressionOut])
def get_standings_progression(year: int, db: Session = Depends(get_db)):
    season = db.query(Season).filter(Season.year == year).first()
    if not season:
        raise HTTPException(status_code=404, detail=f"Season {year} not found")

    races = (
        db.query(Race).filter(Race.season_id == season.id).order_by(Race.round).all()
    )

    if not races:
        return []

    drivers_map = {}

    for race in races:
        standings = (
            db.query(DriverStanding)
            .options(joinedload(DriverStanding.driver))
            .filter(DriverStanding.race_id == race.id)
            .all()
        )

        for standing in standings:
            driver_id = standing.driver_id
            if driver_id not in drivers_map:
                drivers_map[driver_id] = {
                    "driver": standing.driver,
                    "progression": [],
                }

            drivers_map[driver_id]["progression"].append(
                PointsAfterRound(round=race.round, points=standing.points)
            )

    result = []
    for driver_data in drivers_map.values():
        result.append(
            StandingsProgressionOut(
                driver=DriverBrief.model_validate(driver_data["driver"]),
                progression=driver_data["progression"],
            )
        )

    result.sort(
        key=lambda x: x.progression[-1].points if x.progression else 0, reverse=True
    )

    return result
