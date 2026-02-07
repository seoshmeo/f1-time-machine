from datetime import date

from pydantic import BaseModel


class DriverBrief(BaseModel):
    id: int
    driver_ref: str
    number: int | None = None
    code: str | None = None
    first_name: str
    last_name: str
    nationality: str
    url: str | None = None
    photo_url: str | None = None

    class Config:
        from_attributes = True


class DriverDetail(BaseModel):
    id: int
    driver_ref: str
    number: int | None = None
    code: str | None = None
    first_name: str
    last_name: str
    date_of_birth: date | None = None
    nationality: str
    url: str | None = None
    photo_url: str | None = None

    class Config:
        from_attributes = True


class DriverSeasonStats(BaseModel):
    driver: DriverBrief
    constructor_name: str
    total_points: float
    best_finish: int | None = None
    wins: int
    podiums: int
    poles: int
    fastest_laps: int
    races_entered: int
    final_position: int | None = None

    class Config:
        from_attributes = True
