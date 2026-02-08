import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Constructor, Driver, Race, Result, Season
from app.models import Session as SessionModel
from app.models import Status
from app.schemas.result import (
    ConstructorSimple,
    DriverSimple,
    FastestLapOut,
    QualifyingResultOut,
    ResultOut,
)

router = APIRouter()


@router.get("/seasons/{year}/races/{round}/results", response_model=list[ResultOut])
def get_race_results(year: int, round: int, db: Session = Depends(get_db)):
    season = db.query(Season).filter(Season.year == year).first()
    if not season:
        raise HTTPException(status_code=404, detail=f"Season {year} not found")

    race = (
        db.query(Race).filter(Race.season_id == season.id, Race.round == round).first()
    )
    if not race:
        raise HTTPException(status_code=404, detail=f"Race round {round} not found in {year}")

    race_session = (
        db.query(SessionModel)
        .filter(SessionModel.race_id == race.id, SessionModel.type == "R")
        .first()
    )
    if not race_session:
        return []

    results = (
        db.query(Result)
        .options(
            joinedload(Result.driver),
            joinedload(Result.constructor),
            joinedload(Result.status),
        )
        .filter(Result.session_id == race_session.id)
        .order_by(Result.position_order)
        .all()
    )

    return [
        ResultOut(
            id=result.id,
            driver=DriverSimple.model_validate(result.driver),
            constructor=ConstructorSimple.model_validate(result.constructor),
            car_number=result.car_number,
            grid_position=result.grid_position,
            position=result.position,
            position_text=result.position_text,
            points=result.points,
            laps_completed=result.laps_completed,
            finish_time=result.finish_time,
            fastest_lap=result.fastest_lap,
            fastest_lap_time=result.fastest_lap_time,
            fastest_lap_speed=result.fastest_lap_speed,
            status=result.status.status if result.status else None,
        )
        for result in results
    ]


@router.get("/seasons/{year}/races/{round}/qualifying", response_model=list[QualifyingResultOut])
def get_qualifying_results(year: int, round: int, db: Session = Depends(get_db)):
    season = db.query(Season).filter(Season.year == year).first()
    if not season:
        raise HTTPException(status_code=404, detail=f"Season {year} not found")

    race = (
        db.query(Race).filter(Race.season_id == season.id, Race.round == round).first()
    )
    if not race:
        raise HTTPException(status_code=404, detail=f"Race round {round} not found in {year}")

    qualifying_session = (
        db.query(SessionModel)
        .filter(SessionModel.race_id == race.id, SessionModel.type == "Q")
        .first()
    )
    if not qualifying_session:
        return []

    results = (
        db.query(Result)
        .options(joinedload(Result.driver), joinedload(Result.constructor))
        .filter(Result.session_id == qualifying_session.id)
        .order_by(Result.position_order)
        .all()
    )

    return [
        QualifyingResultOut(
            id=result.id,
            driver=DriverSimple.model_validate(result.driver),
            constructor=ConstructorSimple.model_validate(result.constructor),
            car_number=result.car_number,
            position=result.position,
            q1_time=result.q1_time,
            q2_time=result.q2_time,
            q3_time=result.q3_time,
        )
        for result in results
    ]


@router.get("/seasons/{year}/races/{round}/fastest-laps", response_model=list[FastestLapOut])
def get_fastest_laps(year: int, round: int, db: Session = Depends(get_db)):
    season = db.query(Season).filter(Season.year == year).first()
    if not season:
        raise HTTPException(status_code=404, detail=f"Season {year} not found")

    race = (
        db.query(Race).filter(Race.season_id == season.id, Race.round == round).first()
    )
    if not race:
        raise HTTPException(status_code=404, detail=f"Race round {round} not found in {year}")

    race_session = (
        db.query(SessionModel)
        .filter(SessionModel.race_id == race.id, SessionModel.type == "R")
        .first()
    )
    if not race_session:
        return []

    results = (
        db.query(Result)
        .options(
            joinedload(Result.driver),
            joinedload(Result.constructor),
        )
        .filter(
            Result.session_id == race_session.id,
            Result.fastest_lap_time.isnot(None),
        )
        .order_by(Result.fastest_lap_rank)
        .all()
    )

    return [
        FastestLapOut(
            rank=result.fastest_lap_rank,
            driver=DriverSimple.model_validate(result.driver),
            constructor=ConstructorSimple.model_validate(result.constructor),
            lap=result.fastest_lap,
            time=result.fastest_lap_time,
            speed=result.fastest_lap_speed,
        )
        for result in results
    ]


