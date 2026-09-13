# LIFE//OS — Cyberpunk Life RPG

A full-stack productivity RPG: real-life tasks become quests, completions earn server-verified XP/credits, levels grow non-linearly, attributes track real-life development, and users can spend earned credits on self-defined rewards/cosmetics.

## Local run (Windows)

```bat
setup.bat
start.bat
```

- Frontend: http://localhost:3000
- API health: http://localhost:8000/api/health
- FastAPI docs: http://localhost:8000/docs

For a built single-server run:

```bat
build-and-run.bat
```

Then open http://localhost:8000.

## New accounts

The login screen has explicit **SIGN IN** and **NEW USER** tabs. A new account creates:

- a persistent user profile (when Postgres is connected)
- baseline character attributes
- three starter real-life quests
- an HTTP-only signed session cookie

## Vercel

This revision fixes the earlier `FUNCTION_INVOCATION_FAILED` deployment problem.

The previous backend attempted to write a SQLite database inside the deployed project filesystem during FastAPI startup. Vercel Functions are not a durable filesystem, so that is not a production persistence strategy.

The project now includes:

- `api/index.py` — FastAPI ASGI entrypoint for Vercel
- root `requirements.txt` — Python function dependencies
- `vercel.json` — Vite production build/output
- automatic support for `DATABASE_URL` and legacy `POSTGRES_URL`
- secure cookies automatically enabled on Vercel
- `/api/health` database diagnostics
- a non-crashing ephemeral `/tmp` preview fallback before Postgres is attached

**Production requires Postgres.** Connect Neon/Supabase/Postgres in Vercel and set `DATABASE_URL`, plus a strong `JWT_SECRET`.

Read [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) for the exact deployment checklist.

## Architecture

```text
React + TypeScript + Vite
          │
          │ same-origin /api
          ▼
FastAPI routes
          │
          ▼
Game services / progression rules
          │
          ▼
Repositories / SQLAlchemy
          │
          ├── SQLite (local)
          └── PostgreSQL (Vercel production)
```

The browser never decides authoritative XP, credits, level-ups, stat gains, or purchase validity.
