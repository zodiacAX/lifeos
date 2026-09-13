"""Vercel Python entrypoint.

Vercel invokes this ASGI application for /api/* while the Vite build is served
as static frontend assets from the same deployment/domain.
"""
from backend.app.main import app

__all__ = ["app"]
