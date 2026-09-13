from __future__ import annotations

import logging
import os
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from .api.routes import auth, character, dashboard, quests, rewards
from .core.config import get_settings
from .db.database import Base, SessionLocal, engine
from .services.seed import ensure_rewards, seed_demo

log = logging.getLogger("lifeos")
settings = get_settings()
app = FastAPI(title="LIFE//OS API", version="2.1.0")

# Production requests are same-origin on Vercel. CORS is primarily needed for
# the local Vite dev server.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def init_db():
    if getattr(app.state, "db_ready", False):
        return
    app.state.db_ready = False
    app.state.db_error = None
    try:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            ensure_rewards(db)
            seed_demo(db)
            db.execute(text("SELECT 1"))
            app.state.db_ready = True
        finally:
            db.close()
    except Exception as exc:  # keep Vercel function alive and return diagnostics
        app.state.db_error = str(exc)
        log.exception("Database initialization failed")


@app.on_event("startup")
def startup():
    init_db()


@app.middleware("http")
async def ensure_db_middleware(request: Request, call_next):
    if not getattr(app.state, "db_ready", False):
        init_db()
    return await call_next(request)


@app.exception_handler(SQLAlchemyError)
async def database_exception_handler(_: Request, exc: SQLAlchemyError):
    log.exception("Database request failed", exc_info=exc)
    return JSONResponse(
        status_code=503,
        content={
            "detail": "Database unavailable. Connect a Postgres database and set DATABASE_URL in Vercel, then redeploy."
        },
    )


@app.get("/api/health")
def health():
    if not getattr(app.state, "db_ready", False):
        init_db()
    return {
        "status": "online",
        "system": "LIFE//OS",
        "version": "2.1.0",
        "database": {
            "ready": bool(getattr(app.state, "db_ready", False)),
            "persistent": settings.persistent_database_configured,
            "mode": "postgres" if settings.persistent_database_configured else ("ephemeral-preview" if settings.is_vercel else "sqlite-local"),
        },
    }


app.include_router(auth.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(quests.router, prefix="/api")
app.include_router(rewards.router, prefix="/api")
app.include_router(character.router, prefix="/api")

# Local production convenience: `npm run build` then run uvicorn on :8000.
# Vercel serves Vite's dist directory itself and invokes FastAPI only for /api.
if not settings.is_vercel:
    ROOT = Path(__file__).resolve().parents[2]
    DIST = ROOT / "dist"
    if DIST.exists():
        assets = DIST / "assets"
        if assets.exists():
            app.mount("/assets", StaticFiles(directory=assets), name="assets")

        @app.get("/{full_path:path}", include_in_schema=False)
        def spa(full_path: str):
            target = DIST / full_path
            if full_path and target.is_file():
                return FileResponse(target)
            return FileResponse(DIST / "index.html")

init_db()