@router.get("/sessions/{session_id}/results")
def get_session_results(session_id: int, db: Session = Depends(get_db)):
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")

    results = (
        db.query(Result)
        .options(
            joinedload(Result.driver),
            joinedload(Result.constructor),
            joinedload(Result.status),
        )
        .filter(Result.session_id == session_id)
        .order_by(Result.position_order)
        .all()
    )

    # For qualifying sessions, return qualifying format
    if session.type == "Q":
        return [
            {
                "position": result.position,
                "driver_name": f"{result.driver.first_name} {result.driver.last_name}",
                "constructor_name": result.constructor.name,
                "constructor_ref": result.constructor.constructor_ref,
                "q1_time": result.q1_time,
                "q2_time": result.q2_time,
                "q3_time": result.q3_time,
            }
            for result in results
        ]

    # For race sessions, return race format
    if session.type == "R":
        return [
            {
                "position": result.position,
                "driver_name": f"{result.driver.first_name} {result.driver.last_name}",
                "constructor_name": result.constructor.name,
                "constructor_ref": result.constructor.constructor_ref,
                "time": result.finish_time,
                "points": result.points,
                "status": result.status.status if result.status else None,
                "grid": result.grid_position,
                "laps": result.laps_completed,
            }
            for result in results
        ]

    # For practice sessions (FP1, FP2, FP3), return practice format
    return [
        {
            "position": result.position,
            "driver_name": f"{result.driver.first_name} {result.driver.last_name}",
            "constructor_name": result.constructor.name,
            "constructor_ref": result.constructor.constructor_ref,
            "time": result.fastest_lap_time or result.finish_time,
            "laps": result.laps_completed,
        }
        for result in results
    ]


@router.get("/seasons/{year}/races/{round}/lap-positions")
def get_lap_positions(year: int, round: int, db: Session = Depends(get_db)):
    """Fetch lap-by-lap position data from Ergast API for a race."""
    season = db.query(Season).filter(Season.year == year).first()
    if not season:
        raise HTTPException(status_code=404, detail=f"Season {year} not found")

    race = (
        db.query(Race)
        .filter(Race.season_id == season.id, Race.round == round)
        .first()
    )
    if not race:
        raise HTTPException(
            status_code=404, detail=f"Race round {round} not found in {year}"
        )

    race_session = (
        db.query(SessionModel)
        .filter(SessionModel.race_id == race.id, SessionModel.type == "R")
        .first()
    )
    if not race_session:
        return {"drivers": [], "laps": []}

    # Get driver/constructor info from DB
    results = (
        db.query(Result)
        .options(joinedload(Result.driver), joinedload(Result.constructor))
        .filter(Result.session_id == race_session.id)
        .all()
    )

    driver_map = {}
    for r in results:
        ref = r.driver.driver_ref
        driver_map[ref] = {
            "driver_id": ref,
            "name": f"{r.driver.first_name} {r.driver.last_name}",
            "constructor_ref": r.constructor.constructor_ref,
            "abbreviation": r.driver.code or r.driver.last_name[:3].upper(),
        }

    # Fetch lap data from Ergast/Jolpica API
    url = f"https://api.jolpi.ca/ergast/f1/{year}/{round}/laps.json?limit=2000"
    try:
        resp = httpx.get(url, timeout=30)
        resp.raise_for_status()
        data = resp.json()
    except Exception:
        return {"drivers": list(driver_map.values()), "laps": []}

    races = data.get("MRData", {}).get("RaceTable", {}).get("Races", [])
    if not races:
        return {"drivers": list(driver_map.values()), "laps": []}

    laps_data = races[0].get("Laps", [])

    lap_rows = []
    for lap in laps_data:
        row: dict = {"lap": int(lap["number"])}
        for timing in lap.get("Timings", []):
            driver_id = timing["driverId"]
            row[driver_id] = int(timing["position"])
        lap_rows.append(row)

    return {"drivers": list(driver_map.values()), "laps": lap_rows}
