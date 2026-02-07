from datetime import date as date_type
from datetime import datetime

from sqlalchemy.orm import Session, joinedload

from app.models import Article, CalendarDay, Event, Quote, Race
from app.schemas.article import ArticleBrief
from app.schemas.day import DayDetail, DayNavigation, TodayResponse
from app.schemas.event import EventOut
from app.schemas.quote import QuoteOut
from app.utils.date_helpers import years_ago_date


def get_day_detail(db: Session, season_id: int, date: date_type) -> DayDetail | None:
    day = (
        db.query(CalendarDay)
        .options(joinedload(CalendarDay.race))
        .filter(CalendarDay.season_id == season_id, CalendarDay.date == date)
        .first()
    )

    if not day:
        return None

    events = (
        db.query(Event)
        .filter(Event.day_id == day.id)
        .order_by(Event.sort_order, Event.importance.desc())
        .all()
    )

    articles = (
        db.query(Article)
        .filter(Article.day_id == day.id)
        .order_by(Article.published_at.desc())
        .all()
    )

    quotes = (
        db.query(Quote)
        .filter(Quote.day_id == day.id)
        .order_by(Quote.created_at.desc())
        .all()
    )

    event_outputs = []
    for event in events:
        driver_ids = [driver.id for driver in event.drivers]
        tag_names = [tag.tag.name for tag in event.tags]

        event_outputs.append(
            EventOut(
                id=event.id,
                type=event.type,
                title=event.title,
                summary=event.summary,
                detail=event.detail,
                importance=event.importance,
                source_url=event.source_url,
                session_id=event.session_id,
                driver_ids=driver_ids,
                tag_names=tag_names,
            )
        )

    return DayDetail(
        date=day.date,
        day_type=day.day_type,
        description=day.description,
        race_name=day.race.name if day.race else None,
        race_round=day.race.round if day.race else None,
        events=event_outputs,
        articles=[ArticleBrief.model_validate(article) for article in articles],
        quotes=[QuoteOut.model_validate(quote) for quote in quotes],
    )


def get_day_navigation(db: Session, season_id: int, date: date_type) -> DayNavigation | None:
    current_day = (
        db.query(CalendarDay)
        .filter(CalendarDay.season_id == season_id, CalendarDay.date == date)
        .first()
    )

    if not current_day:
        return None

    previous_day = (
        db.query(CalendarDay)
        .filter(CalendarDay.season_id == season_id, CalendarDay.date < date)
        .order_by(CalendarDay.date.desc())
        .first()
    )

    next_day = (
        db.query(CalendarDay)
        .filter(CalendarDay.season_id == season_id, CalendarDay.date > date)
        .order_by(CalendarDay.date.asc())
        .first()
    )

    return DayNavigation(
        current_date=date,
        previous_date=previous_day.date if previous_day else None,
        next_date=next_day.date if next_day else None,
        has_previous=previous_day is not None,
        has_next=next_day is not None,
    )


def get_today(db: Session, season_id: int) -> TodayResponse:
    from app.models import Season

    season = db.query(Season).filter(Season.id == season_id).first()
    if not season:
        raise ValueError("Season not found")

    today = datetime.now().date()
    historical_date = years_ago_date(today, season.year)

    day_detail = get_day_detail(db, season_id, historical_date) if historical_date else None

    return TodayResponse(
        today=today,
        historical_date=historical_date or today,
        years_ago=datetime.now().year - season.year,
        day=day_detail,
    )
