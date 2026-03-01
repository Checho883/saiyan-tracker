# External Integrations

**Analysis Date:** 2026-03-01

## APIs & External Services

**External APIs:**
- None detected. The application is fully self-contained with no calls to third-party APIs.

## Data Storage

**Databases:**
- SQLite (local file)
  - File path: `backend/data/saiyan_tracker.db`
  - Client: SQLAlchemy 2.x async ORM with `aiosqlite` driver
  - Migrations managed by Alembic (`backend/alembic/`)

**File Storage:**
- Local filesystem only (`backend/data/` directory)

**Caching:**
- None detected

## Authentication & Identity

**Auth Provider:**
- No authentication system. Single-user app using a hardcoded default user.
  - Implementation: `DEFAULT_USER_ID = "default-user"` in `backend/app/core/constants.py`
  - All API endpoints use this value without any auth middleware

## Monitoring & Observability

**Error Tracking:**
- None detected

**Logs:**
- Standard Python/Uvicorn console logging only

## CI/CD & Deployment

**Hosting:**
- Local development only; no deployment configuration detected

**CI Pipeline:**
- None detected

## Environment Configuration

**Required env vars:**
- `.env` file expected in `backend/` directory (loaded via `python-dotenv`)
- Specific required variables not confirmed; database path uses a hardcoded default

**Secrets location:**
- `.env` file at `backend/.env` (existence noted, contents not read)

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## Frontend-Backend Communication

**Pattern:** REST API over HTTP
- Frontend uses `axios` to call the FastAPI backend at `http://localhost:8000`
- API base: `/api/v1/`
- CORS configured in FastAPI to allow frontend origin
- All API routes defined under `backend/app/api/v1/`

---

*Integration audit: 2026-03-01*
