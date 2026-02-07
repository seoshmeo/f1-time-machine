from datetime import date, datetime

from sqlalchemy import Date, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Driver(Base):
    __tablename__ = "drivers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    driver_ref: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    number: Mapped[int | None] = mapped_column(Integer)
    code: Mapped[str | None] = mapped_column(String(3))
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    date_of_birth: Mapped[date | None] = mapped_column(Date)
    nationality: Mapped[str] = mapped_column(String(100), nullable=False)
    url: Mapped[str | None] = mapped_column(String(500))
    photo_url: Mapped[str | None] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    results: Mapped[list["Result"]] = relationship("Result", back_populates="driver")
    driver_standings: Mapped[list["DriverStanding"]] = relationship(
        "DriverStanding", back_populates="driver"
    )
    season_entries: Mapped[list["SeasonEntry"]] = relationship(
        "SeasonEntry", back_populates="driver"
    )
    quotes: Mapped[list["Quote"]] = relationship("Quote", back_populates="driver")
