from datetime import datetime

from pydantic import BaseModel


class ArticleBrief(BaseModel):
    id: int
    title: str
    slug: str
    lead: str | None = None
    source: str | None = None
    published_at: datetime | None = None

    class Config:
        from_attributes = True


class ArticleDetail(BaseModel):
    id: int
    title: str
    slug: str
    lead: str | None = None
    body: str
    source: str | None = None
    source_url: str | None = None
    author: str | None = None
    language: str
    published_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ArticleCreate(BaseModel):
    day_id: int | None = None
    season_id: int
    title: str
    slug: str
    lead: str | None = None
    body: str
    source: str | None = None
    source_url: str | None = None
    author: str | None = None
    language: str = "en"
    published_at: datetime | None = None
