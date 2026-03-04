# Phase 3: API Routes and Schemas - Research

**Researched:** 2026-03-04
**Domain:** FastAPI REST endpoints + Pydantic v2 request/response schemas
**Confidence:** HIGH

## Summary

Phase 3 wraps the 7 game logic services built in Phase 2 with REST endpoints and typed Pydantic schemas. The codebase already has FastAPI in `requirements.txt` and a working `main.py` with lifespan, health check, and `get_db()` dependency -- but FastAPI/Pydantic are **not yet installed** (only SQLAlchemy and pytest are in the venv). The `httpx` package is also missing, which is required by `TestClient`.

All service functions follow a consistent pattern: accept `db: Session` and `user_id: UUID`, do `db.flush()` (not commit), and return plain dicts. Routes must commit after calling services and wrap those dicts in Pydantic response models. The `check_habit()` orchestrator returns a comprehensive dict with 15+ fields that maps almost directly to the API-01 response schema -- the main addition is embedding a quote and expanding capsule drop with reward details.

**Primary recommendation:** Use FastAPI's `APIRouter` with domain routers under `backend/app/api/v1/`, Pydantic v2 `BaseModel` with `model_config = ConfigDict(from_attributes=True)` for ORM-compatible schemas, `get_db()` + `get_current_user()` as FastAPI dependencies, and `TestClient` with dependency overrides for route testing.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Pass check_habit() service dict through mostly as-is, wrapped in Pydantic schemas for validation and OpenAPI docs
- Capsule drops include full reward details inline (name, rarity, description) -- no second API call needed for the capsule popup animation
- No pagination on list endpoints -- data sets are small (habits, rewards, wishes, categories). Return all items
- GET /power/current returns full attribute breakdown per attribute: raw XP, calculated level, title, xp_for_current_level, xp_for_next_level, progress_percent -- frontend renders attribute bars directly
- Block habit checks on off days with 409 Conflict and clear message -- prevents accidental state corruption
- Use FastAPI's built-in HTTPException format ({"detail": "message"}) -- standard pattern, no custom error schema
- Soft delete for habits -- set is_active=false, preserve historical logs/streaks/XP for analytics
- Validate that check_habit only works for habits due on the provided local_date -- return 422 if not due
- Domain routers in backend/app/api/v1/: habits.py, power.py, rewards.py, wishes.py, categories.py, off_days.py, analytics.py, settings.py, quotes.py
- All endpoints under /api/v1/ prefix (e.g., /api/v1/habits, /api/v1/power)
- Default user dependency: get_current_user() returns the single default user. Routes don't accept user_id. Auth can be swapped in later by changing only the dependency
- local_date required on date-sensitive endpoints (check_habit, today/list, off-days) as query param or body field -- prevents timezone/midnight bugs
- check_habit response includes a context-appropriate quote embedded (habit_complete, perfect_day, transformation, etc.) -- one response feeds the entire animation queue
- Separate GET /quotes/random?trigger_event=X also exists for other contexts (welcome screen, etc.)
- Backend tracks Vegeta roast severity based on consecutive missed days -- single source of truth for game state
- Trigger event only for filtering (no character filter) -- backend picks the right character based on context
- Quote response includes character name, avatar path, source_saga alongside the text -- frontend renders quote bar directly

