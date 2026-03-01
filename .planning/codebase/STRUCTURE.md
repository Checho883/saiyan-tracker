# Codebase Structure

**Analysis Date:** 2026-03-01

## Directory Layout

```
saiyan-tracker/
├── backend/                    # Python FastAPI backend
│   ├── app/
│   │   ├── main.py             # FastAPI app entry point, startup seeding
│   │   ├── api/
│   │   │   ├── router.py       # Aggregates all v1 routers
│   │   │   └── v1/             # One file per domain endpoint group
│   │   │       ├── habits.py
│   │   │       ├── tasks.py
│   │   │       ├── completions.py
│   │   │       ├── power.py
│   │   │       ├── quotes.py
│   │   │       ├── off_days.py
│   │   │       ├── analytics.py
│   │   │       ├── settings.py
│   │   │       └── categories.py
│   │   ├── core/
│   │   │   ├── config.py       # API_PREFIX constant
│   │   │   └── constants.py    # Transformation thresholds, game constants
│   │   ├── database/
│   │   │   ├── base.py         # SQLAlchemy declarative Base
│   │   │   └── session.py      # engine, SessionLocal, get_db dependency
│   │   ├── models/             # SQLAlchemy ORM models
│   │   │   ├── habit.py
│   │   │   ├── habit_log.py
│   │   │   ├── habit_streak.py
│   │   │   ├── task.py
│   │   │   ├── completion.py
│   │   │   ├── category.py
│   │   │   ├── user.py
│   │   │   ├── streak.py
│   │   │   ├── power_level.py
│   │   │   ├── quote.py
│   │   │   ├── achievement.py
│   │   │   ├── daily_log.py
│   │   │   └── off_day.py
│   │   ├── schemas/            # Pydantic request/response models
│   │   │   ├── habit.py
│   │   │   ├── task.py
│   │   │   ├── completion.py
│   │   │   ├── off_day.py
│   │   │   ├── power.py
│   │   │   ├── quote.py
│   │   │   └── user.py
│   │   ├── services/           # Business logic
│   │   │   ├── habit_service.py
│   │   │   ├── power_service.py
│   │   │   ├── analytics_service.py
│   │   │   ├── energy_service.py
│   │   │   └── quote_service.py
│   │   └── utils/              # Shared helpers
│   ├── data/
│   │   └── saiyan_tracker.db   # SQLite database (delete to reset schema)
│   ├── tests/                  # Backend tests (minimal)
│   └── venv/                   # Python virtual environment
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── main.tsx            # Vite entry point
│   │   ├── App.tsx             # Root component, router, ThemeContext
│   │   ├── index.css           # Global CSS variables (--bg-primary, etc.)
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx   # Main daily view
│   │   │   ├── Analytics.tsx   # Charts and calendar heatmap
│   │   │   └── Settings.tsx    # User preferences
│   │   ├── components/
│   │   │   ├── dashboard/      # Components used on Dashboard page
│   │   │   │   ├── HabitCard.tsx
│   │   │   │   ├── TaskCard.tsx
│   │   │   │   ├── PowerLevelBar.tsx
│   │   │   │   ├── StreakDisplay.tsx
│   │   │   │   ├── TransformationMeter.tsx
│   │   │   │   └── EnergySelector.tsx
│   │   │   ├── analytics/      # Components used on Analytics page
│   │   │   │   ├── CalendarHeatmap.tsx (inferred)
│   │   │   │   ├── CategoryBreakdownChart.tsx
│   │   │   │   ├── PowerHistoryChart.tsx
│   │   │   │   └── WeeklyChart.tsx
│   │   │   ├── common/         # Shared modals and dialogs
│   │   │   │   ├── HabitFormModal.tsx
│   │   │   │   ├── TaskFormModal.tsx
│   │   │   │   ├── OffDayModal.tsx
│   │   │   │   ├── GokuQuote.tsx
│   │   │   │   └── VegetaDialog.tsx
│   │   │   ├── animations/     # Framer Motion animation components
│   │   │   │   ├── TransformationAnimation.tsx
│   │   │   │   └── PointsPopup.tsx
│   │   │   └── ui/             # Generic UI primitives
│   │   ├── store/              # Zustand domain stores
│   │   │   ├── habitStore.ts
│   │   │   ├── taskStore.ts
│   │   │   ├── powerStore.ts
│   │   │   └── uiStore.ts
│   │   ├── services/
│   │   │   └── api.ts          # All HTTP client calls to backend
│   │   ├── context/
│   │   │   └── ThemeContext.tsx # Dark/light theme provider
│   │   ├── hooks/              # Custom React hooks
│   │   ├── types/
│   │   │   └── index.ts        # All TypeScript interfaces
│   │   └── assets/             # Static images/icons
│   ├── public/                 # Static public assets
│   ├── dist/                   # Production build output (generated)
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
├── .planning/                  # GSD planning documents
│   ├── codebase/               # Codebase analysis docs (this file)
│   ├── phases/                 # Phase implementation plans
│   └── handoff/                # Handoff notes between sessions
├── .claude/                    # Claude agent config and commands
├── PRD.md                      # Product requirements document
└── README.md
```

## Directory Purposes

**`backend/app/api/v1/`:**
- Purpose: HTTP endpoint handlers grouped by domain
- Contains: One router file per resource (habits, tasks, completions, etc.)
- Key files: `habits.py` (10+ endpoints), `completions.py`, `power.py`
- Pattern: Each file defines `router = APIRouter()` and gets mounted in `backend/app/api/router.py`

