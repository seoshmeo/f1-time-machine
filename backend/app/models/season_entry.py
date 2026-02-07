from sqlalchemy import Boolean, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class SeasonEntry(Base):
    __tablename__ = "season_entries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    season_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("seasons.id"), nullable=False, index=True
    )
    driver_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("drivers.id"), nullable=False, index=True
    )
    constructor_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("constructors.id"), nullable=False, index=True
    )
    car_number: Mapped[int | None] = mapped_column(Integer)
    is_test_driver: Mapped[bool] = mapped_column(Boolean, default=False)

    season: Mapped["Season"] = relationship("Season", back_populates="season_entries")
    driver: Mapped["Driver"] = relationship("Driver", back_populates="season_entries")
    constructor: Mapped["Constructor"] = relationship(
        "Constructor", back_populates="season_entries"
    )
