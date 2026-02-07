from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Quote(Base):
    __tablename__ = "quotes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    day_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("calendar_days.id"), index=True
    )
    season_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("seasons.id"), nullable=False, index=True
    )
    driver_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("drivers.id"), index=True)
    author_name: Mapped[str] = mapped_column(String(200), nullable=False)
    author_role: Mapped[str | None] = mapped_column(String(200))
    text: Mapped[str] = mapped_column(Text, nullable=False)
    context: Mapped[str | None] = mapped_column(Text)
    source: Mapped[str | None] = mapped_column(String(200))
    source_url: Mapped[str | None] = mapped_column(String(500))
    language: Mapped[str] = mapped_column(String(10), default="en")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    day: Mapped["CalendarDay | None"] = relationship("CalendarDay", back_populates="quotes")
    season: Mapped["Season"] = relationship("Season", back_populates="quotes")
    driver: Mapped["Driver | None"] = relationship("Driver", back_populates="quotes")