**`backend/app/services/`:**
- Purpose: Business logic separated from HTTP concerns
- Contains: Service classes with static methods
- Key files: `habit_service.py` (today's habits, check toggle, calendar, stats), `power_service.py` (recalculation)

**`backend/app/models/`:**
- Purpose: SQLAlchemy table definitions
- Contains: One class per database table
- Key files: `habit.py`, `habit_log.py`, `habit_streak.py`, `task.py`, `power_level.py`

**`backend/app/schemas/`:**
- Purpose: Pydantic validation for API request bodies and responses
- Contains: `*Create`, `*Update`, `*Response` Pydantic models per domain
- Key file: `habit.py` (HabitCreate, HabitUpdate, HabitResponse, HabitCheckResponse)

**`frontend/src/store/`:**
- Purpose: Domain state and async actions using Zustand
- Contains: One store per domain; stores are independent (no cross-store calls)
- Key files: `habitStore.ts` (todayHabits, fetchTodayHabits, checkHabit), `powerStore.ts`

**`frontend/src/services/api.ts`:**
- Purpose: Single file containing all typed HTTP calls to backend
- Pattern: Exported grouped objects: `habitApi`, `taskApi`, `powerApi`, `quoteApi`, `offDayApi`, `categoryApi`
- Used by: Stores and pages directly

**`frontend/src/components/common/`:**
- Purpose: Shared modals and overlay components used across pages
- Contains: Form modals (HabitFormModal, TaskFormModal, OffDayModal), quote dialogs (GokuQuote, VegetaDialog)

**`backend/data/`:**
- Purpose: SQLite database file storage
- Generated: Yes (created on first run)
- Committed: No (in .gitignore)
- Note: Delete `saiyan_tracker.db` when changing models (kill Python process first)

## Key File Locations

**Entry Points:**
- `backend/app/main.py`: FastAPI app, startup hook, CORS, router mount
- `frontend/src/main.tsx`: Vite/React entry
- `frontend/src/App.tsx`: Root component with routing and ThemeContext

**Configuration:**
- `backend/app/core/config.py`: `API_PREFIX = "/api/v1"`
- `backend/app/core/constants.py`: Game constants, transformation thresholds
- `frontend/vite.config.ts`: Vite config with `@/` path alias
- `frontend/tailwind.config.js`: Tailwind config with `saiyan-orange`, `saiyan-gold`, `saiyan-blue` custom colors
- `frontend/src/index.css`: CSS custom properties (`--bg-primary`, `--text-primary`, `--border-color`, etc.)

**Core Logic:**
- `backend/app/services/habit_service.py`: Habit completion, streaks, calendar
- `backend/app/services/power_service.py`: Power level recalculation
- `frontend/src/services/api.ts`: All API calls
- `frontend/src/store/habitStore.ts`: Habit state management

**Testing:**
- `backend/tests/`: Backend test directory (minimal coverage)

## Naming Conventions

**Backend Files:**
- Models: `snake_case.py` matching table name (e.g., `habit_log.py`)
- Services: `{domain}_service.py` (e.g., `habit_service.py`)
- API routes: `{domain}.py` (e.g., `habits.py`, `completions.py`)
- Schemas: `{domain}.py` matching model file name

**Backend Classes:**
- Models: `PascalCase` matching SQLAlchemy table (e.g., `Habit`, `HabitLog`)
- Schemas: `{Domain}{Create|Update|Response}` (e.g., `HabitCreate`, `HabitResponse`)
- Services: `{Domain}Service` with static methods (e.g., `HabitService`)

**Frontend Files:**
- Components: `PascalCase.tsx` (e.g., `HabitCard.tsx`, `PowerLevelBar.tsx`)
- Stores: `camelCaseStore.ts` (e.g., `habitStore.ts`)
- Pages: `PascalCase.tsx` (e.g., `Dashboard.tsx`)
- Services: `camelCase.ts` (e.g., `api.ts`)

**Frontend Identifiers:**
- Zustand stores: `use{Domain}Store` hook (e.g., `useHabitStore`)
- API groups: `{domain}Api` object (e.g., `habitApi`, `powerApi`)
- CSS variables: `--{scope}-{property}` (e.g., `--bg-primary`, `--text-muted`)
- Tailwind custom colors: `saiyan-{color}` (e.g., `saiyan-orange`, `saiyan-gold`)

## Where to Add New Code

**New Backend Feature (new domain/resource):**
- Model: `backend/app/models/{domain}.py`
- Schema: `backend/app/schemas/{domain}.py`
- Service: `backend/app/services/{domain}_service.py`
- API router: `backend/app/api/v1/{domain}.py`
- Register router: Add to `backend/app/api/router.py`
- Import model: Add to `backend/app/models/__init__.py` so it registers on startup

**New Frontend Feature:**
- Store: `frontend/src/store/{domain}Store.ts`
- API calls: Add grouped export object to `frontend/src/services/api.ts`
- Types: Add interfaces to `frontend/src/types/index.ts`
- Page-specific components: `frontend/src/components/{page}/`
- Shared components: `frontend/src/components/common/`

**New Page:**
- Implementation: `frontend/src/pages/{PageName}.tsx`
- Add route in: `frontend/src/App.tsx`

**Utilities:**
- Backend shared helpers: `backend/app/utils/`
- Frontend shared hooks: `frontend/src/hooks/`

## Special Directories

**`backend/data/`:**
- Purpose: SQLite database storage
- Generated: Yes (on first `uvicorn` run)
- Committed: No

**`frontend/dist/`:**
- Purpose: Production build output from `vite build`
- Generated: Yes
- Committed: No

**`frontend/Lib/` and `frontend/Scripts/`:**
- Purpose: Python venv accidentally created inside frontend directory
- Generated: Yes (erroneous)
- Committed: No (should be cleaned up)

**`.planning/`:**
- Purpose: GSD workflow planning documents — codebase analysis, phase plans, handoffs
- Generated: By Claude agents
- Committed: Yes

---

*Structure analysis: 2026-03-01*
