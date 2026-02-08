from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Penalty, Race, Season
from app.schemas.penalty import PenaltyOut

router = APIRouter()


@router.get("/seasons/{year}/races/{round}/penalties", response_model=list[PenaltyOut])
def get_race_penalties(year: int, round: int, db: Session = Depends(get_db)):
    season = db.query(Season).filter(Season.year == year).first()
    if not season:
        raise HTTPException(status_code=404, detail=f"Season {year} not found")

    race = (
        db.query(Race).filter(Race.season_id == season.id, Race.round == round).first()
    )
    if not race:
        raise HTTPException(status_code=404, detail=f"Race round {round} not found in {year}")

    penalties = (
        db.query(Penalty)
        .options(
            joinedload(Penalty.driver),
            joinedload(Penalty.constructor),
        )
        .filter(Penalty.race_id == race.id)
        .order_by(Penalty.id)
        .all()
    )

    return [
        PenaltyOut(
            id=p.id,
            round=p.round,
            penalty_type=p.penalty_type,
            timing=p.timing,
            penalty_value=p.penalty_value,
            reason=p.reason,
            description=p.description,
            incident_time=p.incident_time,
            driver_name=(
                f"{p.driver.first_name} {p.driver.last_name}" if p.driver else None
            ),
            constructor_name=p.constructor.name if p.constructor else None,
            constructor_ref=p.constructor.constructor_ref if p.constructor else None,
        )
        for p in penalties
    ]
