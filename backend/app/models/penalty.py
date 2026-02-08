from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Penalty(Base):
    __tablename__ = "penalties"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    race_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("races.id"), nullable=False, index=True
    )
    session_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("sessions.id"))
    driver_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("drivers.id"))
    constructor_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("constructors.id"))
    round: Mapped[int] = mapped_column(Integer, nullable=False)
    penalty_type: Mapped[str] = mapped_column(String(50), nullable=False)
    timing: Mapped[str] = mapped_column(String(50), nullable=False)
    penalty_value: Mapped[str | None] = mapped_column(String(100))
    reason: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(String(1000))
    incident_time: Mapped[str | None] = mapped_column(String(100))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    race: Mapped["Race"] = relationship("Race", back_populates="penalties")
    session: Mapped["Session | None"] = relationship("Session", back_populates="penalties")
    driver: Mapped["Driver | None"] = relationship("Driver", back_populates="penalties")
    constructor: Mapped["Constructor | None"] = relationship("Constructor", back_populates="penalties")
