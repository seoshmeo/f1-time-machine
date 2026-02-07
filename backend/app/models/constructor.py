from datetime import datetime

from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Constructor(Base):
    __tablename__ = "constructors"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    constructor_ref: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(200))
    nationality: Mapped[str] = mapped_column(String(100), nullable=False)
    url: Mapped[str | None] = mapped_column(String(500))
    color_primary: Mapped[str | None] = mapped_column(String(7))
    color_secondary: Mapped[str | None] = mapped_column(String(7))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    results: Mapped[list["Result"]] = relationship("Result", back_populates="constructor")
    constructor_standings: Mapped[list["ConstructorStanding"]] = relationship(
        "ConstructorStanding", back_populates="constructor"
    )
    season_entries: Mapped[list["SeasonEntry"]] = relationship(
        "SeasonEntry", back_populates="constructor"
    )
