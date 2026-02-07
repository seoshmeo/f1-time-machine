from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class DriverStanding(Base):
    __tablename__ = "driver_standings"
    __table_args__ = (UniqueConstraint("race_id", "driver_id", name="uq_race_driver"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    race_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("races.id"), nullable=False, index=True
    )
    driver_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("drivers.id"), nullable=False, index=True
    )
    points: Mapped[float] = mapped_column(Float, nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    position_text: Mapped[str | None] = mapped_column(String(10))
    wins: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    race: Mapped["Race"] = relationship("Race", back_populates="driver_standings")
    driver: Mapped["Driver"] = relationship("Driver", back_populates="driver_standings")


class ConstructorStanding(Base):
    __tablename__ = "constructor_standings"
    __table_args__ = (
        UniqueConstraint("race_id", "constructor_id", name="uq_race_constructor"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    race_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("races.id"), nullable=False, index=True
    )
    constructor_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("constructors.id"), nullable=False, index=True
    )
    points: Mapped[float] = mapped_column(Float, nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    position_text: Mapped[str | None] = mapped_column(String(10))
    wins: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    race: Mapped["Race"] = relationship("Race", back_populates="constructor_standings")
    constructor: Mapped["Constructor"] = relationship(
        "Constructor", back_populates="constructor_standings"
    )
