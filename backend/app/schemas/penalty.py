from pydantic import BaseModel


class PenaltyOut(BaseModel):
    id: int
    round: int
    penalty_type: str
    timing: str
    penalty_value: str | None = None
    reason: str
    description: str | None = None
    incident_time: str | None = None
    driver_name: str | None = None
    constructor_name: str | None = None
    constructor_ref: str | None = None

    class Config:
        from_attributes = True