### Claude's Discretion
- Exact Pydantic schema field names and nesting details
- Swagger UI tags and descriptions
- Request body vs query param decisions for non-date fields
- Analytics endpoint response structures (summary, capsule-history, wish-history, contribution-graph)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| API-01 | POST /habits/{id}/check returns composite response (attribute_xp, completion_rate, tier, capsule_drop, is_perfect_day, dragon_ball, transformation, streak, daily_xp, quote) | check_habit() dict maps directly; add quote embedding + capsule reward expansion via Pydantic nested schemas |
| API-02 | Habit CRUD (GET/POST/PUT/DELETE /habits/) with importance and attribute fields | Standard FastAPI CRUD pattern; Habit model has all fields; soft delete via is_active=false |
| API-03 | GET /habits/today/list returns today's habits with completion status, streaks, attribute, importance | get_habits_due_on_date() exists; join HabitLog + HabitStreak for completion/streak data |
| API-04 | GET /habits/calendar/all returns monthly heatmap data | Query DailyLog table by date range; return is_perfect_day, completion_tier, xp_earned per day |
| API-05 | Reward CRUD (GET/POST/PUT/DELETE /rewards/) for capsule items | Standard CRUD on Reward model; rarity validation via constants |
| API-06 | Wish CRUD + POST /wishes/grant for Shenron claiming | Standard CRUD + grant_wish() service already exists |
| API-07 | GET /power/current returns power level, transformation, attribute levels | Compose from User fields + calc_attribute_level/get_attribute_title/get_xp_for_next_level per attribute |
| API-08 | GET /attributes/ returns current attribute levels, titles, XP breakdown | Same data as API-07 attribute section; can share schema or be a focused endpoint |
| API-09 | Category CRUD (GET/POST/PUT/DELETE /categories/) | Standard CRUD on Category model; visual-only fields |
| API-10 | Off day management (GET/POST/DELETE /off-days/) | mark_off_day(), cancel_off_day(), is_off_day() services exist; local_date required |
| API-11 | GET /analytics/summary?period=week|month|all | Query DailyLog for period; compute perfect_days, avg_completion, total_xp, longest_streak |
| API-12 | GET /analytics/capsule-history and GET /analytics/wish-history | Query CapsuleDrop (join Reward) and WishLog (join Wish) tables |
| API-13 | GET /habits/{id}/contribution-graph?days=90 | Query HabitLog for habit over N days; return date + completed pairs for GitHub-style grid |
| API-14 | GET /quotes/random?trigger_event=X | Query Quote table filtered by trigger_event; random selection |
| API-15 | GET/PUT /settings/ for user preferences | Read/update User.sound_enabled, User.theme, User.display_name |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| FastAPI | >=0.115 (latest) | Web framework, routing, dependency injection, OpenAPI | Already in requirements.txt; standard Python API framework |
| Pydantic | v2 (bundled with FastAPI) | Request/response validation, serialization, OpenAPI schema generation | Pydantic v2 with Rust core is 5-50x faster than v1; auto-included with FastAPI |
| uvicorn | standard bundle | ASGI server | Already in requirements.txt |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| httpx | latest | Required by FastAPI TestClient | Must install for route testing; TestClient wraps httpx |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Pydantic BaseModel | SQLModel | SQLModel merges SQLAlchemy + Pydantic but adds coupling; separate schemas give more control |
| Sync SQLAlchemy | Async SQLAlchemy | Async not needed for single-user SQLite (decision from Phase 1) |

**Installation:**
```bash
pip install "fastapi[standard]" httpx
```

Note: `fastapi[standard]` pulls in uvicorn, pydantic, and other essentials. `httpx` is needed separately for TestClient.

## Architecture Patterns

### Recommended Project Structure
```
backend/app/
├── api/
│   ├── __init__.py
│   ├── router.py          # Master router: includes all v1 routers
│   └── v1/
│       ├── __init__.py
│       ├── habits.py       # Habit CRUD + check + today/list + calendar + contribution
│       ├── power.py        # /power/current + /attributes/
│       ├── rewards.py      # Reward CRUD
│       ├── wishes.py       # Wish CRUD + grant
│       ├── categories.py   # Category CRUD
│       ├── off_days.py     # Off day management
│       ├── analytics.py    # Summary, capsule-history, wish-history
│       ├── settings.py     # User settings
│       └── quotes.py       # Random quote
├── schemas/
│   ├── __init__.py
│   ├── habit.py            # HabitCreate, HabitUpdate, HabitResponse, HabitTodayResponse
│   ├── check_habit.py      # CheckHabitRequest, CheckHabitResponse (the big composite)
│   ├── power.py            # PowerResponse, AttributeDetail
│   ├── reward.py           # RewardCreate, RewardResponse
│   ├── wish.py             # WishCreate, WishResponse, WishGrantRequest
│   ├── category.py         # CategoryCreate, CategoryResponse
│   ├── off_day.py          # OffDayCreate, OffDayResponse
│   ├── analytics.py        # AnalyticsSummary, CapsuleHistoryItem, WishHistoryItem
│   ├── settings.py         # SettingsResponse, SettingsUpdate
│   └── quote.py            # QuoteResponse
└── api/deps.py             # get_current_user(), get_db() re-export
```

### Pattern 1: Domain Router with Dependency Injection
**What:** Each domain gets an APIRouter with prefix and tags. Routes inject `db` and `user` via Depends().
**When to use:** Every route in this phase.
**Example:**
```python
# backend/app/api/v1/habits.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.habit import HabitCreate, HabitResponse

router = APIRouter(prefix="/habits", tags=["habits"])

@router.post("/", response_model=HabitResponse, status_code=201)
def create_habit(
    habit_in: HabitCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # ... create habit ...
    db.commit()
    db.refresh(habit)
    return habit
```

