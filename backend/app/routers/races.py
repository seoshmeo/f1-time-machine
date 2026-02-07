from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Circuit, Race, Season, Session as SessionModel
from app.schemas.race import CircuitOut, RaceBrief, RaceDetail
from app.schemas.session import SessionBrief

router = APIRouter()


@router.get("/seasons/{year}/races", response_model=list[RaceBrief])
def get_races(year: int, db: Session = Depends(get_db)):
    season = db.query(Season).filter(Season.year == year).first()
    if not season:
        raise HTTPException(status_code=404, detail=f"Season {year} not found")

    races = (
        db.query(Race)
        .join(Circuit)
        .filter(Race.season_id == season.id)
        .order_by(Race.round)
        .all()
    )

    return [
        RaceBrief(
            id=race.id,
            round=race.round,
            name=race.name,
            date=race.date,
            time=race.time,
            circuit_name=race.circuit.name,
            circuit_country=race.circuit.country,
        )
        for race in races
    ]


@router.get("/seasons/{year}/races/{round}", response_model=RaceDetail)
def get_race(year: int, round: int, db: Session = Depends(get_db)):
    season = db.query(Season).filter(Season.year == year).first()
    if not season:
        raise HTTPException(status_code=404, detail=f"Season {year} not found")

    race = (
        db.query(Race)
        .options(joinedload(Race.circuit), joinedload(Race.sessions))
        .filter(Race.season_id == season.id, Race.round == round)
        .first()
    )

    if not race:
        raise HTTPException(status_code=404, detail=f"Race round {round} not found in {year}")

    sessions = [
        SessionBrief(
            id=session.id,
            type=session.type,
            name=session.name,
            date=session.date,
            time=session.time,
            status=session.status,
        )
        for session in sorted(race.sessions, key=lambda s: s.date)
    ]

    return RaceDetail(
        id=race.id,
        round=race.round,
        name=race.name,
        official_name=race.official_name,
        date=race.date,
        time=race.time,
        url=race.url,
        circuit=CircuitOut.model_validate(race.circuit),
        sessions=sessions,
    )
