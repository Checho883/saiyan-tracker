---
phase: 01-database-and-model-integrity
plan: 01
subsystem: database
tags: [sqlalchemy, sqlite, fastapi, orm, models, constants]

# Dependency graph
requires: []
provides:
  - "15 SQLAlchemy 2.0 models with correct columns, relationships, and constraints"
  - "Game constants (XP, tiers, transformations, streaks, capsules, attributes) as single source of truth"
  - "Database engine with SQLite FK enforcement via PRAGMA"
  - "FastAPI app skeleton with lifespan table creation"
  - "DeclarativeBase with reusable annotated types (uuid_pk, str_10, str_20, str_100)"
affects: [01-02-PLAN, phase-02-game-logic-services, phase-03-api-routes]

# Tech tracking
tech-stack:
  added: [sqlalchemy>=2.0, fastapi, uvicorn, pytest]
  patterns: [DeclarativeBase, Mapped/mapped_column, String(10) date columns, event listener FK pragma, one-file-per-model]

key-files:
  created:
    - backend/app/core/constants.py
    - backend/app/core/config.py
    - backend/app/database/base.py
    - backend/app/database/session.py
    - backend/app/main.py
    - backend/app/models/__init__.py
    - backend/app/models/user.py
    - backend/app/models/category.py
    - backend/app/models/habit.py
    - backend/app/models/habit_log.py
    - backend/app/models/habit_streak.py
    - backend/app/models/daily_log.py
    - backend/app/models/streak.py
    - backend/app/models/power_level.py
    - backend/app/models/reward.py
    - backend/app/models/capsule_drop.py
    - backend/app/models/wish.py
    - backend/app/models/wish_log.py
    - backend/app/models/off_day.py
    - backend/app/models/achievement.py
    - backend/app/models/quote.py
    - backend/requirements.txt
  modified: []

key-decisions:
  - "Used synchronous SQLAlchemy (not async) — single-user SQLite app, no benefit from async complexity"
  - "Achievement.metadata_json Python attr maps to 'metadata' column name to avoid SQLAlchemy Base.metadata conflict"
  - "Wish model uses cascade='all, delete-orphan' on wish_logs relationship for ORM-level cascade alongside DB ondelete=CASCADE"

patterns-established:
  - "UUID PKs: Mapped[uuid.UUID] with mapped_column(Uuid, primary_key=True, default=uuid.uuid4)"
  - "Date columns: String(10) for YYYY-MM-DD (log_date, off_date, start_date, end_date, last_completed_date, last_active_date)"
  - "Timestamp columns: Mapped[datetime] with default=datetime.utcnow for metadata (created_at, dropped_at, unlocked_at, granted_at)"
  - "String references in relationship() to avoid circular imports"
  - "FK pragma enforcement via @event.listens_for(engine, 'connect')"

requirements-completed: [DB-01, DB-02, DB-03, DB-04, DB-05, DB-06, DB-08]

# Metrics
duration: 6min
completed: 2026-03-04
---

# Phase 1 Plan 1: Database Infrastructure and Models Summary

**15 SQLAlchemy 2.0 models with UUID PKs, String(10) date columns, FK pragma enforcement, and complete game constants covering XP/tiers/transformations/streaks/capsules/attributes**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-04T12:01:44Z
- **Completed:** 2026-03-04T12:07:40Z
- **Tasks:** 2
- **Files modified:** 22

## Accomplishments
- All 15 database tables create from SQLAlchemy models without errors via Base.metadata.create_all()
- constants.py contains all game values exactly matching PRD (10 transformations, 3 importance levels, 4 completion tiers, capsule/streak/attribute constants)
- UniqueConstraint on HabitLog(habit_id, log_date) and DailyLog(user_id, log_date) enforced at DB level
- Category FK on Habit uses ondelete="SET NULL", WishLog FK on Wish uses ondelete="CASCADE"

## Task Commits

Each task was committed atomically:

1. **Task 1: Create database infrastructure, config, and constants** - `885f0ef` (feat)
2. **Task 2: Create all 15 SQLAlchemy models** - `995a93f` (feat)

## Files Created/Modified
- `backend/requirements.txt` - Python dependencies (sqlalchemy, fastapi, uvicorn, pytest)
- `backend/app/__init__.py` - Empty package init
- `backend/app/core/__init__.py` - Empty package init
- `backend/app/core/config.py` - Settings with DATABASE_URL and APP_TITLE
- `backend/app/core/constants.py` - All game constants as single source of truth
- `backend/app/database/__init__.py` - Empty package init
- `backend/app/database/base.py` - DeclarativeBase with uuid_pk, str_10, str_20, str_100 annotated types
- `backend/app/database/session.py` - Engine with FK pragma, SessionLocal, get_db dependency
- `backend/app/main.py` - FastAPI app with lifespan creating tables (seed commented out for Plan 01-02)
- `backend/app/models/__init__.py` - All 15 model imports for create_all discovery
- `backend/app/models/user.py` - User with cumulative XP, power_level, transformation, settings
- `backend/app/models/category.py` - Category with name, color_code, icon (no multiplier)
- `backend/app/models/habit.py` - Habit with importance, attribute, no base_points
- `backend/app/models/habit_log.py` - HabitLog with UniqueConstraint, attribute_xp_awarded, capsule_dropped
- `backend/app/models/habit_streak.py` - Per-habit streak tracking
- `backend/app/models/daily_log.py` - DailyLog with UniqueConstraint, completion tier, zenkai, dragon ball
- `backend/app/models/streak.py` - Overall user streak
- `backend/app/models/power_level.py` - Daily power level snapshot
- `backend/app/models/reward.py` - Capsule loot items with rarity
- `backend/app/models/capsule_drop.py` - Capsule drop history
- `backend/app/models/wish.py` - Shenron wishes
- `backend/app/models/wish_log.py` - Wish grant history with CASCADE delete
- `backend/app/models/off_day.py` - Off day with reason
- `backend/app/models/achievement.py` - Achievement with metadata_json mapped to "metadata" column
- `backend/app/models/quote.py` - Global quote data (no user_id)

## Decisions Made
- Used synchronous SQLAlchemy over async -- single-user SQLite app gets no benefit from async complexity
- Achievement model uses `metadata_json` as the Python attribute name mapping to a `metadata` column name to avoid conflict with SQLAlchemy's `Base.metadata`
- Wish model sets `cascade="all, delete-orphan"` on its wish_logs relationship to complement the DB-level `ondelete="CASCADE"` on the FK

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Python 3.14 installation lacked pip; resolved by bootstrapping pip via `ensurepip` and creating a `.venv` virtual environment

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 15 models ready for seed data (Plan 01-02: quotes, default user, categories, rewards, wishes)
- All models ready for test infrastructure (Plan 01-02: pytest fixtures with in-memory SQLite)
- main.py has seed_all import commented out, ready to uncomment when seed.py is created

## Self-Check: PASSED

- All 25 created files verified present on disk
- Commit 885f0ef (Task 1) verified in git log
- Commit 995a93f (Task 2) verified in git log

---
*Phase: 01-database-and-model-integrity*
*Completed: 2026-03-04*
