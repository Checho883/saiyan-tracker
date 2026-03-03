# Architecture Research

**Domain:** React + FastAPI gamified habit tracker (single-user, local SQLite)
**Researched:** 2026-03-03
**Confidence:** HIGH (stack is well-documented; patterns drawn from official SQLAlchemy 2.0 docs, Framer Motion docs, FastAPI best practices, and Zustand docs)

---

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BROWSER (React 19 + Vite 7)                  │
├────────────────────────────────┬────────────────────────────────────┤
│          UI LAYER              │       ANIMATION/AUDIO LAYER        │
│  pages/  components/           │  AnimationOrchestrator (uiStore)   │
│  Dashboard, Analytics,         │  SoundProvider (Context)           │
│  Settings                      │  AnimatePresence (Framer Motion)   │
├────────────────────────────────┴────────────────────────────────────┤
│                         STATE LAYER (Zustand)                        │
│  habitStore │ powerStore │ rewardStore │ uiStore                     │
├─────────────────────────────────────────────────────────────────────┤
│                         API CLIENT (services/api.ts)                 │
│  Typed fetch wrapper — all HTTP calls go through here               │
└────────────────────┬────────────────────────────────────────────────┘
                     │  HTTP (REST, JSON)
                     │  localhost:8000/api/v1
