from datetime import date, time

from pydantic import BaseModel


class SessionBrief(BaseModel):
    id: int
    type: str
    name: str
    date: date
    time: time | None = None
    status: str | None = None

    class Config:
        from_attributes = True


class SessionDetail(BaseModel):
    id: int
    type: str
    name: str
    date: date
    time: time | None = None
    status: str | None = None
    race_id: int | None = None
    circuit_id: int | None = None

    class Config:
        from_attributes = True
