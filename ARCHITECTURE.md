# LIFE//OS Architecture

The backend follows a small layered architecture inspired by Python/FastAPI clean-architecture examples: HTTP routes depend on services/repositories, and the game rules remain server-side.

```text
React/Vite UI
   │  cookie-authenticated /api calls
   ▼
FastAPI routes
   │
   ├── auth / dependency boundary
   ├── request validation (Pydantic)
   ▼
Game services
   ├── XP curve
   ├── streak logic
   ├── attribute growth
   ├── credit economy
   └── reward/equipment rules
   ▼
Repositories
   ├── users
   ├── quests/completions
   └── rewards/inventory
   ▼
SQLAlchemy
   └── SQLite local / PostgreSQL production
```

## Security boundary
The browser never chooses XP, credits, streak multipliers, level-ups, shop prices, or attribute gains. It sends intent (`complete quest`, `buy reward`); the server calculates consequences.

Authentication uses PBKDF2-SHA256 password hashes and a signed JWT stored in an HTTP-only SameSite cookie.

## Performance boundary
The frontend intentionally avoids a large state framework and heavyweight animation library. React + CSS transitions are enough for this interaction model. Vite proxies `/api` in development. A production build can be served directly by FastAPI from `dist/`.

## Persistence
Primary game data lives in SQL, never localStorage. SQLite is the zero-config local default. Set `DATABASE_URL` to a PostgreSQL SQLAlchemy URL for deployment.
