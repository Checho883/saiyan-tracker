# Architecture Research

**Domain:** Gamified habit tracker (FastAPI + React + SQLite) — audit context
**Researched:** 2026-02-28
**Confidence:** HIGH (based on direct codebase analysis, not external research)

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React 19 + Vite 7)                │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────┐  ┌───────────┐  ┌───────────┐                   │
│  │ Dashboard  │  │ Analytics │  │ Settings  │   Pages           │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘                   │
│        │              │              │                          │
│  ┌─────┴──────────────┴──────────────┴─────┐                   │
│  │  Components (HabitCard, PowerLevelBar,   │                   │
│  │  CalendarHeatmap, Modals, Animations)    │                   │
│  └─────────────────┬───────────────────────┘                   │
│                    │                                            │
│  ┌─────────────────┴───────────────────────┐                   │
│  │  Zustand Stores (habit, task, power, ui) │   State          │
│  └─────────────────┬───────────────────────┘                   │
│                    │                                            │
│  ┌─────────────────┴───────────────────────┐                   │
│  │  API Service Layer (axios → /api/v1)     │   HTTP Client    │
│  └─────────────────┬───────────────────────┘                   │
├────────────────────┼────────────────────────────────────────────┤
│              Vite Dev Proxy                                     │
├────────────────────┼────────────────────────────────────────────┤
│                    ▼                                            │
│              BACKEND (FastAPI)                                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────┐                │
│  │  API Router (/api/v1)                       │                │
│  │  habits | tasks | completions | power |     │                │
│  │  quotes | analytics | off-days | settings   │                │
│  └─────────────────┬──────────────────────────┘                │
│                    │                                            │
│  ┌─────────────────┴──────────────────────────┐                │
│  │  Service Layer                              │                │
│  │  HabitService | PowerService |              │                │
│  │  QuoteService | AnalyticsService |          │                │
│  │  EnergyService                              │                │
│  └─────────────────┬──────────────────────────┘                │
│                    │                                            │
│  ┌─────────────────┴──────────────────────────┐                │
│  │  SQLAlchemy Models (13 models)              │                │
│  │  User, Habit, HabitLog, HabitStreak,        │                │
│  │  Task, TaskCompletion, TaskCategory,         │                │
│  │  DailyLog, Streak, PowerLevel,              │                │
│  │  Achievement, OffDay, Quote                 │                │
│  └─────────────────┬──────────────────────────┘                │
│                    │                                            │
│  ┌─────────────────┴──────────────────────────┐                │
│  │  SQLite (backend/data/saiyan_tracker.db)    │   Database     │
│  └────────────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|----------------|-------------------|
| **Pages (Dashboard, Analytics, Settings)** | Top-level route views, orchestrate data fetching, handle user actions | Zustand stores, API service, child components |
| **Dashboard components** | HabitCard, TaskCard, PowerLevelBar, StreakDisplay, TransformationMeter — render individual UI pieces | Receive props from Dashboard page |
| **Common components** | HabitFormModal, TaskFormModal, OffDayModal, VegetaDialog, GokuQuote — modals and overlays | Receive props, call API directly or via callbacks |
| **Animation components** | PointsPopup, TransformationAnimation — gamification feedback | Receive state from Dashboard |
| **Zustand stores** | habitStore, taskStore, powerStore, uiStore — client-side state management | API service layer |
| **API service** | Single axios instance, organized by domain (habitApi, taskApi, etc.) | Backend via HTTP |
| **Backend API routes** | 9 route modules under /api/v1, thin controllers delegating to services | Service layer, database |
| **Backend services** | HabitService, PowerService, QuoteService, AnalyticsService, EnergyService — business logic | SQLAlchemy models, database session |
| **SQLAlchemy models** | 13 ORM models defining schema and relationships | Database via SQLAlchemy engine |
| **SQLite database** | Single file at backend/data/saiyan_tracker.db | Accessed only through SQLAlchemy |

