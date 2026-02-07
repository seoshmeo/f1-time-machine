from datetime import date as date_type
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models import CalendarDay, Season
from app.schemas.day import DayBrief, DayDetail, DayNavigation, TodayResponse
from app.services.day_service import get_day_detail, get_day_navigation, get_today

router = APIRouter()
settings = get_settings()


@router.get("/seasons/{year}/days", response_model=list[DayBrief])
def get_season_days(
    year: int,
    has_content: bool | None = Query(None),
    db: Session = Depends(get_db),
):
    season = db.query(Season).filter(Season.year == year).first()
    if not season:
        raise HTTPException(status_code=404, detail=f"Season {year} not found")

    query = db.query(CalendarDay).filter(CalendarDay.season_id == season.id)

    if has_content is not None:
        query = query.filter(CalendarDay.has_content == has_content)

    days = query.order_by(CalendarDay.date).all()

    return [DayBrief.model_validate(day) for day in days]


@router.get("/seasons/{year}/days/{date}", response_model=DayDetail)
def get_day(year: int, date: date_type, db: Session = Depends(get_db)):
    season = db.query(Season).filter(Season.year == year).first()
    if not season:
        raise HTTPException(status_code=404, detail=f"Season {year} not found")

    day_detail = get_day_detail(db, season.id, date)
    if not day_detail:
        raise HTTPException(status_code=404, detail=f"Day {date} not found in season {year}")

    return day_detail


@router.get("/seasons/{year}/days/{date}/navigation", response_model=DayNavigation)
def get_day_nav(year: int, date: date_type, db: Session = Depends(get_db)):
    season = db.query(Season).filter(Season.year == year).first()
    if not season:
        raise HTTPException(status_code=404, detail=f"Season {year} not found")

    navigation = get_day_navigation(db, season.id, date)
    if not navigation:
        raise HTTPException(
            status_code=404, detail=f"Navigation for {date} not found in season {year}"
        )

    return navigation


@router.get("/seasons/{year}/today", response_model=TodayResponse)
def get_today_for_season(year: int, db: Session = Depends(get_db)):
    season = db.query(Season).filter(Season.year == year).first()
    if not season:
        raise HTTPException(status_code=404, detail=f"Season {year} not found")

    return get_today(db, season.id)
