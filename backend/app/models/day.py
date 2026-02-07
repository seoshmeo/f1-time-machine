from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class CalendarDay(Base):
    __tablename__ = "calendar_days"
    __table_args__ = (UniqueConstraint("season_id", "date", name="uq_season_date"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    season_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("seasons.id"), nullable=False, index=True
    )
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    day_type: Mapped[str] = mapped_column(String(50), nullable=False)
    race_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("races.id"), index=True)
    description: Mapped[str | None] = mapped_column(String(500))
    has_content: Mapped[bool] = mapped_column(Boolean, default=False)

    season: Mapped["Season"] = relationship("Season", back_populates="calendar_days")
    race: Mapped["Race | None"] = relationship("Race", back_populates="calendar_days")
    events: Mapped[list["Event"]] = relationship("Event", back_populates="day")
    articles: Mapped[list["Article"]] = relationship("Article", back_populates="day")
    quotes: Mapped[list["Quote"]] = relationship("Quote", back_populates="day")