## Recommended Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── router.py           # Central router aggregation
│   │   └── v1/                 # Versioned endpoints (9 modules)
│   │       ├── habits.py       # CRUD + check + calendar + stats + reorder
│   │       ├── tasks.py        # CRUD for one-off tasks
│   │       ├── completions.py  # Task completion tracking
│   │       ├── power.py        # Power level, transformations, history
│   │       ├── quotes.py       # Vegeta roasts, Goku motivation
│   │       ├── analytics.py    # Weekly stats, category breakdown
│   │       ├── off_days.py     # Rest day management
│   │       ├── settings.py     # User preferences
│   │       └── categories.py   # Task category CRUD
│   ├── core/
│   │   ├── config.py           # DATABASE_URL, API_PREFIX
│   │   └── constants.py        # Game constants (transformations, streaks, tiers)
│   ├── database/
│   │   ├── base.py             # SQLAlchemy Base
│   │   └── session.py          # Engine, SessionLocal, get_db dependency
│   ├── models/                 # 13 SQLAlchemy ORM models
│   ├── schemas/                # Pydantic request/response schemas
│   ├── services/               # Business logic (5 services)
│   ├── utils/                  # (currently empty)
│   └── main.py                 # App creation, CORS, startup seeding
├── data/                       # SQLite database file
└── venv/                       # Python virtual environment

