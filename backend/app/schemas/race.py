from datetime import date as Date, time as Time

from pydantic import BaseModel

from app.schemas.session import SessionBrief


class CircuitOut(BaseModel):
    id: int
    circuit_ref: str
    name: str
    location: str
    country: str
    lat: float | None = None
    lng: float | None = None
    alt: int | None = None
    url: str | None = None

    class Config:
        from_attributes = True


class RaceBrief(BaseModel):
    id: int
    round: int
    name: str
    date: Date
    time: Time | None = None
    circuit_name: str
    circuit_country: str
    winner_name: str | None = None
    pole_name: str | None = None

    class Config:
        from_attributes = True


class RaceDetail(BaseModel):
    id: int
    round: int
    name: str
    official_name: str | None = None
    date: Date
    time: Time | None = None
    url: str | None = None
    circuit: CircuitOut
    sessions: list[SessionBrief] = []

    class Config:
        from_attributes = True
