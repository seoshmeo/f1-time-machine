from datetime import date, datetime

from sqlalchemy import Date, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Season(Base):
    __tablename__ = "seasons"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    year: Mapped[int] = mapped_column(Integer, unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    url: Mapped[str | None] = mapped_column(String(500))
    start_date: Mapped[date | None] = mapped_column(Date)
    end_date: Mapped[date | None] = mapped_column(Date)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    races: Mapped[list["Race"]] = relationship("Race", back_populates="season")
    sessions: Mapped[list["Session"]] = relationship("Session", back_populates="season")
    season_entries: Mapped[list["SeasonEntry"]] = relationship(
        "SeasonEntry", back_populates="season"
    )
    calendar_days: Mapped[list["CalendarDay"]] = relationship(
        "CalendarDay", back_populates="season"
    )
    events: Mapped[list["Event"]] = relationship("Event", back_populates="season")
    articles: Mapped[list["Article"]] = relationship("Article", back_populates="season")
    quotes: Mapped[list["Quote"]] = relationship("Quote", back_populates="season")
