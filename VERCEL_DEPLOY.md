# LIFE//OS — Vercel deployment

This version is structured as one Vercel project:

- Vite/React builds to `dist/` and is served as the frontend.
- `api/index.py` exports the FastAPI ASGI app for `/api/*`.
- Browser requests stay same-origin, so auth cookies work without a separate API hostname.
- Production persistence uses Postgres through `DATABASE_URL` (or legacy `POSTGRES_URL`).

## Why the previous deployment crashed

The earlier app tried to create/write `data/lifeos.db` during FastAPI startup. Vercel Functions do not provide a durable writable project filesystem. That caused the Python Function to fail during startup, which surfaced in the browser as `FUNCTION_INVOCATION_FAILED`.

The fixed build never uses the project folder for production writes. Before Postgres is connected it uses `/tmp` only as a non-persistent preview fallback so the Function can boot and show a diagnostic instead of crashing.

## Recommended setup: Vercel + Neon

1. Push this project to GitHub.
2. Import the repository into Vercel.
3. In the Vercel project, open **Storage / Marketplace** and add **Neon Postgres**.
4. Connect it to this project. The integration provides a database connection environment variable (`DATABASE_URL` in current Neon/Vercel setups; the app also accepts `POSTGRES_URL`).
5. Add a strong production secret:

   `JWT_SECRET=<long-random-value>`

6. Set:

   `COOKIE_SECURE=true`

7. Redeploy.
8. Visit `/api/health`. Production should report:

   `database.persistent = true`

9. Use **NEW USER** on the login screen. Refresh/redeploy and verify that the account remains.

## Local development

`setup.bat`

then:

`start.bat`

Frontend: http://localhost:3000
API health: http://localhost:8000/api/health

Local development uses SQLite if no remote database URL is set.

## Pull Vercel environment values locally

If the Vercel CLI is installed and the project is linked:

`vercel env pull .env`

Then restart the API.
