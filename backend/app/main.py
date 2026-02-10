from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.config import get_settings
from app.database import Base, engine
from app.routers import (
    admin,
    articles,
    constructors,
    days,
    drivers,
    events,
    head_to_head,
    penalties,
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
app.include_router(head_to_head.router, prefix="/api/v1", tags=["Head to Head"])
app.include_router(days.router, prefix="/api/v1", tags=["Days"])
app.include_router(articles.router, prefix="/api/v1", tags=["Articles"])
app.include_router(quotes.router, prefix="/api/v1", tags=["Quotes"])
app.include_router(events.router, prefix="/api/v1", tags=["Events"])
app.include_router(penalties.router, prefix="/api/v1", tags=["Penalties"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin"])


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "environment": settings.environment,
    }

# Serve frontend static files
FRONTEND_DIR = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"

if FRONTEND_DIR.exists():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIR / "assets"), name="static")

    @app.get("/{full_path:path}")
    async def serve_frontend(request: Request, full_path: str):
        """Serve frontend SPA - return index.html for all non-API routes."""
        file_path = FRONTEND_DIR / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(FRONTEND_DIR / "index.html")
