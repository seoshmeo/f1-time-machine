from pydantic import BaseModel

from app.schemas.constructor import ConstructorBrief
from app.schemas.driver import DriverBrief


class DriverStandingOut(BaseModel):
    position: int
    driver: DriverBrief
    constructor_name: str
    points: float
    wins: int

    class Config:
        from_attributes = True


class ConstructorStandingOut(BaseModel):
    position: int
    constructor: ConstructorBrief
    points: float
    wins: int

    class Config:
        from_attributes = True


class PointsAfterRound(BaseModel):
    round: int
    points: float


class StandingsProgressionOut(BaseModel):
    driver: DriverBrief
    progression: list[PointsAfterRound]

    class Config:
        from_attributes = True
