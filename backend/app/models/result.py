from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Result(Base):
    __tablename__ = "results"
    __table_args__ = (UniqueConstraint("session_id", "driver_id", name="uq_session_driver"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    session_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("sessions.id"), nullable=False, index=True
    )
    driver_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("drivers.id"), nullable=False, index=True
    )
    constructor_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("constructors.id"), nullable=False, index=True
    )
    car_number: Mapped[int | None] = mapped_column(Integer)
    grid_position: Mapped[int | None] = mapped_column(Integer)
    position: Mapped[int | None] = mapped_column(Integer)
    position_text: Mapped[str | None] = mapped_column(String(10))
    position_order: Mapped[int] = mapped_column(Integer, nullable=False)
    points: Mapped[float] = mapped_column(Float, default=0.0)
    laps_completed: Mapped[int | None] = mapped_column(Integer)
    finish_time: Mapped[str | None] = mapped_column(String(50))
    finish_time_ms: Mapped[int | None] = mapped_column(Integer)
    fastest_lap: Mapped[int | None] = mapped_column(Integer)
    fastest_lap_rank: Mapped[int | None] = mapped_column(Integer)
    fastest_lap_time: Mapped[str | None] = mapped_column(String(50))
    fastest_lap_speed: Mapped[float | None] = mapped_column(Float)
    q1_time: Mapped[str | None] = mapped_column(String(50))
    q2_time: Mapped[str | None] = mapped_column(String(50))
    q3_time: Mapped[str | None] = mapped_column(String(50))
    status_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("statuses.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    session: Mapped["Session"] = relationship("Session", back_populates="results")
    driver: Mapped["Driver"] = relationship("Driver", back_populates="results")
    constructor: Mapped["Constructor"] = relationship("Constructor", back_populates="results")
    status: Mapped["Status | None"] = relationship("Status", back_populates="results")
