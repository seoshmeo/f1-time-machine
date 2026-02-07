from datetime import date as Date, time as Time

from pydantic import BaseModel


class SessionBrief(BaseModel):
    id: int
    type: str
    name: str
    date: Date
    time: Time | None = None
    status: str | None = None

    class Config:
        from_attributes = True


class SessionDetail(BaseModel):
    id: int
    type: str
    name: str
    date: Date
    time: Time | None = None
    status: str | None = None
    race_id: int | None = None
    circuit_id: int | None = None

    class Config:
        from_attributes = True
