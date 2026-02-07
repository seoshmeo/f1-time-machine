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


class SeasonStatsOut(BaseModel):
    races: int = 0
    wins: int = 0
    podiums: int = 0
    poles: int = 0
    points: float = 0
    final_position: int | None = None
    constructor_name: str | None = None


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
    season_stats: SeasonStatsOut | None = None

    class Config:
        from_attributes = True


class DriverRaceResultOut(BaseModel):
    round: int
    race_name: str
    circuit_name: str
    date: date
    grid_position: int | None = None
    position: int | None = None
    position_text: str | None = None
    points: float = 0
    laps_completed: int | None = None
    finish_time: str | None = None
    fastest_lap_time: str | None = None
    fastest_lap_speed: float | None = None
    fastest_lap_rank: int | None = None
    status: str | None = None
    qualifying_position: int | None = None


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
