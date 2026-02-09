from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Circuit, Race, Result, Season, Session as SessionModel
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
        .options(joinedload(Race.circuit))
        .filter(Race.season_id == season.id)
        .order_by(Race.round)
        .all()
    )

    # Fetch winner and pole for each race
    race_ids = [r.id for r in races]
    sessions = (
        db.query(SessionModel)
        .filter(SessionModel.race_id.in_(race_ids), SessionModel.type.in_(["R", "Q"]))
        .all()
    )
    session_map: dict[int, dict[str, int]] = {}
    for s in sessions:
        session_map.setdefault(s.race_id, {})[s.type] = s.id

    # Get P1 results for race and qualifying sessions
    all_session_ids = []
    for m in session_map.values():
        all_session_ids.extend(m.values())

    p1_results = (
        db.query(Result)
        .options(joinedload(Result.driver))
        .filter(Result.session_id.in_(all_session_ids), Result.position == 1)
        .all()
    ) if all_session_ids else []

    p1_map: dict[int, str] = {}
    for r in p1_results:
        p1_map[r.session_id] = f"{r.driver.first_name} {r.driver.last_name}"

    result = []
    for race in races:
        sm = session_map.get(race.id, {})
        winner_name = p1_map.get(sm.get("R", -1))
        pole_name = p1_map.get(sm.get("Q", -1))
        result.append(
            RaceBrief(
                id=race.id,
                round=race.round,
                name=race.name,
                date=race.date,
                time=race.time,
                circuit_name=race.circuit.name,
                circuit_country=race.circuit.country,
                winner_name=winner_name,
                pole_name=pole_name,
            )
        )

    return result


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
