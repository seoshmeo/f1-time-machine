from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Quote, Season
from app.schemas.quote import QuoteOut

router = APIRouter()


@router.get("/seasons/{year}/quotes", response_model=list[QuoteOut])
def get_season_quotes(year: int, db: Session = Depends(get_db)):
    season = db.query(Season).filter(Season.year == year).first()
    if not season:
        raise HTTPException(status_code=404, detail=f"Season {year} not found")

    quotes = (
        db.query(Quote)
        .filter(Quote.season_id == season.id)
        .order_by(Quote.created_at.desc())
        .all()
    )

    return [QuoteOut.model_validate(quote) for quote in quotes]
