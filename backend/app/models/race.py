from datetime import date, datetime, time

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, Time, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Race(Base):
    __tablename__ = "races"
    __table_args__ = (UniqueConstraint("season_id", "round", name="uq_season_round"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    season_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("seasons.id"), nullable=False, index=True
    )
    round: Mapped[int] = mapped_column(Integer, nullable=False)
    circuit_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("circuits.id"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    official_name: Mapped[str | None] = mapped_column(String(300))
    date: Mapped[date] = mapped_column(Date, nullable=False)
    time: Mapped[time | None] = mapped_column(Time)
    url: Mapped[str | None] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    season: Mapped["Season"] = relationship("Season", back_populates="races")
    circuit: Mapped["Circuit"] = relationship("Circuit", back_populates="races")
    sessions: Mapped[list["Session"]] = relationship("Session", back_populates="race")
    driver_standings: Mapped[list["DriverStanding"]] = relationship(
        "DriverStanding", back_populates="race"
    )
    constructor_standings: Mapped[list["ConstructorStanding"]] = relationship(
        "ConstructorStanding", back_populates="race"
    )
    calendar_days: Mapped[list["CalendarDay"]] = relationship(
        "CalendarDay", back_populates="race"
    )
