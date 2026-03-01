# Architecture

**Analysis Date:** 2026-03-01

## Pattern Overview

**Overall:** Full-stack monorepo with a layered REST API backend and a Zustand-driven SPA frontend. No shared code between layers — they communicate exclusively over HTTP.

**Key Characteristics:**
- Backend uses a classic 4-layer API architecture: Router → Service → Model → Database
- Frontend uses a store-per-domain pattern (Zustand) with a single `api.ts` service layer
- Single hardcoded user (`DEFAULT_USER_ID = "default-user"`) — no multi-tenancy or auth
- SQLite database seeded on startup with user, categories, streak, and quotes
- All tables created automatically via SQLAlchemy `Base.metadata.create_all` on startup

## Backend Layers

**API Layer (Controllers):**
- Purpose: HTTP routing, request validation, response shaping
- Location: `backend/app/api/v1/`
- Contains: One file per domain (habits, tasks, completions, power, quotes, off_days, analytics, settings, categories)
- Depends on: Services, Models, Schemas, `get_db` dependency
- Used by: HTTP clients (frontend)

**Service Layer:**
- Purpose: Business logic, computed aggregations, multi-model operations
- Location: `backend/app/services/`
- Contains: `habit_service.py`, `power_service.py`, `analytics_service.py`, `energy_service.py`, `quote_service.py`
- Depends on: Models, Database session
- Used by: API layer

**Schema Layer:**
- Purpose: Pydantic request/response validation and serialization
- Location: `backend/app/schemas/`
- Contains: One schema file per domain matching models
- Depends on: Nothing (pure Pydantic)
- Used by: API layer

**Model Layer:**
- Purpose: SQLAlchemy ORM table definitions
- Location: `backend/app/models/`
- Contains: `habit.py`, `habit_log.py`, `habit_streak.py`, `task.py`, `completion.py`, `category.py`, `user.py`, `streak.py`, `power_level.py`, `quote.py`, `achievement.py`, `daily_log.py`, `off_day.py`
- Depends on: `backend/app/database/base.py` (SQLAlchemy Base)
- Used by: Services and API layer directly

**Database Layer:**
- Purpose: Connection management
- Location: `backend/app/database/`
- Contains: `base.py` (declarative Base), `session.py` (engine, SessionLocal, `get_db` dependency)
- Depends on: SQLite via `backend/data/saiyan_tracker.db`
- Used by: All layers via `get_db` FastAPI dependency injection

**Core Config:**
- Location: `backend/app/core/`
- Contains: `config.py` (API_PREFIX), `constants.py` (shared constants including power thresholds and transformation definitions)

## Frontend Layers

**Pages:**
- Purpose: Top-level route views, orchestrate stores and components
- Location: `frontend/src/pages/`
- Contains: `Dashboard.tsx`, `Analytics.tsx`, `Settings.tsx`
- Depends on: Stores, components, `api.ts` service

**Store Layer (Zustand):**
- Purpose: Domain state management and API fetch orchestration
- Location: `frontend/src/store/`
- Contains: `habitStore.ts`, `taskStore.ts`, `powerStore.ts`, `uiStore.ts`
- Depends on: `api.ts`
- Used by: Pages and components

**Component Layer:**
- Purpose: Reusable UI building blocks
- Location: `frontend/src/components/`
- Organized into: `dashboard/`, `analytics/`, `common/`, `ui/`, `animations/`
- Depends on: Stores (via hooks), types

**Service Layer:**
- Purpose: Typed HTTP client wrapping all backend endpoints
- Location: `frontend/src/services/api.ts`
- Pattern: Grouped export objects (`habitApi`, `taskApi`, `powerApi`, `quoteApi`, `offDayApi`, etc.)
- Used by: Stores and pages directly

**Context Layer:**
- Purpose: Theme (dark/light) global state
- Location: `frontend/src/context/ThemeContext.tsx`
- Used by: Root app and any component needing theme

**Types:**
- Location: `frontend/src/types/index.ts`
- Contains: All TypeScript interfaces matching backend response shapes