frontend/
├── src/
│   ├── components/
│   │   ├── analytics/          # Chart components (3)
│   │   ├── animations/         # PointsPopup, TransformationAnimation
│   │   ├── common/             # Modals and quote dialogs (5)
│   │   └── dashboard/          # HabitCard, TaskCard, PowerLevelBar, etc. (6)
│   ├── context/
│   │   └── ThemeContext.tsx     # Dark/light theme provider
│   ├── pages/                  # Dashboard, Analytics, Settings
│   ├── services/
│   │   └── api.ts              # Axios client with all API functions
│   ├── store/                  # Zustand stores (4)
│   ├── types/
│   │   └── index.ts            # All TypeScript interfaces + constants
│   ├── App.tsx                 # Router + NavBar
│   └── main.tsx                # Entry point with ThemeProvider
└── public/                     # Static assets
```

### Structure Rationale

- **backend/app/api/v1/**: Versioned API keeps endpoints organized. Each module maps 1:1 to a domain (habits, tasks, power, etc.). This is standard FastAPI convention.
- **backend/app/services/**: Business logic separated from route handlers. Services take a `db: Session` and `user_id` — clean dependency injection pattern.
- **backend/app/models/**: One file per model. Relationships defined via SQLAlchemy `relationship()`. Models imported in `__init__.py` to register with Base.metadata.
- **frontend/src/store/**: Zustand stores split by domain (habit, task, power, ui). Each store owns its fetch/mutate methods and calls the API service directly.
- **frontend/src/services/api.ts**: Single file with all API functions. Clean but monolithic — acceptable for this project size.

## Architectural Patterns

### Pattern 1: Service Layer Delegation

**What:** API route handlers are thin — they validate input, call a service method, and return the result. All business logic lives in service classes with `@staticmethod` methods.
**When to use:** Always in this codebase. Route handlers should not contain calculation logic.
**Trade-offs:** Good separation, but static methods make testing harder (no dependency injection for services themselves).

**Example:**
```python
# Route handler — thin
@router.post("/{habit_id}/check")
def check_habit(habit_id: str, db: Session = Depends(get_db)):
    result = HabitService.check_habit(db, DEFAULT_USER_ID, habit_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Habit not found")
    return result
```

### Pattern 2: Zustand Store + API Layer Separation

**What:** Frontend state lives in Zustand stores. Stores call API service functions. Components read from stores and trigger store actions.
**When to use:** For all data that comes from the backend. Local UI state (modal visibility, popups) uses React useState or uiStore.
**Trade-offs:** Simple and effective. The stores re-fetch after mutations (e.g., `createHabit` calls `fetchHabits` + `fetchTodayHabits`), which causes extra network requests but guarantees consistency.

**Example:**
```typescript
// Store action — calls API then re-fetches
createHabit: async (data) => {
    const habit = await habitApi.create(data);
    await get().fetchHabits();
    await get().fetchTodayHabits();
    return habit;
},
```

### Pattern 3: Seed-on-Startup for Default Data

**What:** `main.py` seeds default user, categories, streaks, and 55 quotes on every startup. Uses "create if not exists" pattern.
**When to use:** Single-user app with no migration system. Ensures the app always has required data.
**Trade-offs:** Couples seeding to app startup. The 55 quotes are hardcoded in `main.py`, making it a 150-line function. Works fine but makes `main.py` oversized.

## Data Flow

### Habit Check Flow (Primary User Interaction)

```
User taps HabitCard checkbox
    ↓
Dashboard.handleHabitCheck(habitId)
    ↓
habitStore.checkHabit(habitId)
    ↓
habitApi.check(id) → POST /api/v1/habits/{id}/check
    ↓
habits.py route → HabitService.check_habit(db, user_id, habit_id)
    ↓
HabitService:
  1. Query Habit model
  2. Query TaskCategory (for multiplier)
  3. Get/create HabitStreak
  4. Query HabitLog for today
  5. Calculate: base_points * multiplier + streak_bonus + zenkai_boost
  6. Create/update HabitLog
  7. Apply consistency bonus (check all habits completion rate)
  8. Update DailyLog via PowerService.update_daily_log()
  9. Update Streak via PowerService.update_streak()
  10. Check transformation via PowerService.check_new_transformation()
    ↓
Returns HabitCheckResult (points, streak, transformation, bonuses)
    ↓
Dashboard receives result:
  - Shows PointsPopup animation
  - Triggers TransformationAnimation if new level
  - Fetches contextual Goku quote
  - Re-fetches power level
```

### State Management Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  habitStore   │     │  powerStore   │     │  taskStore    │
│  - habits     │     │  - power      │     │  - tasks      │
│  - todayHabits│     │  - transforms │     │  - categories │
│  - calendar   │     │  - newTrans   │     │  - completions│
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       └────────────────────┼────────────────────┘
                            │
                    Dashboard.tsx
                    (reads from all 3 stores,
                     coordinates cross-store updates)
```

**Key observation:** Dashboard.tsx is the coordination point. When a habit is checked, it must update habit state AND power state AND potentially show quotes. This cross-cutting concern lives in the Dashboard component, not in the stores.

### Key Data Flows

1. **Habit check:** User action triggers HabitService which cascades to PowerService (daily log, streak, transformation check). Single DB transaction for point calculation, but multiple commits within the service.
2. **Page load:** Dashboard fires 6 parallel fetches on mount (categories, tasks, completions, todayHabits, power, transformations). No loading coordination — each resolves independently.
3. **Analytics:** CalendarHeatmap fetches habit calendar data (per-month). PowerHistoryChart and WeeklyChart fetch from analytics endpoints. All independent of Dashboard state.
4. **Quote system:** Contextual quotes fetched on page load. Action-triggered quotes (task complete, all complete, streak) fetched inline after habit/task completion.

## Audit-Specific: What to Check and In What Order

### Suggested Audit Order

The audit should proceed in dependency order — fix foundational issues before checking layers that depend on them.

```
Phase 1: Database & Models (foundation)
    ↓ depends on
Phase 2: Services & Business Logic (calculation correctness)
    ↓ depends on
Phase 3: API Endpoints (request/response contracts)
    ↓ depends on
Phase 4: Frontend API Client & Stores (data fetching correctness)
    ↓ depends on
Phase 5: UI Components & Interactions (visual correctness)
    ↓ depends on
Phase 6: End-to-End Flows (full integration)
```

**Rationale:** A broken model or service will cascade errors upward. Fixing the API layer before the frontend prevents chasing phantom bugs. E2E testing last catches integration issues that unit-level checks miss.

### Phase 1: Database & Models

| Check | What to verify | Why it matters |
|-------|---------------|----------------|
| Model relationships | All `relationship()` definitions have correct back_populates, cascade settings | Orphaned records, cascade delete failures |
| Foreign key integrity | SQLite foreign keys may not be enforced (PRAGMA foreign_keys only for in-memory) | Silent data corruption |
| Default values | `datetime.utcnow` used as default (called once, not per-row) vs `default=datetime.utcnow` (correct) | Stale timestamps |
| Schema consistency | Model fields match Pydantic schemas match TypeScript types | Serialization errors, missing fields |

### Phase 2: Services & Business Logic

| Check | What to verify | Why it matters |
|-------|---------------|----------------|
| Point calculations | streak bonus, consistency tiers, zenkai boost, category multiplier math | Incorrect gamification = broken motivation loop |
| Streak logic | Increment, decrement, zenkai recovery (halve instead of reset) | Core engagement mechanic |
| Consistency bonus | Tiered bonus applied correctly, not double-applied | Points inflation or deflation |
| Cross-service calls | HabitService calls PowerService internally (circular import via late import) | Import errors, tight coupling |
| Total power calculation | Sum of TaskCompletion.points_awarded + HabitLog.points_awarded | Drift between displayed and actual power |

### Phase 3: API Endpoints

| Check | What to verify | Why it matters |
|-------|---------------|----------------|
| All 9 route modules respond | Hit every endpoint, verify 200/201 responses | Dead endpoints break features |
| Error handling | 404 for missing resources, proper error messages | Silent failures in UI |
| Response shape | Dict construction in routes matches frontend types | TypeScript type mismatches |
| DEFAULT_USER_ID consistency | Hardcoded "default-user" used everywhere | Data isolation bugs |

### Phase 4: Frontend API & Stores

| Check | What to verify | Why it matters |
|-------|---------------|----------------|
| API base URL and proxy | Vite proxy config routes /api/v1 to backend port 8000 | CORS errors, failed requests |
| Store re-fetch patterns | After mutations, correct stores are re-fetched | Stale UI state |
| Error handling in stores | What happens when API calls fail (currently: unhandled promise rejections) | Silent failures, stuck loading states |
| Type alignment | TypeScript interfaces match actual API responses | Runtime errors from wrong shapes |

### Phase 5: UI Components

| Check | What to verify | Why it matters |
|-------|---------------|----------------|
| Theme consistency | All components use CSS variables, no hardcoded colors | Broken dark/light mode |
| HabitCard interactions | Check, edit, archive, delete, move up/down all work | Core UX flow |
| Modal state | Open/close, form validation, submit behavior | Broken forms = can't create/edit |
| Animation triggers | PointsPopup, TransformationAnimation, ki-burst | Gamification feedback loop |

### Phase 6: End-to-End

| Check | What to verify | Why it matters |
|-------|---------------|----------------|
| Create habit → check → verify streak | Full lifecycle works | Core value proposition |
| Complete all habits → consistency bonus | Kaio-ken tier system triggers correctly | Motivation mechanic |
| Transformation unlock | Points accumulate past threshold → animation plays | Peak gamification moment |
| Calendar reflects completions | Check habit today → calendar heatmap updates | Analytics accuracy |

## Anti-Patterns Found in Current Codebase

### Anti-Pattern 1: Manual Dict Construction Instead of Pydantic Serialization

**What people do:** Route handlers manually build response dicts with 15+ fields instead of using Pydantic response models.
**Why it's wrong:** Easy to miss fields, add wrong types, or drift from the TypeScript types. Every route for habits builds the same dict with category_name/color/multiplier joined in.
**Do this instead:** Use `response_model=HabitResponse` in the route decorator and let Pydantic serialize. The schemas exist (`HabitResponse` is defined) but aren't used in routes.

**Where:** `habits.py` lines 39-63, 126-146, 159-179, 199-219 — four copies of the same dict construction.

### Anti-Pattern 2: N+1 Queries in List Endpoints

**What people do:** `get_today_habits` and `list_habits` query each habit's category individually inside a loop.
**Why it's wrong:** For N habits, this generates N+1 database queries. For 10 habits, that's 11 queries instead of 1-2.
**Do this instead:** Use SQLAlchemy `joinedload` or `selectinload` to eager-load the category relationship in a single query.

**Where:** `habit_service.py` lines 60-62 (inside loop), `habits.py` lines 40-41 (inside loop).

### Anti-Pattern 3: Cross-Service Circular Imports

**What people do:** `HabitService.check_habit` imports `PowerService` inside the method body to avoid circular import at module level.
**Why it's wrong:** Fragile, hard to test, unclear dependency graph. Late imports are a code smell that indicates tight coupling.
**Do this instead:** Accept the coupling for now (it's a small app), but document it. If refactoring, extract a shared "points calculator" that both services use.

**Where:** `habit_service.py` line 96, `habit_service.py` line 319.

### Anti-Pattern 4: Oversized main.py with Hardcoded Seed Data

**What people do:** 55 quotes with full text are hardcoded directly in `main.py` startup function.
**Why it's wrong:** Makes `main.py` 150+ lines, most of which is static data. Hard to update quotes without touching the app entry point.
**Do this instead:** Move seed data to a separate module (e.g., `app/database/seeds.py`) or a JSON file. Import and call from startup.

**Where:** `main.py` lines 63-143.

### Anti-Pattern 5: Multiple Commits Within a Single Business Operation

**What people do:** `HabitService.check_habit` commits midway (line 138 for un-complete, line 189 for complete), then `_apply_consistency_bonus` commits again (line 310), then `PowerService.update_daily_log` commits again.
**Why it's wrong:** If a later step fails, earlier commits are already persisted — partial state. Not transactional.
**Do this instead:** Use a single commit at the end of the operation, or use SQLAlchemy nested transactions (savepoints).

**Where:** `habit_service.py` lines 138, 189, 310; `power_service.py` lines 170, 220.

## Integration Points

### Internal Boundaries

| Boundary | Communication | Audit Notes |
|----------|---------------|-------------|
| Frontend ↔ Backend | HTTP REST via Vite dev proxy (port 5173 → port 8000) | Verify proxy config in vite.config.ts |
| Route handlers ↔ Services | Direct function calls, db session passed as parameter | Clean boundary, but dict responses bypass schemas |
| Services ↔ Models | SQLAlchemy ORM queries | N+1 query patterns in list operations |
| HabitService ↔ PowerService | Late import, direct static method calls | Circular dependency managed via runtime import |
| Zustand stores ↔ API service | Direct async function calls | No error boundaries, unhandled rejections possible |
| Dashboard ↔ Multiple stores | Reads from habitStore + taskStore + powerStore | Cross-store coordination done in component (acceptable for small app) |
| ThemeContext ↔ All components | CSS variables set on :root by ThemeProvider | All components must use var() not hardcoded colors |

### External Services

None. This is a fully local application with no external API calls, no auth provider, no cloud database. The only "external" dependency is the filesystem (SQLite database file).

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 1 user (current) | Current architecture is appropriate. SQLite, no auth, single process. No changes needed. |
| 2-5 users (household) | Would need: user authentication, per-user data isolation (currently hardcoded DEFAULT_USER_ID), concurrent SQLite access considerations. |
| 100+ users | Would need: PostgreSQL instead of SQLite, proper auth (OAuth/JWT), deployment infrastructure, connection pooling. Major rewrite. |

### What NOT to Optimize

This is a **single-user local app**. Do not:
- Add caching layers (SQLite is fast enough for one user)
- Add message queues or background workers
- Split into microservices
- Add Redis or any external dependencies

The audit should focus on **correctness and reliability**, not performance or scale.

## Sources

- Direct codebase analysis (HIGH confidence — reading actual source files)
- FastAPI project structure conventions (HIGH confidence — well-established patterns)
- SQLAlchemy relationship and query patterns (HIGH confidence — standard ORM patterns)
- Zustand state management patterns (HIGH confidence — documented library conventions)

---
*Architecture research for: Saiyan Tracker Full Stack Audit*
*Researched: 2026-02-28*
