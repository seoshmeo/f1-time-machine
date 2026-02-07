from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Constructor, Driver, Race, Season, SeasonEntry
from app.schemas.season import SeasonBrief, SeasonDetail

router = APIRouter()


@router.get("/seasons", response_model=list[SeasonBrief])
def get_seasons(db: Session = Depends(get_db)):
    seasons = db.query(Season).order_by(Season.year.desc()).all()
    return seasons


@router.get("/seasons/{year}", response_model=SeasonDetail)
def get_season(year: int, db: Session = Depends(get_db)):
    season = db.query(Season).filter(Season.year == year).first()
    if not season:
        raise HTTPException(status_code=404, detail=f"Season {year} not found")

    total_races = db.query(func.count(Race.id)).filter(Race.season_id == season.id).scalar()

    total_drivers = (
        db.query(func.count(func.distinct(SeasonEntry.driver_id)))
        .filter(SeasonEntry.season_id == season.id, SeasonEntry.is_test_driver.is_(False))
        .scalar()
    )

    total_constructors = (
        db.query(func.count(func.distinct(SeasonEntry.constructor_id)))
        .filter(SeasonEntry.season_id == season.id)
        .scalar()
    )

    return SeasonDetail(
        year=season.year,
        name=season.name,
        url=season.url,
        start_date=season.start_date,
        end_date=season.end_date,
        total_races=total_races or 0,
        total_drivers=total_drivers or 0,
        total_constructors=total_constructors or 0,
    )
