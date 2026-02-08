from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Event, EventTag, Season, Tag
from app.schemas.event import EventOut

router = APIRouter()


@router.get("/seasons/{year}/events", response_model=list[EventOut])
def get_season_events(
    year: int,
    type: Optional[str] = None,
    tag: Optional[str] = None,
    db: Session = Depends(get_db),
):
    season = db.query(Season).filter(Season.year == year).first()
    if not season:
        raise HTTPException(status_code=404, detail=f"Season {year} not found")

    query = db.query(Event).filter(Event.season_id == season.id)

    if type:
        query = query.filter(Event.type == type)

    if tag:
        query = (
            query.join(EventTag, Event.id == EventTag.event_id)
            .join(Tag, EventTag.tag_id == Tag.id)
            .filter(Tag.slug == tag)
        )

    events = query.order_by(Event.importance.asc(), Event.sort_order.asc()).all()

    return [
        EventOut(
            id=event.id,
            type=event.type,
            title=event.title,
            summary=event.summary,
            detail=event.detail,
            importance=event.importance,
            source_url=event.source_url,
            session_id=event.session_id,
            driver_ids=[d.id for d in event.drivers],
            tag_names=[et.tag.name for et in event.tags],
        )
        for event in events
    ]
