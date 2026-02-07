from pydantic import BaseModel


class EventBrief(BaseModel):
    id: int
    type: str
    title: str
    summary: str | None = None
    importance: int

    class Config:
        from_attributes = True


class EventOut(BaseModel):
    id: int
    type: str
    title: str
    summary: str | None = None
    detail: str | None = None
    importance: int
    source_url: str | None = None
    session_id: int | None = None
    driver_ids: list[int] = []
    tag_names: list[str] = []

    class Config:
        from_attributes = True