### Pattern 2: Pydantic v2 Schemas with ORM Mode
**What:** Use `model_config = ConfigDict(from_attributes=True)` to let Pydantic read SQLAlchemy model attributes directly.
**When to use:** All response schemas that return ORM model data.
**Example:**
```python
from pydantic import BaseModel, ConfigDict
from uuid import UUID

class HabitResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    importance: str
    attribute: str
    frequency: str
    is_active: bool
```

### Pattern 3: Commit-in-Route Pattern
**What:** Services flush but don't commit. Routes call `db.commit()` after service calls, then `db.refresh()` if returning the updated object.
**When to use:** All write endpoints (POST, PUT, DELETE, check_habit).
**Example:**
```python
@router.post("/{habit_id}/check")
def check_habit_route(
    habit_id: UUID,
    request: CheckHabitRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # Validate off-day
    if is_off_day(db, user.id, request.local_date):
        raise HTTPException(409, "Cannot check habits on an off day")
    # Validate habit is due
    due_habits = get_habits_due_on_date(db, user.id, request.local_date)
    if habit_id not in [h.id for h in due_habits]:
        raise HTTPException(422, "Habit is not due on this date")
    # Execute
    result = check_habit(db, user.id, habit_id, request.local_date)
    db.commit()
    # Enrich with quote and capsule details
    return enrich_check_response(db, result)
```

### Pattern 4: Default User Dependency
**What:** `get_current_user()` queries for the single default user. No auth logic. Returns the User ORM object.
**When to use:** Every route that needs user context.
**Example:**
```python
# backend/app/api/deps.py
from fastapi import Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User

def get_current_user(db: Session = Depends(get_db)) -> User:
    """Return the single default user. Swap this for auth later."""
    user = db.query(User).first()
    if user is None:
        raise HTTPException(500, "No default user found. Run seed.")
    return user
```

### Pattern 5: Master Router Assembly
**What:** A single `api/router.py` that imports and includes all domain routers, then `main.py` includes just this one.
**When to use:** App initialization.
**Example:**
```python
# backend/app/api/router.py
from fastapi import APIRouter
from app.api.v1 import habits, power, rewards, wishes, categories, off_days, analytics, settings, quotes

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(habits.router)
api_router.include_router(power.router)
# ... etc

# backend/app/main.py
from app.api.router import api_router
app.include_router(api_router)
```

### Anti-Patterns to Avoid
- **Committing in services:** Services flush only. Route commits. This keeps transaction boundaries clear and testable.
- **Accepting user_id in routes:** Routes get user from dependency. user_id is internal. This makes auth swap trivial later.
- **Raw dict responses without schema:** Always use `response_model=` for OpenAPI documentation and validation. Even check_habit() dict gets wrapped.
- **Creating schemas that mirror models 1:1:** Create/Update schemas should only include user-settable fields. Response schemas can include computed fields.
- **Forgetting db.refresh() after commit:** After `db.commit()`, lazy-loaded attributes become detached. Call `db.refresh(obj)` before returning ORM objects.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Request validation | Manual dict parsing | Pydantic BaseModel as function params | Automatic validation, error messages, OpenAPI docs |
| OpenAPI/Swagger docs | Manual spec files | FastAPI auto-generation from type hints | Always in sync with code |
| Test HTTP client | Manual request construction | FastAPI TestClient | Handles app lifecycle, cookies, redirects |
| UUID path parsing | String parsing + validation | FastAPI path params with UUID type hint | Automatic 422 on invalid UUID |
| Date string validation | Manual regex | Pydantic field with pattern or custom validator | Consistent error format |
| Enum validation | if/elif chains | Literal type hints or Pydantic field validators | Auto-422 with allowed values listed |

**Key insight:** FastAPI + Pydantic v2 handle 90% of validation, serialization, and documentation automatically through type hints. The main custom logic is business rules (off-day blocking, due-date validation, quote selection).

## Common Pitfalls

### Pitfall 1: Forgetting to Install httpx
**What goes wrong:** `TestClient` import fails with cryptic error.
**Why it happens:** FastAPI 0.100+ requires httpx for TestClient but doesn't auto-install it.
**How to avoid:** `pip install httpx` and add to requirements.txt.
**Warning signs:** `ImportError` when importing `from fastapi.testclient import TestClient`.

