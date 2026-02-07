from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models import Article, Event, Quote
from app.schemas.article import ArticleCreate, ArticleDetail
from app.schemas.quote import QuoteCreate, QuoteOut

router = APIRouter()
settings = get_settings()


def verify_admin_key(x_admin_key: str = Header(...)):
    if x_admin_key != settings.admin_api_key:
        raise HTTPException(status_code=403, detail="Invalid admin key")
    return True


@router.post("/articles", response_model=ArticleDetail, dependencies=[Depends(verify_admin_key)])
def create_article(article: ArticleCreate, db: Session = Depends(get_db)):
    existing = (
        db.query(Article)
        .filter(Article.season_id == article.season_id, Article.slug == article.slug)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Article with this slug already exists")

    db_article = Article(**article.model_dump())
    db.add(db_article)
    db.commit()
    db.refresh(db_article)

    return ArticleDetail.model_validate(db_article)


@router.put(
    "/articles/{article_id}", response_model=ArticleDetail, dependencies=[Depends(verify_admin_key)]
)
def update_article(article_id: int, article: ArticleCreate, db: Session = Depends(get_db)):
    db_article = db.query(Article).filter(Article.id == article_id).first()
    if not db_article:
        raise HTTPException(status_code=404, detail="Article not found")

    for key, value in article.model_dump(exclude_unset=True).items():
        setattr(db_article, key, value)

    db.commit()
    db.refresh(db_article)

    return ArticleDetail.model_validate(db_article)


@router.delete("/articles/{article_id}", dependencies=[Depends(verify_admin_key)])
def delete_article(article_id: int, db: Session = Depends(get_db)):
    db_article = db.query(Article).filter(Article.id == article_id).first()
    if not db_article:
        raise HTTPException(status_code=404, detail="Article not found")

    db.delete(db_article)
    db.commit()

    return {"message": "Article deleted successfully"}


@router.post("/quotes", response_model=QuoteOut, dependencies=[Depends(verify_admin_key)])
def create_quote(quote: QuoteCreate, db: Session = Depends(get_db)):
    db_quote = Quote(**quote.model_dump())
    db.add(db_quote)
    db.commit()
    db.refresh(db_quote)

    return QuoteOut.model_validate(db_quote)


@router.put("/quotes/{quote_id}", response_model=QuoteOut, dependencies=[Depends(verify_admin_key)])
def update_quote(quote_id: int, quote: QuoteCreate, db: Session = Depends(get_db)):
    db_quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not db_quote:
        raise HTTPException(status_code=404, detail="Quote not found")

    for key, value in quote.model_dump(exclude_unset=True).items():
        setattr(db_quote, key, value)

    db.commit()
    db.refresh(db_quote)

    return QuoteOut.model_validate(db_quote)


@router.delete("/quotes/{quote_id}", dependencies=[Depends(verify_admin_key)])
def delete_quote(quote_id: int, db: Session = Depends(get_db)):
    db_quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not db_quote:
        raise HTTPException(status_code=404, detail="Quote not found")

    db.delete(db_quote)
    db.commit()

    return {"message": "Quote deleted successfully"}


@router.delete("/events/{event_id}", dependencies=[Depends(verify_admin_key)])
def delete_event(event_id: int, db: Session = Depends(get_db)):
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")

    db.delete(db_event)
    db.commit()

    return {"message": "Event deleted successfully"}
