from pydantic import BaseModel


class DriverSimple(BaseModel):
    id: int
    driver_ref: str
    code: str | None = None
    first_name: str
    last_name: str
    nationality: str

    class Config:
        from_attributes = True


class ConstructorSimple(BaseModel):
    id: int
    constructor_ref: str
    name: str
    nationality: str
    color_primary: str | None = None

    class Config:
        from_attributes = True


class ResultOut(BaseModel):
    id: int
    driver: DriverSimple
    constructor: ConstructorSimple
    car_number: int | None = None
    grid_position: int | None = None
    position: int | None = None
    position_text: str | None = None
    points: float
    laps_completed: int | None = None
    finish_time: str | None = None
    fastest_lap: int | None = None
    fastest_lap_time: str | None = None
    fastest_lap_speed: float | None = None
    status: str | None = None

    class Config:
        from_attributes = True


class QualifyingResultOut(BaseModel):
    id: int
    driver: DriverSimple
    constructor: ConstructorSimple
    car_number: int | None = None
    position: int | None = None
    q1_time: str | None = None
    q2_time: str | None = None
    q3_time: str | None = None

    class Config:
        from_attributes = True


class FastestLapOut(BaseModel):
    rank: int | None = None
    driver: DriverSimple
    constructor: ConstructorSimple
    lap: int | None = None
    time: str | None = None
    speed: float | None = None

    class Config:
        from_attributes = True