## Data Flow

**Habit Completion Flow:**

1. User clicks HabitCard checkbox in `frontend/src/components/dashboard/HabitCard.tsx`
2. `onCheck(habitId)` callback fires, handled in `frontend/src/pages/Dashboard.tsx`
3. `Dashboard` calls `checkHabit(habitId)` from `useHabitStore` (`frontend/src/store/habitStore.ts`)
4. Store calls `habitApi.check(habitId)` in `frontend/src/services/api.ts` → `POST /api/v1/habits/{id}/check`
5. Backend routes to `backend/app/api/v1/habits.py` → delegates to `HabitService.check_habit()`
6. `backend/app/services/habit_service.py` creates/toggles a `HabitLog` record, updates streak, recalculates power
7. Returns `{ completed, points_awarded, zenkai_triggered, new_transformation, all_habits_completed }`
8. Dashboard processes result: shows `PointsPopup`, triggers quote fetch, or fires `TransformationAnimation`
9. Dashboard calls `fetchPower()` to refresh power bar

**Power Level Flow:**

1. Any completion (habit or task) triggers recalculation in `backend/app/services/power_service.py`
2. Power service aggregates daily points, applies category multipliers, checks transformation thresholds from `backend/app/core/constants.py`
3. Frontend `powerStore.ts` fetches `GET /api/v1/power` after completions and on page load
4. `PowerLevelBar` component reads from `powerStore`

**State Management:**
- Each domain has an isolated Zustand store; stores do not call each other
- Pages coordinate cross-domain logic (e.g., Dashboard fetches from all four stores on mount)
- UI-only state (modal visibility) lives in `uiStore.ts`

## Key Abstractions

**HabitService:**
- Purpose: Core habit business logic — today's habits, toggle completion, streaks, calendar heatmap
- Location: `backend/app/services/habit_service.py`
- Pattern: Static class methods, all accept `(db, user_id, ...)`

**PowerService:**
- Purpose: Recalculates power level, transformation tier, streak, daily minimum
- Location: `backend/app/services/power_service.py`
- Pattern: Called as side effect after any completion event

**Zustand Stores:**
- Purpose: Client-side domain state + async fetch actions
- Examples: `frontend/src/store/habitStore.ts`, `frontend/src/store/powerStore.ts`
- Pattern: `create<StoreType>((set, get) => ({ ...state, ...actions }))` with async actions that call `api.ts` then `set()`

## Entry Points

**Backend:**
- Location: `backend/app/main.py`
- Triggers: `uvicorn app.main:app --port 8000`
- Responsibilities: Creates FastAPI app, registers CORS middleware, mounts `api_router` at `/api/v1`, runs `startup()` to create DB tables and seed default data

**Frontend:**
- Location: `frontend/src/main.tsx` (Vite entry), root component at `frontend/src/App.tsx`
- Triggers: `node node_modules/vite/bin/vite.js` (dev), `vite build` (prod)
- Responsibilities: Renders React tree with router and ThemeContext provider

**API Router:**
- Location: `backend/app/api/router.py`
- Registers: habits, tasks, categories, completions, power, quotes, off-days, analytics, settings

## Error Handling

**Strategy:** Minimal — errors are caught at boundaries and logged or silently swallowed.

**Patterns:**
- Backend raises `HTTPException(status_code=404)` for not-found resources
- Frontend wraps API calls in `try/catch` blocks; most failures `console.error()` and continue
- No global error boundary on frontend
- No retry logic anywhere

## Cross-Cutting Concerns

**Logging:** Backend uses no structured logger — implicit uvicorn access logs only. Frontend uses `console.error()` in catch blocks.

**Validation:** Backend uses Pydantic schemas for request body validation. Frontend has no form validation library — native HTML + Pydantic error propagation.

**Authentication:** None. All endpoints use hardcoded `DEFAULT_USER_ID = "default-user"`. No JWT, sessions, or guards.

---

*Architecture analysis: 2026-03-01*