### Pitfall 2: Detached Instance Error After Commit
**What goes wrong:** Accessing ORM relationship attributes after `db.commit()` raises `DetachedInstanceError`.
**Why it happens:** SQLAlchemy expires all attributes on commit. Lazy loading fails outside the session context.
**How to avoid:** Call `db.refresh(obj)` after commit, or use `expire_on_commit=False` in SessionLocal, or build response dict before commit.
**Warning signs:** `DetachedInstanceError` or `MissingGreenlet` errors on response serialization.

### Pitfall 3: Circular Import Between Schemas
**What goes wrong:** Schema files importing each other (e.g., HabitResponse needs CategoryResponse) causes ImportError.
**Why it happens:** Python circular import when schemas reference each other.
**How to avoid:** Use `TYPE_CHECKING` guard for type hints, or inline nested schemas, or use `model_rebuild()` after all schemas defined.
**Warning signs:** ImportError on startup mentioning schema modules.

### Pitfall 4: UUID Serialization in JSON
**What goes wrong:** UUID fields serialize as objects instead of strings in JSON response.
**Why it happens:** Pydantic v2 serializes UUID as-is by default.
**How to avoid:** No action needed -- Pydantic v2 serializes UUID to string in JSON mode automatically. But if constructing dicts manually (like check_habit does with `str(habit_id)`), be consistent.
**Warning signs:** UUID appearing as object in Swagger UI responses.

### Pitfall 5: Off-Day Check Race Condition in API Layer
**What goes wrong:** User marks off-day while simultaneously checking a habit, both pass validation.
**Why it happens:** Two concurrent requests read "not off day" before either creates the OffDay record.
**How to avoid:** Not a concern for single-user SQLite app. If it were, use database-level constraint or pessimistic locking.
**Warning signs:** N/A for this project.

### Pitfall 6: TestClient Not Triggering Lifespan
**What goes wrong:** Test database not seeded, tables not created.
**Why it happens:** TestClient does not run lifespan by default in older FastAPI versions.
**How to avoid:** Use `with TestClient(app) as client:` context manager, or override get_db to use test session. The project already has a test conftest with in-memory SQLite -- override get_db to inject the test session.
**Warning signs:** 500 errors about missing tables in tests.

### Pitfall 7: Quote Selection Logic Missing from Services
**What goes wrong:** API-01 requires a quote in check_habit response, but check_habit() service doesn't return one.
**Why it happens:** Quote selection is deliberately not in the service layer -- it's a presentation concern.
**How to avoid:** Build quote selection as a helper function in the route layer or a thin quote_service query function. Select based on: trigger_event context (habit_complete, perfect_day, transformation, zenkai), and for roasts, severity based on consecutive missed days.
**Warning signs:** check_habit response missing quote field.

## Code Examples

### Check Habit Response Schema (API-01 centerpiece)
```python
# Source: Derived from check_habit() return dict + CONTEXT.md decisions
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional

class QuoteResponse(BaseModel):
    character: str
    quote_text: str
    source_saga: str
    avatar_path: str  # Computed from character name

class CapsuleDropDetail(BaseModel):
    id: UUID
    reward_id: UUID
    reward_title: str
    reward_rarity: str

class DailyLogSummary(BaseModel):
    habits_due: int
    habits_completed: int
    completion_rate: float
    completion_tier: str
    xp_earned: int
    streak_multiplier: float
    zenkai_bonus_applied: bool
    dragon_ball_earned: bool

class StreakInfo(BaseModel):
    current_streak: int
    best_streak: int

class TransformChange(BaseModel):
    key: str
    name: str
    threshold: int

class DragonBallInfo(BaseModel):
    dragon_balls_collected: int
    wish_available: bool

class CheckHabitResponse(BaseModel):
    is_checking: bool
    habit_id: UUID
    log_date: str
    attribute_xp_awarded: int
    is_perfect_day: bool
    zenkai_activated: bool
    daily_log: DailyLogSummary
    streak: StreakInfo
    habit_streak: StreakInfo
    power_level: int
    transformation: str
    transform_change: Optional[TransformChange] = None
    dragon_ball: Optional[DragonBallInfo] = None
    capsule: Optional[CapsuleDropDetail] = None
    quote: Optional[QuoteResponse] = None
```

