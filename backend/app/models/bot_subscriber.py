from datetime import datetime, time

from sqlalchemy import BigInteger, Boolean, DateTime, Integer, String, Time
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class BotSubscriber(Base):
    __tablename__ = "bot_subscribers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    telegram_id: Mapped[int] = mapped_column(BigInteger, unique=True, nullable=False, index=True)
    chat_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    username: Mapped[str | None] = mapped_column(String(100))
    first_name: Mapped[str | None] = mapped_column(String(200))
    language: Mapped[str] = mapped_column(String(10), default="en")
    timezone: Mapped[str] = mapped_column(String(50), default="UTC")
    send_time: Mapped[time] = mapped_column(Time, default=time(9, 0))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    season_filter: Mapped[str | None] = mapped_column(String(100))
    subscribed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    last_message_at: Mapped[datetime | None] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
