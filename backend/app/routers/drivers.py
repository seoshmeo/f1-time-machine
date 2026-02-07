from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Constructor, Driver, Result, Season, SeasonEntry
from app.models import Session as SessionModel
from app.schemas.driver import DriverBrief, DriverDetail

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
def get_driver(driver_ref: str, db: Session = Depends(get_db)):
    driver = db.query(Driver).filter(Driver.driver_ref == driver_ref).first()
    if not driver:
        raise HTTPException(status_code=404, detail=f"Driver {driver_ref} not found")

    return DriverDetail.model_validate(driver)
