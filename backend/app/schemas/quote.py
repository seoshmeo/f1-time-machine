from pydantic import BaseModel


class QuoteOut(BaseModel):
    id: int
    author_name: str
    author_role: str | None = None
    text: str
    context: str | None = None
    source: str | None = None
    source_url: str | None = None
    language: str
    driver_id: int | None = None

    class Config:
        from_attributes = True


class QuoteCreate(BaseModel):
    day_id: int | None = None
    season_id: int
    driver_id: int | None = None
    author_name: str
    author_role: str | None = None
    text: str
    context: str | None = None
    source: str | None = None
    source_url: str | None = None
    language: str = "en"
