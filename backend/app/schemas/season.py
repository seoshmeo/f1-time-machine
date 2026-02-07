from datetime import date

from pydantic import BaseModel


class SeasonBrief(BaseModel):
    year: int
    name: str
    url: str | None = None
    start_date: date | None = None
    end_date: date | None = None

    class Config:
        from_attributes = True


class SeasonDetail(BaseModel):
    year: int
    name: str
    url: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    total_races: int = 0
    total_drivers: int = 0
    total_constructors: int = 0

    class Config:
        from_attributes = True
