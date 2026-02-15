from datetime import date, datetime, time

from sqlalchemy import CheckConstraint, Date, DateTime, ForeignKey, Integer, String, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Session(Base):
    __tablename__ = "sessions"
    __table_args__ = (
        CheckConstraint(
            "type IN ('FP1', 'FP2', 'FP3', 'Q', 'SQ', 'R', 'TEST', 'SPRINT')",
            name="check_session_type",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    race_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("races.id"), index=True)
    season_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("seasons.id"), nullable=False, index=True
    )
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    time: Mapped[time | None] = mapped_column(Time)
    circuit_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("circuits.id"))
    status: Mapped[str | None] = mapped_column(String(50))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    race: Mapped["Race | None"] = relationship("Race", back_populates="sessions")
    season: Mapped["Season"] = relationship("Season", back_populates="sessions")
    circuit: Mapped["Circuit | None"] = relationship("Circuit", back_populates="sessions")
    results: Mapped[list["Result"]] = relationship("Result", back_populates="session")
    events: Mapped[list["Event"]] = relationship("Event", back_populates="session")
    penalties: Mapped[list["Penalty"]] = relationship("Penalty", back_populates="session")
