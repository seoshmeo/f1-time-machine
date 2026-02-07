from datetime import date

from pydantic import BaseModel

from app.schemas.article import ArticleBrief
from app.schemas.event import EventOut
from app.schemas.quote import QuoteOut


class DayBrief(BaseModel):
    date: date
    day_type: str
    description: str | None = None
    has_content: bool

    class Config:
        from_attributes = True


class DayDetail(BaseModel):
    date: date
    day_type: str
    description: str | None = None
    race_name: str | None = None
    race_round: int | None = None
    events: list[EventOut] = []
    articles: list[ArticleBrief] = []
    quotes: list[QuoteOut] = []

    class Config:
        from_attributes = True


class DayNavigation(BaseModel):
    current_date: date
    previous_date: date | None = None
    next_date: date | None = None
    has_previous: bool
    has_next: bool


class TodayResponse(BaseModel):
    today: date
    historical_date: date
    years_ago: int
    day: DayDetail | None = None
