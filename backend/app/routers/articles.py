from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Article, Season
from app.schemas.article import ArticleBrief, ArticleDetail

router = APIRouter()


@router.get("/seasons/{year}/articles", response_model=list[ArticleBrief])
def get_season_articles(year: int, db: Session = Depends(get_db)):
    season = db.query(Season).filter(Season.year == year).first()
    if not season:
        raise HTTPException(status_code=404, detail=f"Season {year} not found")

    articles = (
        db.query(Article)
        .filter(Article.season_id == season.id)
        .order_by(Article.published_at.desc())
        .all()
    )

    return [ArticleBrief.model_validate(article) for article in articles]


@router.get("/articles/{article_id}", response_model=ArticleDetail)
def get_article(article_id: int, db: Session = Depends(get_db)):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail=f"Article {article_id} not found")

    return ArticleDetail.model_validate(article)
