from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import Base, engine
from app.routers import (
    admin,
    articles,
    constructors,
    days,
    drivers,
    quotes,
    races,
    results,
    seasons,
    standings,
)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="F1 Time Machine API",
    description="Backend API for F1 Time Machine - Historical F1 data day by day",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(seasons.router, prefix="/api/v1", tags=["Seasons"])
app.include_router(races.router, prefix="/api/v1", tags=["Races"])
app.include_router(results.router, prefix="/api/v1", tags=["Results"])
app.include_router(drivers.router, prefix="/api/v1", tags=["Drivers"])
app.include_router(constructors.router, prefix="/api/v1", tags=["Constructors"])
app.include_router(standings.router, prefix="/api/v1", tags=["Standings"])
app.include_router(days.router, prefix="/api/v1", tags=["Days"])
app.include_router(articles.router, prefix="/api/v1", tags=["Articles"])
app.include_router(quotes.router, prefix="/api/v1", tags=["Quotes"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin"])


@app.get("/")
def read_root():
    return {
        "name": "F1 Time Machine API",
        "version": "1.0.0",
        "description": "Historical Formula 1 data, day by day",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "environment": settings.environment,
    }
