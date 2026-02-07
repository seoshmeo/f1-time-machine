from pydantic import BaseModel


class ConstructorBrief(BaseModel):
    id: int
    constructor_ref: str
    name: str
    nationality: str
    url: str | None = None
    color_primary: str | None = None
    color_secondary: str | None = None

    class Config:
        from_attributes = True


class ConstructorDriverOut(BaseModel):
    driver_ref: str
    code: str | None = None
    first_name: str
    last_name: str
    car_number: int | None = None

    class Config:
        from_attributes = True


class ConstructorSeasonStatsOut(BaseModel):
    races: int = 0
    wins: int = 0
    podiums: int = 0
    poles: int = 0
    points: float = 0
    final_position: int | None = None
    fastest_laps: int = 0
    drivers: list[ConstructorDriverOut] = []
    chassis: str | None = None
    engine: str | None = None
    race_results: list[dict] = []


class ConstructorDetail(BaseModel):
    id: int
    constructor_ref: str
    name: str
    full_name: str | None = None
    nationality: str
    url: str | None = None
    color_primary: str | None = None
    color_secondary: str | None = None
    season_stats: ConstructorSeasonStatsOut | None = None

    class Config:
        from_attributes = True