┌────────────────────▼────────────────────────────────────────────────┐
│                        FASTAPI BACKEND                               │
├────────────────────────────────┬────────────────────────────────────┤
│           ROUTE LAYER          │       Thin — gather input,         │
│  api/v1/habits.py              │       call service, return         │
│  api/v1/power.py               │       response. No business        │
│  api/v1/rewards.py  ...        │       logic lives here.            │
├────────────────────────────────┴────────────────────────────────────┤
│                        SERVICE LAYER                                 │
│  habit_service.py  — check logic, XP calc, capsule RNG              │
│  power_service.py  — transformation detection, attribute leveling   │
│  reward_service.py — capsule drop, wish grant                       │
│  quote_service.py  — quote selection by trigger + context           │
│  analytics_service.py — aggregation queries                         │
├─────────────────────────────────────────────────────────────────────┤
│                        PERSISTENCE LAYER                             │
│  SQLAlchemy 2.0 ORM (sync)  +  SQLite                               │
│  models/: User, Habit, HabitLog, HabitStreak, DailyLog,            │
│           Streak, PowerLevel, Reward, CapsuleDrop,                  │
│           Wish, WishLog, OffDay, Achievement, Quote                  │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **pages/** | Compose layout, read from stores, dispatch actions | Zustand stores, components |
| **components/dashboard/** | Render UI slices: SaiyanAvatar, AttributeBars, DailyAuraBar, DragonBallTracker, HabitCard | habitStore, powerStore, uiStore |
| **components/animations/** | Full-screen overlays: PerfectDayAnimation, ShenronAnimation, TransformationAnimation, CapsuleDropPopup | uiStore (queued animation state) |
| **components/audio/SoundProvider** | Context that exposes `play(soundId)`. Manages Howler instances. Respects sound toggle. | uiStore (sound_enabled), consumed app-wide |
| **uiStore** | Owns animation queue, active modal, quote display, animation trigger flags | Read by animation components, written by habitStore actions |
| **habitStore** | Today's habits, daily progress, calendar data. On check: calls API, processes response, writes to uiStore triggers | api.ts, uiStore, powerStore |
| **powerStore** | Power level, transformation, attribute XP/levels, dragon balls | api.ts |
| **rewardStore** | Capsule rewards CRUD, wishes CRUD, capsule drop history | api.ts |
| **services/api.ts** | Typed HTTP client. All fetch calls live here — no raw fetch in stores or components | FastAPI backend |
| **FastAPI routes** | Validate request, call service, serialize response. No business logic. | Service layer |
| **Service layer** | All game logic: XP formulas, capsule RNG, transformation detection, streak updates, Dragon Ball awards | SQLAlchemy session (via dependency injection) |
| **SQLAlchemy models** | Data schema and ORM relationships | SQLite via session |

---

## Recommended Project Structure

The PRD already specifies this structure. Rationale for each decision is noted below.

```
backend/
├── app/
│   ├── main.py                    # App factory, CORS, router include
│   ├── api/
│   │   └── v1/
│   │       ├── router.py          # Aggregates all route modules
│   │       ├── habits.py          # CRUD + /check endpoint (the complex one)
│   │       ├── power.py
│   │       ├── rewards.py
│   │       ├── wishes.py
│   │       ├── categories.py
│   │       ├── quotes.py
│   │       ├── off_days.py
│   │       ├── analytics.py
│   │       └── settings.py
│   ├── services/
│   │   ├── habit_service.py       # check_habit() — the god function
│   │   ├── power_service.py
│   │   ├── reward_service.py
│   │   ├── quote_service.py
│   │   └── analytics_service.py
│   ├── models/                    # One file per SQLAlchemy model
│   ├── schemas/                   # Pydantic request/response shapes
│   ├── database/
│   │   ├── base.py                # DeclarativeBase
│   │   └── session.py             # SessionLocal, get_db dependency
│   └── core/
│       ├── config.py              # Settings (pydantic-settings)
│       └── constants.py           # XP values, transformation thresholds, rarity weights

frontend/
├── src/
│   ├── types/index.ts             # All shared TypeScript types
│   ├── services/api.ts            # All HTTP calls — single source of truth
│   ├── store/
│   │   ├── habitStore.ts
│   │   ├── powerStore.ts
│   │   ├── rewardStore.ts
│   │   └── uiStore.ts
│   ├── context/
│   │   └── ThemeContext.tsx
│   ├── components/
│   │   ├── audio/
│   │   │   └── SoundProvider.tsx  # Howler.js context — loaded once at app root
│   │   ├── dashboard/             # SaiyanAvatar, AttributeBars, DailyAuraBar,
│   │   │                          # DragonBallTracker, HabitCard, StreakDisplay
│   │   ├── animations/            # PerfectDayAnimation, ShenronAnimation,
│   │   │                          # TransformationAnimation, CapsuleDropPopup, PointsPopup
│   │   ├── analytics/             # CalendarHeatmap, ContributionGraph, AttributeChart
│   │   └── common/                # HabitFormModal, OffDayModal, GokuQuote,
│   │                              # VegetaDialog, RewardManager, WishManager
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Analytics.tsx
│   │   └── Settings.tsx
│   └── assets/                    # Sound files (.mp3/.webm), character images, DB images
```

### Structure Rationale

- **services/ separate from api/v1/:** Routes are thin request/response adapters. All game logic (XP formula, capsule RNG, transformation detection) lives in services where it can be tested without HTTP context.
- **constants.py for game values:** XP amounts, transformation thresholds, and rarity weights are magic numbers that change. Centralizing them prevents hunt-and-fix bugs when tuning game balance.
- **store/ per domain:** Each Zustand store owns one domain. habitStore does not import powerStore — they communicate through the API response (the `/check` response contains all side-effect results).
- **components/audio/ isolated:** SoundProvider is mounted once at the app root. Components call `useSound` hook — they never instantiate Howler directly. This prevents the multiple-Howler-instance bug.
- **animations/ isolated from dashboard/:** Animation overlays are full-screen portals, not children of habit cards. Keeping them in their own folder clarifies that they are triggered by state, not by component hierarchy.

---

## Architectural Patterns

### Pattern 1: The Composite Check Endpoint

**What:** `POST /habits/{id}/check` is a single atomic transaction that performs all side effects and returns all needed data in one response. The frontend never needs to call a second endpoint to learn what changed.

**When to use:** Any action that has cascading RPG side effects. Calling 5 endpoints sequentially creates race conditions and partial-state UI bugs.

**Why it works:** With a single-user SQLite app there is no concurrency concern — the session is synchronous, the transaction is straightforward. The service layer executes all logic in order within one DB session.

**Transaction sequence inside `habit_service.check_habit()`:**

```python
def check_habit(db: Session, habit_id: UUID, user_id: UUID) -> CheckHabitResult:
    # All within a single db session — commit once at the end

    # 1. Toggle the HabitLog for today
    habit_log = _toggle_habit_log(db, habit_id, user_id)

    # 2. Recalculate today's DailyLog (habits_due, habits_completed, rate, tier)
    daily = _update_daily_log(db, user_id)

    # 3. Award attribute XP if completing (not un-checking)
    attr_xp = 0
    if habit_log.completed:
        attr_xp = _award_attribute_xp(db, habit, user)

    # 4. Update per-habit streak
    _update_habit_streak(db, habit_id, user_id)

    # 5. Update overall streak (only on perfect day or >=80%)
    _update_overall_streak(db, user_id, daily)

    # 6. Calculate and award daily XP to power level (recalculated on each check)
    xp_result = _recalculate_daily_xp(db, user_id, daily)

    # 7. Check for transformation unlock
    new_transformation = _check_transformation(db, user, xp_result.new_power_level)

    # 8. Award Dragon Ball if perfect day (first time today)
    dragon_ball_earned = _maybe_award_dragon_ball(db, user, daily)

    # 9. Roll capsule drop RNG
    capsule = _roll_capsule_drop(db, user_id, habit_id) if habit_log.completed else None

    # 10. Select contextual quote
    quote = _select_quote(db, trigger_context)

    # Single commit — all or nothing
    db.commit()

    return CheckHabitResult(...)
```

**Trade-offs:** The response payload is large (~15 fields), but this is intentional. The frontend gets everything it needs to orchestrate the animation sequence without additional round trips.

### Pattern 2: Animation Queue in uiStore

**What:** The frontend receives a rich `/check` response. Rather than immediately triggering all animations simultaneously, the uiStore manages a sequential animation queue. Each animation plays, completes, then the next fires.

**When to use:** Whenever a single user action can trigger multiple sequential visual events (XP popup → tier change banner → perfect day explosion → Dragon Ball earned → capsule drop).

**Why it matters:** Simultaneous full-screen overlays are unreadable. The ADHD user needs to feel each win distinctly. Sequential delivery maximizes dopamine impact per check.

```typescript
// uiStore.ts
interface UIState {
  animationQueue: AnimationEvent[];
  activeAnimation: AnimationEvent | null;
  sound_enabled: boolean;
  activeQuote: Quote | null;
  modals: { habitForm: boolean; offDay: boolean };
}

type AnimationEvent =
  | { type: 'xp_popup'; attribute: string; amount: number }
  | { type: 'tier_change'; tier: string }
  | { type: 'perfect_day' }
  | { type: 'dragon_ball_earned'; ballNumber: number }
  | { type: 'capsule_drop'; reward: Reward }
  | { type: 'transformation'; form: string }
  | { type: 'shenron' };

// Actions
enqueueFromCheckResponse: (response: CheckHabitResponse) => void;
advanceQueue: () => void; // called by each animation's onComplete
clearQueue: () => void;
```

```typescript
// In habitStore — after API call returns:
const { enqueueFromCheckResponse } = useUIStore();

const result = await api.checkHabit(habitId);
// Update stores with new data
powerStore.setFromCheckResponse(result);
habitStore.updateDailyProgress(result);
// Queue animations in priority order
enqueueFromCheckResponse(result);
```

**Trade-offs:** Slightly more complex than firing all at once. The complexity pays off in UX legibility. Each animation component calls `advanceQueue()` in its `onAnimationComplete` callback.

### Pattern 3: Sound Provider as Context, Not Per-Component

**What:** A single `SoundProvider` component mounts all Howler instances at app startup (or lazily on first interaction). Components access sounds via a `useSound` hook that reads from context, not by creating new Howler instances themselves.

**When to use:** Any app with 10+ distinct sounds that trigger across many components.

**Why it matters:** Howler.js instances persist in memory. Creating one per component mount/unmount causes audio glitches, memory leaks, and the "sound plays twice" bug common in React StrictMode.

```typescript
// context/SoundContext.tsx
const SOUND_MAP = {
  habit_check: '/assets/sounds/scouter-beep.mp3',
  perfect_day: '/assets/sounds/super-saiyan-scream.mp3',
  capsule_drop: '/assets/sounds/capsule-pop.mp3',
  dragon_ball: '/assets/sounds/radar-ping.mp3',
  transformation: '/assets/sounds/transformation.mp3',
  tier_change: '/assets/sounds/power-up-burst.mp3',
  shenron: '/assets/sounds/shenron-roar.mp3',
} as const;

type SoundId = keyof typeof SOUND_MAP;

// Single context value: play(soundId) — checks uiStore.sound_enabled internally
const play = useCallback((id: SoundId) => {
  if (!soundEnabled) return;
  howlerInstances[id].play();
}, [soundEnabled]);
```

**Audio sprite alternative:** For production optimization, bundle all sounds into a single audio sprite file. Howler.js supports sprites natively — one network request for all sounds, no per-sound load latency.

### Pattern 4: SQLAlchemy Relationship Design — Hub-and-Spoke from User

**What:** User is the hub. Nearly all tables hang off User via `user_id` FK. Habits connect downward to HabitLogs, HabitStreaks, and CapsuleDrops. The DailyLog is the daily aggregate.

**When to use:** Single-user apps where cross-user isolation is never needed. Keeping `user_id` on every table simplifies future multi-user migration if needed, while keeping queries simple now.

```python
# models/user.py
class User(Base):
    __tablename__ = "users"
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)

    # Progression stats (denormalized for fast reads — no JOIN needed for dashboard)
    power_level: Mapped[int] = mapped_column(default=0)
    str_xp: Mapped[int] = mapped_column(default=0)
    vit_xp: Mapped[int] = mapped_column(default=0)
    int_xp: Mapped[int] = mapped_column(default=0)
    ki_xp: Mapped[int] = mapped_column(default=0)
    dragon_balls_collected: Mapped[int] = mapped_column(default=0)
    current_transformation: Mapped[str] = mapped_column(default="base")

    # Relationships
    habits: Mapped[list["Habit"]] = relationship(back_populates="user",
                                                  cascade="all, delete-orphan")
    habit_logs: Mapped[list["HabitLog"]] = relationship(back_populates="user")
    daily_logs: Mapped[list["DailyLog"]] = relationship(back_populates="user")
    streak: Mapped["Streak"] = relationship(back_populates="user", uselist=False)

# models/habit.py
class Habit(Base):
    __tablename__ = "habits"
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"))
    attribute: Mapped[str]   # str | vit | int | ki
    importance: Mapped[str]  # normal | important | critical

    user: Mapped["User"] = relationship(back_populates="habits")
    logs: Mapped[list["HabitLog"]] = relationship(back_populates="habit",
                                                   cascade="all, delete-orphan")
    streak: Mapped["HabitStreak"] = relationship(back_populates="habit", uselist=False,
                                                  cascade="all, delete-orphan")

# models/habit_log.py
class HabitLog(Base):
    __tablename__ = "habit_logs"
    __table_args__ = (UniqueConstraint("habit_id", "log_date"),)

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    habit_id: Mapped[UUID] = mapped_column(ForeignKey("habits.id"))
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"))
    log_date: Mapped[date]
    completed: Mapped[bool] = mapped_column(default=False)
    attribute_xp_awarded: Mapped[int] = mapped_column(default=0)
    capsule_dropped: Mapped[bool] = mapped_column(default=False)

    habit: Mapped["Habit"] = relationship(back_populates="logs")
    user: Mapped["User"] = relationship(back_populates="habit_logs")
```

**Key design decision — denormalize attribute XP onto User:** `user.str_xp`, `user.vit_xp`, `user.int_xp`, `user.ki_xp` are running totals on the User row, not computed by summing HabitLogs on every request. The dashboard reads one row — no aggregate query. This is the correct choice for a single-user app where write frequency is low (4-6 habits/day).

---

## Data Flow

### Primary Flow: Habit Check

```
User taps habit card
    ↓
HabitCard onClick → habitStore.checkHabit(habitId)
    ↓
api.ts: POST /habits/{id}/check
    ↓
FastAPI route: validate, call habit_service.check_habit(db, habit_id, user_id)
    ↓
habit_service (single DB transaction):
  toggle HabitLog → update DailyLog → award attribute XP →
  update HabitStreak → update Streak → recalculate daily XP →
  update User.power_level + User.{attr}_xp → check transformation →
  maybe award Dragon Ball → roll capsule RNG → select quote → commit
    ↓
Response: CheckHabitResponse (15 fields — complete game state delta)
    ↓
habitStore: update todayHabits, dailyProgress (optimistic UI sync)
powerStore: update power_level, attributes, dragon_balls
rewardStore: append capsule if dropped
uiStore.enqueueFromCheckResponse(response):
  Queue: [xp_popup, tier_change?, perfect_day?, dragon_ball?, capsule?, transformation?]
    ↓
AnimationOrchestrator reads queue → plays PerfectDayAnimation
    ↓ (onComplete)
AnimationOrchestrator advances queue → plays CapsuleDropPopup
    ↓ (onComplete)
SoundProvider.play() called by each animation at its start
    ↓
Queue empty → dashboard returns to idle
```

### State Management Flow

```
Zustand Store (habitStore)
    ↓ (selector)
HabitCard component subscribes to todayHabits[habitId]
    ↓ (user action)
habitStore.checkHabit() → api call → store mutation
    ↓ (state change)
HabitCard re-renders (only this component, selector isolation)

Zustand Store (uiStore)
    ↓ (selector)
AnimationOrchestrator subscribes to animationQueue[0]
    ↓ (queue populated by habitStore after check)
PerfectDayAnimation mounts → plays → calls advanceQueue()
    ↓
AnimationOrchestrator subscribes to next item
```

### Key Data Flows

1. **Dashboard load:** `GET /power/current` + `GET /habits/today/list` → populate powerStore and habitStore → render dashboard. Two parallel requests, no dependency.
2. **Perfect Day detection:** Backend sets `is_perfect_day: true` in CheckHabitResponse. Frontend never calculates this — backend is the source of truth for all game logic.
3. **Capsule drop:** Decided by backend RNG (`random.random() < 0.25`). Backend selects the reward weighted by rarity, returns full reward object in response. Frontend only displays what it receives.
4. **Transformation unlock:** Backend computes `new_transformation` by comparing new power level against threshold constants. Returns `null` if no change, string form name if unlocked. Frontend only plays the animation when field is non-null.
5. **Sound trigger:** SoundProvider listens to uiStore `activeAnimation` — plays the matching sound when each animation becomes active. Sound and animation are decoupled (sound does not block animation and vice versa).

---

## SQLAlchemy Model Relationship Map

```
User (1)
 ├── Habits (many)          — cascade delete
 │    ├── HabitLogs (many)  — cascade delete, UniqueConstraint(habit_id, log_date)
 │    ├── HabitStreak (1)   — cascade delete, uselist=False
 │    └── CapsuleDrops (many) — FK to habit that triggered drop
 ├── DailyLogs (many)       — UniqueConstraint(user_id, log_date)
 ├── Streak (1)             — overall streak, uselist=False
 ├── PowerLevels (many)     — daily snapshots for analytics
 ├── Rewards (many)         — capsule loot pool items
 ├── CapsuleDrops (many)    — history of what dropped
 ├── Wishes (many)          — Shenron wish pool
 ├── WishLogs (many)        — history of granted wishes
 ├── OffDays (many)         — streak pause dates
 ├── Achievements (many)    — badges earned
 └── Categories (many)      — visual grouping for habits

Quotes (no user_id)         — shared static table, seeded at startup
```

**Relationship loading strategy:** Use `selectinload` for collections accessed frequently (habits → logs for today's list). Use `joined` loading only for one-to-one relationships (habit → streak). Avoid N+1 by loading `HabitStreak` eagerly when fetching today's habits list.

```python
# Correct: load habits + their streaks in 2 queries (selectinload), not N+1
habits = db.execute(
    select(Habit)
    .where(Habit.user_id == user_id, Habit.is_active == True)
    .options(selectinload(Habit.streak))
).scalars().all()
```

---

## Scaling Considerations

This is a single-user local app. Scaling is not a real concern. The table below exists to show why the current approach is appropriate, not to plan for scale.

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 1 user (current) | Sync SQLAlchemy + SQLite. No connection pooling needed. Session per request via dependency injection. |
| Future VPS (multi-user) | Switch SQLite → PostgreSQL, add auth (JWT or session), add async SQLAlchemy with asyncpg, add proper connection pool. The service layer design does not change — only the session configuration. |
| 100k+ users | This is a personal tool. Not a design goal. |

### First bottleneck if this ever scales

Analytics aggregation queries on large HabitLog tables. Solution: maintain pre-aggregated DailyLog rows (already designed this way) and add indexes on `(user_id, log_date)` columns.

---

## Anti-Patterns

### Anti-Pattern 1: Business Logic in Routes

**What people do:** Write XP calculation, capsule RNG, and streak logic directly in the FastAPI route handler function.

**Why it's wrong:** The `/check` endpoint's game logic is complex (10 sequential operations). Routes are tested via HTTP — testing business logic through HTTP is slow and brittle. If you ever need to call this logic from a background task, CLI script, or test, you cannot reuse it.

**Do this instead:** Routes call `habit_service.check_habit(db, ...)` and return the result. The service is a plain Python function — unit testable without HTTP overhead.

### Anti-Pattern 2: Triggering Multiple Sequential API Calls from the Frontend

**What people do:** After checking a habit, call `/power/current`, `/habits/today/list`, and `/analytics/summary` to refresh state.

**Why it's wrong:** Three round trips where one suffices. Creates a "loading flash" between animation frames. Introduces race conditions if the user checks a second habit before the first round trip completes.

**Do this instead:** The `POST /habits/{id}/check` response contains everything needed — the frontend updates all stores from that single response. The only time the frontend fetches independently is on initial page load.

### Anti-Pattern 3: Computing Game State on the Frontend

**What people do:** Frontend calculates whether a transformation was unlocked, whether a Dragon Ball was earned, or what XP tier applies.

**Why it's wrong:** Game constants live in two places (Python constants.py and TypeScript). They drift. The backend must be authoritative for any stored state. Frontend duplicating this logic means bugs where the frontend shows "SSJ" but the backend stored "base".

**Do this instead:** Backend computes everything, frontend only renders what it receives. Frontend contains zero XP formulas, zero transformation thresholds, zero rarity weights.

### Anti-Pattern 4: Multiple Howler Instances Per Component

**What people do:** Call `useSound('/assets/sounds/scouter-beep.mp3')` inside HabitCard directly. With 6 habit cards, 6 Howler instances are created for the same sound.

**Why it's wrong:** Memory waste, potential audio glitches in React StrictMode (double-mount creates duplicate instances), and the sound plays at different offsets if two habits are checked quickly.

**Do this instead:** SoundProvider creates one instance per unique sound ID at app mount. Components call `const { play } = useSoundContext(); play('habit_check')`. One instance, always in sync.

### Anti-Pattern 5: Animating Immediately After State Update

**What people do:** In the `onSuccess` callback of a habit check, immediately set `showPerfectDayAnimation = true` and `showCapsulePopup = true` at the same time.

**Why it's wrong:** Two full-screen overlays simultaneously is unreadable. The ADHD brain processes one dopamine hit at a time. Simultaneous = noise.

**Do this instead:** The animation queue pattern (Pattern 2). `enqueueFromCheckResponse()` builds a priority-ordered list. The AnimationOrchestrator plays one at a time, advancing on completion. Perfect day fires first (highest impact), then Dragon Ball, then capsule, then tier change.

---

## Integration Points

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| habitStore → uiStore | Direct Zustand import (no props) | habitStore calls `useUIStore.getState().enqueueFromCheckResponse()` after check |
| habitStore → powerStore | No direct coupling | powerStore reads from its own `/power/current` endpoint OR is updated directly from CheckHabitResponse via `powerStore.updateFromCheck(response)` |
| AnimationOrchestrator → SoundProvider | Context | Each animation component calls `play(soundId)` at mount time |
| routes → services | Direct function call with injected `db: Session` | No message queues, no abstraction layers — plain Python function calls |
| services → models | SQLAlchemy session | All DB access through `db.execute()`, `db.add()`, `db.commit()` |

### External Dependencies (No external services)

This app has no external service integrations. All data is local. The only "integration" is the audio and image assets bundled with the frontend.

| Asset Type | Location | Notes |
|------------|----------|-------|
| Sound files | `frontend/src/assets/sounds/` | .mp3 + .webm for cross-browser. <3s each per PRD. |
| Character images | `frontend/src/assets/characters/` | One image per transformation form (10 forms) |
| Dragon Ball images | `frontend/src/assets/dragonballs/` | 7 individual ball images (numbered) |

---

## Build Order Implications

The architecture creates a clear dependency graph that should drive phase ordering:

```
Phase 1: Database models + relationships (SQLAlchemy)
    ↓ (required before any service can run)
Phase 2: Service layer skeleton (habit_service, power_service, reward_service)
    ↓ (required before routes can call anything)
Phase 3: FastAPI routes + Pydantic schemas (thin wrappers over services)
    ↓ (required before frontend can connect)
Phase 4: Frontend store layer + api.ts (Zustand stores, typed API client)
    ↓ (required before components can display real data)
Phase 5: Core dashboard UI (SaiyanAvatar, AttributeBars, DailyAuraBar, HabitCard)
    ↓ (required before animations have a base to overlay)
Phase 6: Animation + audio layer (SoundProvider, PerfectDayAnimation, CapsuleDropPopup, queue)
    ↓ (builds on top of working dashboard)
Phase 7: Analytics page + settings page
    ↓ (reads data that exists from phases 1-6)
Phase 8: Polish (transformation visuals, quote seeding, Shenron animation)
```

**Why this order:**
- The `POST /habits/{id}/check` endpoint (Phase 3) is the most complex integration point. Building models and services first means the endpoint can be tested via curl/Swagger before any frontend exists.
- The animation queue (Phase 6) requires a working dashboard (Phase 5) to overlay. Building animations without a real data-connected UI makes integration testing impossible.
- Analytics (Phase 7) is read-only — it depends on data being generated by Phase 1-6 mechanics. No data = no meaningful analytics to test.

---

## Sources

- [FastAPI Service Layer Architecture 2025](https://medium.com/@abhinav.dobhal/building-production-ready-fastapi-applications-with-service-layer-architecture-in-2025-f3af8a6ac563) — MEDIUM confidence (WebSearch, aligns with official FastAPI patterns)
- [FastAPI Best Practices — zhanymkanov](https://github.com/zhanymkanov/fastapi-best-practices) — HIGH confidence (widely referenced, official community resource)
- [SQLAlchemy 2.0 Basic Relationship Patterns](https://docs.sqlalchemy.org/en/20/orm/basic_relationships.html) — HIGH confidence (official docs)
- [SQLAlchemy 2.0 Relationship Loading](https://docs.sqlalchemy.org/en/20/orm/queryguide/relationships.html) — HIGH confidence (official docs)
- [Zustand GitHub — Slice Pattern](https://github.com/pmndrs/zustand) — HIGH confidence (official repo)
- [use-sound — Josh W. Comeau](https://www.joshwcomeau.com/react/announcing-use-sound-react-hook/) — HIGH confidence (library author)
- [Framer Motion / Motion docs](https://motion.dev/docs/react-motion-component) — HIGH confidence (official docs)
- [FastAPI preferred commit/rollback patterns](https://github.com/fastapi/fastapi/discussions/8949) — MEDIUM confidence (community discussion, no official answer)

---
*Architecture research for: React + FastAPI gamified habit tracker (Saiyan Tracker v3)*
*Researched: 2026-03-03*
