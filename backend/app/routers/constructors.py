from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Constructor, Season, SeasonEntry
from app.schemas.constructor import ConstructorBrief, ConstructorDetail

router = APIRouter()


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
def get_constructor(constructor_ref: str, db: Session = Depends(get_db)):
    constructor = (
        db.query(Constructor).filter(Constructor.constructor_ref == constructor_ref).first()
    )
    if not constructor:
        raise HTTPException(status_code=404, detail=f"Constructor {constructor_ref} not found")

    return ConstructorDetail.model_validate(constructor)
