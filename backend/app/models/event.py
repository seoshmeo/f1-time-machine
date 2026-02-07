from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Table,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

event_drivers = Table(
    "event_drivers",
    Base.metadata,
    Column("event_id", Integer, ForeignKey("events.id"), primary_key=True),
    Column("driver_id", Integer, ForeignKey("drivers.id"), primary_key=True),
)


class Event(Base):
    __tablename__ = "events"
    __table_args__ = (
        CheckConstraint("importance >= 1 AND importance <= 5", name="check_importance_range"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    day_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("calendar_days.id"), nullable=False, index=True
    )
    season_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("seasons.id"), nullable=False, index=True
    )
    session_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("sessions.id"))
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    summary: Mapped[str | None] = mapped_column(Text)
    detail: Mapped[str | None] = mapped_column(Text)
    importance: Mapped[int] = mapped_column(Integer, default=3)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    source_url: Mapped[str | None] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    day: Mapped["CalendarDay"] = relationship("CalendarDay", back_populates="events")
    season: Mapped["Season"] = relationship("Season", back_populates="events")
    session: Mapped["Session | None"] = relationship("Session", back_populates="events")
    drivers: Mapped[list["Driver"]] = relationship(
        "Driver", secondary=event_drivers, backref="events"
    )
    tags: Mapped[list["EventTag"]] = relationship("EventTag", back_populates="event")


class EventTag(Base):
    __tablename__ = "event_tags"

    event_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("events.id"), primary_key=True
    )
    tag_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("tags.id"), primary_key=True
    )

    event: Mapped["Event"] = relationship("Event", back_populates="tags")
    tag: Mapped["Tag"] = relationship("Tag", back_populates="event_tags")
