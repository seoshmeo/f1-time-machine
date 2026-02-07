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


class ConstructorDetail(BaseModel):
    id: int
    constructor_ref: str
    name: str
    full_name: str | None = None
    nationality: str
    url: str | None = None
    color_primary: str | None = None
    color_secondary: str | None = None

    class Config:
        from_attributes = True
