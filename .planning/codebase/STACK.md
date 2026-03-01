# Technology Stack

**Analysis Date:** 2026-03-01

## Languages

**Primary:**
- Python 3.14 - Backend API, services, models
- TypeScript 5.9 - Frontend application

**Secondary:**
- CSS (custom properties/variables) - Theming system

## Runtime

**Backend Environment:**
- Python 3.14 with virtual environment at `backend/venv/`

**Frontend Environment:**
- Node.js (version not pinned)

**Package Manager:**
- Backend: pip with `backend/requirements.txt`
- Frontend: npm with `frontend/package.json`
- Lockfile: `frontend/package-lock.json` (present for frontend; no lock for backend)

## Frameworks

**Backend Core:**
- FastAPI >=0.115.0 - REST API framework
- Uvicorn >=0.30.0 (standard extras) - ASGI server
- SQLAlchemy >=2.0.35 - ORM and database toolkit
- Alembic >=1.13.2 - Database migrations
- Pydantic >=2.9.0 - Data validation and schemas

**Frontend Core:**
- React 19.2 - UI component framework
- React Router DOM 6.30 - Client-side routing
- Zustand 5.0 - State management
- Framer Motion 11.18 - Animation library
- Recharts 2.15 - Data visualization / charts

**Build/Dev:**
- Vite 7.3 - Frontend build tool and dev server
- `@vitejs/plugin-react` 5.1 - React plugin for Vite
- TypeScript compiler (`tsc`) - Type checking

**CSS/Styling:**
- Tailwind CSS 3.4 - Utility-first CSS framework
- PostCSS 8.5 / Autoprefixer 10.4 - CSS processing

**Linting:**
- ESLint 9.39 with `typescript-eslint` 8.48
- `eslint-plugin-react-hooks` 7.0
- `eslint-plugin-react-refresh` 0.4

## Key Dependencies

**Critical:**
- `axios` ^1.13.6 - HTTP client for all frontend API calls to backend
- `aiosqlite` >=0.20.0 - Async SQLite driver used with SQLAlchemy
- `python-dotenv` >=1.0.1 - Environment variable loading
- `httpx` >=0.27.0 - Async HTTP client (backend side, for any outbound requests)
- `lucide-react` ^0.400.0 - Icon library

**Infrastructure:**
- `sqlalchemy` >=2.0.35 - All database access (async mode with aiosqlite)
- `alembic` >=1.13.2 - Schema migrations

## Configuration

**Environment:**
- Backend uses `python-dotenv`; `.env` file expected at `backend/` root
- Key config: database path (`backend/data/saiyan_tracker.db`), CORS origins
- Constants centralized in `backend/app/core/constants.py` (includes `DEFAULT_USER_ID = "default-user"`)

**Build:**
- Frontend: `frontend/vite.config.ts`
- Frontend CSS: `frontend/tailwind.config.js`, `frontend/postcss.config.js`
- Frontend TS: `frontend/tsconfig.json`
- Frontend lint: `frontend/eslint.config.js`

## Platform Requirements

**Development:**
- Python 3.14+ with venv
- Node.js (LTS recommended)
- Start backend: `cd backend && source venv/Scripts/activate && uvicorn app.main:app --port 8000`
- Start frontend: `cd frontend && node node_modules/vite/bin/vite.js` (direct binary workaround required)

**Production:**
- No deployment config detected; runs as local development app
- SQLite database at `backend/data/saiyan_tracker.db` (delete when schema changes, after killing Python process)

---

*Stack analysis: 2026-03-01*