### Power/Attributes Response (API-07/API-08)
```python
# Source: CONTEXT.md decisions + attribute_service.py functions
class AttributeDetail(BaseModel):
    attribute: str       # "str", "vit", "int", "ki"
    raw_xp: int
    level: int
    title: Optional[str]
    xp_for_current_level: int
    xp_for_next_level: int
    progress_percent: float

class PowerResponse(BaseModel):
    power_level: int
    transformation: str
    transformation_name: str
    next_transformation: Optional[str]
    next_threshold: Optional[int]
    dragon_balls_collected: int
    wishes_granted: int
    attributes: list[AttributeDetail]
```

### TestClient Setup with Dependency Override
```python
# Source: FastAPI testing docs pattern + existing conftest.py
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.api.deps import get_db, get_current_user

@pytest.fixture()
def client(db, sample_user):
    """TestClient with overridden dependencies."""
    def override_get_db():
        yield db

    def override_get_current_user():
        return sample_user

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
```

### Analytics Summary Query Pattern (API-11)
```python
# Source: DailyLog model + REQUIREMENTS.md analytics spec
from sqlalchemy import func
from app.models.daily_log import DailyLog

def get_analytics_summary(db, user_id, period):
    query = db.query(DailyLog).filter(DailyLog.user_id == user_id)
    if period != "all":
        # Compute start_date from period
        query = query.filter(DailyLog.log_date >= start_date)

    logs = query.all()
    return {
        "perfect_days": sum(1 for l in logs if l.is_perfect_day),
        "avg_completion": sum(l.habit_completion_rate for l in logs) / max(len(logs), 1),
        "total_xp": sum(l.xp_earned for l in logs),
        "days_tracked": len(logs),
    }
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pydantic v1 `class Config: orm_mode = True` | Pydantic v2 `model_config = ConfigDict(from_attributes=True)` | Pydantic 2.0 (2023) | Must use v2 syntax; v1 compat mode deprecated |
| `@app.on_event("startup")` | `lifespan` context manager | FastAPI 0.93+ (2023) | Already using lifespan in main.py |
| `fastapi.testclient` needs `requests` | Needs `httpx` instead | FastAPI 0.100+ (2023) | Must install httpx |
| `Optional[X]` for nullable fields | `X | None` or `Optional[X]` both work | Python 3.10+ / Pydantic v2 | Either syntax fine |

**Deprecated/outdated:**
- `schema_extra` in Pydantic v1 Config: replaced by `json_schema_extra` in v2
- `orm_mode = True`: replaced by `from_attributes=True` in ConfigDict
- `@validator`: replaced by `@field_validator` in Pydantic v2

## Open Questions

1. **Quote selection algorithm for check_habit**
   - What we know: check_habit() does not select a quote. CONTEXT.md says response must include context-appropriate quote. trigger_event types are defined in constants.
   - What's unclear: Exact priority logic for which trigger_event to use when multiple apply (e.g., perfect_day AND transformation in same check). Vegeta roast severity tracking (consecutive missed days) -- no existing service function for this.
   - Recommendation: Build a `select_quote_for_context()` helper that takes the check_habit result dict and picks the highest-priority trigger_event. Priority: transformation > perfect_day > zenkai > streak_milestone > habit_complete. For roasts, query missed days from DailyLog gaps. Keep it in a quote_service or route helper.

2. **Calendar endpoint date range**
   - What we know: API-04 says "monthly heatmap" but could be any date range.
   - What's unclear: Should it accept start/end dates or month/year? Should it include off-day markers?
   - Recommendation: Accept `month` (YYYY-MM format) as query param, return all days in that month. Include off-day dates in response for the blue outline rendering.

3. **Attribute XP consumed calculation for progress_percent**
   - What we know: `calc_attribute_level()` iterates cumulative costs. Need `xp_consumed_at_current_level` to compute progress.
   - What's unclear: No existing function returns xp_consumed.
   - Recommendation: Add a small helper or compute inline in the power route: iterate levels, sum costs up to current level = xp_consumed, then `progress = (total_xp - xp_consumed) / cost_of_next_level`.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | pytest 9.0.2 |
| Config file | backend/pyproject.toml (`[tool.pytest.ini_options]`) |
| Quick run command | `cd backend && python -m pytest tests/test_api_habits.py -x` |
| Full suite command | `cd backend && python -m pytest tests/ -x` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| API-01 | POST /habits/{id}/check returns composite response | integration | `cd backend && python -m pytest tests/test_api_habits.py::test_check_habit_response -x` | Wave 0 |
| API-02 | Habit CRUD works with importance/attribute | integration | `cd backend && python -m pytest tests/test_api_habits.py::test_habit_crud -x` | Wave 0 |
| API-03 | GET /habits/today/list returns today's habits | integration | `cd backend && python -m pytest tests/test_api_habits.py::test_habits_today -x` | Wave 0 |
| API-04 | GET /habits/calendar/all returns heatmap data | integration | `cd backend && python -m pytest tests/test_api_habits.py::test_calendar -x` | Wave 0 |
| API-05 | Reward CRUD | integration | `cd backend && python -m pytest tests/test_api_rewards.py -x` | Wave 0 |
| API-06 | Wish CRUD + grant | integration | `cd backend && python -m pytest tests/test_api_wishes.py -x` | Wave 0 |
| API-07 | GET /power/current returns full breakdown | integration | `cd backend && python -m pytest tests/test_api_power.py::test_power_current -x` | Wave 0 |
| API-08 | GET /attributes/ returns attribute details | integration | `cd backend && python -m pytest tests/test_api_power.py::test_attributes -x` | Wave 0 |
| API-09 | Category CRUD | integration | `cd backend && python -m pytest tests/test_api_categories.py -x` | Wave 0 |
| API-10 | Off day GET/POST/DELETE | integration | `cd backend && python -m pytest tests/test_api_off_days.py -x` | Wave 0 |
| API-11 | GET /analytics/summary | integration | `cd backend && python -m pytest tests/test_api_analytics.py::test_summary -x` | Wave 0 |
| API-12 | GET /analytics/capsule-history + wish-history | integration | `cd backend && python -m pytest tests/test_api_analytics.py::test_histories -x` | Wave 0 |
| API-13 | GET /habits/{id}/contribution-graph | integration | `cd backend && python -m pytest tests/test_api_habits.py::test_contribution_graph -x` | Wave 0 |
| API-14 | GET /quotes/random | integration | `cd backend && python -m pytest tests/test_api_quotes.py -x` | Wave 0 |
| API-15 | GET/PUT /settings/ | integration | `cd backend && python -m pytest tests/test_api_settings.py -x` | Wave 0 |

### Sampling Rate
- **Per task commit:** `cd backend && python -m pytest tests/test_api_*.py -x --tb=short`
- **Per wave merge:** `cd backend && python -m pytest tests/ -x`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `pip install "fastapi[standard]" httpx` -- FastAPI and httpx not yet installed in venv
- [ ] Update `backend/requirements.txt` to include httpx
- [ ] `backend/app/api/__init__.py` -- API package does not exist yet
- [ ] `backend/app/api/v1/__init__.py` -- v1 sub-package does not exist yet
- [ ] `backend/app/api/deps.py` -- Dependencies module (get_current_user) does not exist yet
- [ ] `backend/app/schemas/__init__.py` -- Schemas package does not exist yet
- [ ] Test conftest needs `client` fixture with TestClient + dependency overrides
- [ ] All `tests/test_api_*.py` files -- none exist yet

## Sources

### Primary (HIGH confidence)
- [FastAPI APIRouter reference](https://fastapi.tiangolo.com/reference/apirouter/) - Router constructor params, include_router pattern
- [FastAPI Testing docs](https://fastapi.tiangolo.com/tutorial/testing/) - TestClient setup, basic test patterns
- [FastAPI Testing Dependencies](https://fastapi.tiangolo.com/advanced/testing-dependencies/) - dependency_overrides pattern for test DB injection
- Codebase inspection: all 15 SQLAlchemy models, 7 service modules, main.py, conftest.py, constants.py

### Secondary (MEDIUM confidence)
- [FastAPI best practices (zhanymkanov)](https://github.com/zhanymkanov/fastapi-best-practices) - Domain-based organization, schema patterns
- [FastAPI production patterns 2025](https://orchestrator.dev/blog/2025-1-30-fastapi-production-patterns/) - Commit patterns, response model best practices

### Tertiary (LOW confidence)
- None -- all findings verified against official docs or codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - FastAPI + Pydantic v2 are already chosen; patterns well-documented
- Architecture: HIGH - Router/schema structure follows official FastAPI patterns; codebase already establishes service conventions
- Pitfalls: HIGH - Verified against official docs (httpx requirement, Pydantic v2 syntax, detached instance errors)

**Research date:** 2026-03-04
**Valid until:** 2026-04-04 (stable stack, 30 days)
