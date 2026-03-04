# Phase 1: Database and Model Integrity - Research

**Researched:** 2026-03-04
**Domain:** SQLAlchemy 2.0 ORM models, SQLite, FastAPI database setup
**Confidence:** HIGH

## Summary

This phase establishes the data contract for the entire Saiyan Tracker application: 15 SQLAlchemy 2.0 models with correct relationships, constraints, and indexes; game constants as a single source of truth; 100+ seeded quotes; and a date strategy using client-supplied YYYY-MM-DD strings. The technology choices are well-established (SQLAlchemy 2.0, SQLite, FastAPI) with extensive documentation and mature patterns.

SQLAlchemy 2.0's `DeclarativeBase` / `Mapped` / `mapped_column` style is the standard for new projects. The generic `Uuid` type (not the PostgreSQL-specific `UUID`) handles cross-backend UUID storage, rendering as `CHAR(32)` on SQLite. SQLite requires explicit `PRAGMA foreign_keys = ON` to enforce foreign key constraints -- this must be configured via an event listener on every connection or SQLAlchemy will silently ignore FK violations.

**Primary recommendation:** Use synchronous SQLAlchemy with `create_all()` for initial table creation (no Alembic yet -- greenfield, single developer). Store all date-logic columns as `String` type with YYYY-MM-DD format. Use Python `uuid4` for UUID generation (client-side, not database-generated). Enable SQLite foreign keys via event listener. One model file per table for clarity given 15 models.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Mix of real Dragon Ball Z/Super quotes and original in-character quotes to fill trigger-event gaps
- Real iconic quotes where they naturally fit (transformations, victories, encouragement); original quotes for app-specific triggers like `zenkai`, `welcome_back`, `habit_complete`
- Heavy Goku & Vegeta distribution (~30% Goku, ~25% Vegeta, ~15% Piccolo, ~10% each Gohan/Whis/Beerus)
- Focus on iconic arcs: Namek/Frieza, Cell Games, Tournament of Power -- the most memorable transformation moments
- Vegeta roast quotes go full savage at severity level 3+ -- pride-destroying, the kind that makes you open the app out of spite. No holding back
- Auto-create default user silently on first DB init (display_name="Saiyan", sound_enabled=true, theme="dark") -- no signup flow
- Seed the 6 default categories from PRD: Health, Mind, Body, Family, Skills, Discipline (with colors and emoji icons)
- Seed ~10 default capsule rewards across rarities (Common: "15 min TikTok", "Eat a snack"; Rare: "30 min gaming"; Epic: "Order takeout", etc.)
- Seed 3-5 example Shenron wishes (e.g., "Buy a new game", "Full day off", "Nice dinner out") -- user edits to personal wishes later
- No sample habits -- habits are personal. Dashboard handles empty state
- Category is optional on habits (category_id nullable) -- keeps habit creation simple
- Archiving a habit (is_active=false) preserves all historical logs, streaks, and XP -- data integrity for analytics
- Deleting a category sets category_id to NULL on its habits (SET NULL cascade) -- no data loss
- Rewards use soft delete (is_active=false) to preserve capsule drop history references
- Wishes can be hard-deleted; wish_logs reference them via foreign key
- PRD defines exact schemas column-by-column -- follow them precisely. No creative reinterpretation of the data model
- The app is single-user (Sergio), single-tenant -- no auth needed, but user_id FK pattern stays for clean data modeling

### Claude's Discretion
- SQLAlchemy model organization (one file per model vs grouped)
- Migration strategy (Alembic vs create_all for initial setup)
- UUID implementation (Python uuid4 vs database-generated)
- Index strategy beyond the required unique constraints
- Quote text content selection (specific quote wording within the agreed style/tone guidelines)
- Default category colors and emoji choices

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DB-01 | SQLAlchemy 2.0 models for all 15 tables (Users, Categories, Habits, HabitLogs, HabitStreaks, DailyLogs, Streaks, PowerLevels, Rewards, CapsuleDrops, Wishes, WishLogs, OffDays, Achievements, Quotes) | DeclarativeBase + Mapped + mapped_column pattern; one file per model; generic Uuid type for PKs; SQLite foreign key pragma |
| DB-02 | User model stores cumulative attribute XP (str_xp, vit_xp, int_xp, ki_xp), power_level, current_transformation, dragon_balls_collected, wishes_granted, sound_enabled | Mapped[int] for XP/level fields with default=0; Mapped[str] for transformation with default="base"; Mapped[bool] for sound_enabled with default=True |
| DB-03 | Habit model has importance (normal/important/critical) and attribute (str/vit/int/ki) fields -- no base_points | Mapped[str] with String(10) for importance, String(3) for attribute; CheckConstraint for valid values |
| DB-04 | HabitLog stores attribute_xp_awarded and capsule_dropped per completion | Mapped[int] for attribute_xp_awarded default=0; Mapped[bool] for capsule_dropped default=False; UniqueConstraint on (habit_id, log_date) |
| DB-05 | DailyLog stores is_perfect_day, completion_tier, xp_earned, streak_multiplier, zenkai_bonus_applied, dragon_ball_earned | All fields mapped per PRD schema; UniqueConstraint on (user_id, log_date) |
| DB-06 | All date-based logic uses client-supplied local_date (not server datetime) to prevent timezone/midnight bugs | Store date columns as String type with YYYY-MM-DD format; no DATE or DATETIME types for log_date/off_date fields; created_at/completed_at can remain TIMESTAMP for metadata |
| DB-07 | Seed 100+ quotes with character, source_saga, trigger_event, transformation_level, and severity fields | Quote model with proper fields; seed data function callable from DB init; quotes distributed per locked character percentages |
| DB-08 | Category model is visual-only (name, color, icon) -- no point_multiplier | Simple model with String columns; no multiplier fields; FK from habits with ondelete="SET NULL" |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| SQLAlchemy | 2.0+ | ORM, model definitions, relationships, constraints | Industry standard Python ORM; 2.0 style with type annotations |
| Python | 3.14 | Runtime | PRD-specified |
| FastAPI | latest | Web framework (minimal use this phase -- just DB init) | PRD-specified |
| SQLite | 3.x (bundled) | Database | PRD-specified; no install needed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| uuid (stdlib) | builtin | UUID generation for primary keys | Every model PK |
| aiosqlite | latest | Async SQLite driver for SQLAlchemy | If using async engine (see Architecture) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Alembic migrations | `Base.metadata.create_all()` | create_all is simpler for greenfield; add Alembic later when schema changes are needed |
| Async SQLAlchemy | Sync SQLAlchemy | Sync is simpler, single-user app with SQLite; async adds complexity without benefit for local SQLite |
| PostgreSQL UUID type | Generic `Uuid` type | Generic type works across backends; stores as CHAR(32) in SQLite |

**Installation:**
```bash
pip install sqlalchemy fastapi uvicorn
```

## Architecture Patterns

### Recommended Project Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI app, startup events
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py              # Database URL, app settings
│   │   └── constants.py           # XP values, tiers, thresholds (single source of truth)
│   ├── database/
│   │   ├── __init__.py
│   │   ├── base.py                # DeclarativeBase, common mixins
│   │   ├── session.py             # Engine, SessionLocal, get_db dependency
│   │   └── seed.py                # All seed data (user, categories, rewards, wishes, quotes)
│   ├── models/
│   │   ├── __init__.py            # Import all models (required for create_all)
│   │   ├── user.py
│   │   ├── category.py
│   │   ├── habit.py
│   │   ├── habit_log.py
│   │   ├── habit_streak.py
│   │   ├── daily_log.py
│   │   ├── streak.py
│   │   ├── power_level.py
│   │   ├── reward.py
│   │   ├── capsule_drop.py
│   │   ├── wish.py
│   │   ├── wish_log.py
│   │   ├── off_day.py
│   │   ├── achievement.py
│   │   └── quote.py
│   └── schemas/                    # Pydantic schemas (minimal this phase)
│       └── __init__.py
└── requirements.txt
```

### Pattern 1: DeclarativeBase with Typed Columns
**What:** SQLAlchemy 2.0 declarative mapping using `Mapped[]` type annotations
**When to use:** Every model definition
**Example:**
```python
# Source: https://docs.sqlalchemy.org/en/20/orm/quickstart.html
import uuid
from typing import Optional
from sqlalchemy import String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    username: Mapped[str] = mapped_column(String(100), default="default-user")
    display_name: Mapped[str] = mapped_column(String(100), default="Saiyan")
    power_level: Mapped[int] = mapped_column(default=0)
    current_transformation: Mapped[str] = mapped_column(String(20), default="base")
    sound_enabled: Mapped[bool] = mapped_column(default=True)

    # Relationships
    habits: Mapped[list["Habit"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    categories: Mapped[list["Category"]] = relationship(back_populates="user", cascade="all, delete-orphan")
```

### Pattern 2: UUID Primary Keys with Generic Uuid Type
**What:** Using `sqlalchemy.Uuid` (generic, not PostgreSQL-specific) for cross-backend UUID support
**When to use:** Every model primary key
**Example:**
```python
# Source: https://github.com/sqlalchemy/sqlalchemy/discussions/12792
import uuid
from typing import Annotated
from sqlalchemy import Uuid
from sqlalchemy.orm import mapped_column, Mapped

# Reusable annotated type for UUID PKs
uuid_pk = Annotated[uuid.UUID, mapped_column(Uuid, primary_key=True, default=uuid.uuid4)]

class SomeModel(Base):
    __tablename__ = "some_table"
    id: Mapped[uuid_pk]  # Clean, reusable UUID PK
```

### Pattern 3: Composite Unique Constraints
**What:** Enforcing uniqueness on (habit_id, log_date) and (user_id, log_date)
**When to use:** HabitLog, DailyLog tables
**Example:**
```python
# Source: https://docs.sqlalchemy.org/en/20/core/constraints.html
class HabitLog(Base):
    __tablename__ = "habit_logs"
    __table_args__ = (
        UniqueConstraint("habit_id", "log_date", name="uq_habit_log_date"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    habit_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("habits.id"))
    log_date: Mapped[str] = mapped_column(String(10))  # "YYYY-MM-DD"
```

### Pattern 4: Date Columns as Strings
**What:** Storing date-logic columns as YYYY-MM-DD strings instead of DATE/DATETIME types
**When to use:** log_date, off_date, start_date, end_date, last_completed_date, last_active_date
**Why:** Prevents timezone bugs; client sends local date as string, server stores it as-is
**Example:**
```python
# Date-logic columns: String for YYYY-MM-DD
log_date: Mapped[str] = mapped_column(String(10))  # "2026-03-04"

# Metadata timestamps: still use DateTime (server-generated, not user-facing logic)
from datetime import datetime
created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
```

### Pattern 5: SQLite Foreign Key Enforcement
**What:** SQLite does not enforce foreign keys by default; must enable via PRAGMA
**When to use:** Database session/engine setup
**Example:**
```python
# Source: https://docs.sqlalchemy.org/en/20/dialects/sqlite.html
from sqlalchemy import event, create_engine

engine = create_engine("sqlite:///saiyan_tracker.db")

@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()
```

### Pattern 6: SET NULL Cascade for Category Deletion
**What:** When a category is deleted, habits referencing it get category_id set to NULL
**When to use:** Habit.category_id FK
**Example:**
```python
# Source: https://docs.sqlalchemy.org/en/20/orm/cascades.html
class Habit(Base):
    __tablename__ = "habits"
    category_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("categories.id", ondelete="SET NULL"),
        nullable=True
    )
```

### Anti-Patterns to Avoid
- **Using PostgreSQL UUID type on SQLite:** Import `sqlalchemy.Uuid` (generic), NOT `sqlalchemy.dialects.postgresql.UUID`
- **Using DATE/DATETIME for log_date columns:** Store as String(10) to avoid timezone conversion issues
- **Forgetting PRAGMA foreign_keys=ON:** SQLite silently ignores FK violations without it
- **Circular imports in models:** Use `__init__.py` to import all models in dependency order; use string references in `relationship()` and `ForeignKey()`
- **Using create_engine without foreign key pragma:** Every SQLite connection must have PRAGMA set

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| UUID generation | Custom UUID logic | `uuid.uuid4` (stdlib) + `sqlalchemy.Uuid` type | Handles cross-backend serialization automatically |
| FK enforcement on SQLite | Manual constraint checks | SQLAlchemy event listener for `PRAGMA foreign_keys=ON` | Built-in, reliable, applies to every connection |
| Composite unique constraints | Application-level duplicate checks | `UniqueConstraint` in `__table_args__` | Database enforces atomically; no race conditions |
| JSON column for custom_days | Custom serialization | `sqlalchemy.JSON` type (SQLite JSON1 extension) | SQLAlchemy handles serialization; SQLite 3.9+ has JSON1 |
| Seed data management | Ad-hoc INSERT scripts | Dedicated `seed.py` with idempotent functions | Rerunnable without duplicates; testable |

**Key insight:** SQLAlchemy 2.0's type system handles almost all cross-backend differences. The main gotcha is SQLite's FK enforcement, which requires one event listener.

## Common Pitfalls

### Pitfall 1: SQLite Foreign Keys Silently Disabled
**What goes wrong:** Foreign key constraints are defined in models but never enforced at runtime. Invalid data enters the database.
**Why it happens:** SQLite disables FK enforcement by default for backward compatibility.
**How to avoid:** Add `PRAGMA foreign_keys=ON` event listener on the engine immediately after creation. Test by inserting a child row with a nonexistent parent FK -- it must raise IntegrityError.
**Warning signs:** No errors when inserting rows with invalid foreign keys during testing.

### Pitfall 2: Circular Model Imports
**What goes wrong:** Python ImportError when models reference each other (e.g., User <-> Habit).
**Why it happens:** Two model files importing from each other at module level.
**How to avoid:** Use string references in `relationship()` (e.g., `relationship("Habit")` not `relationship(Habit)`). Use string table names in `ForeignKey()` (e.g., `ForeignKey("users.id")`). Import all models in `models/__init__.py` to ensure they are registered with the mapper.
**Warning signs:** ImportError on startup; "mapper not initialized" errors.

### Pitfall 3: DATE Type Timezone Drift
**What goes wrong:** A habit checked at 11:55 PM local time gets stored as the next day's date because the server converts to UTC.
**Why it happens:** Using `DATE` or `DATETIME` column types with server-side `datetime.now()` or `datetime.utcnow()`.
**How to avoid:** Store date-logic columns as `String(10)` with YYYY-MM-DD format. Client sends the local date; server stores it as-is. Only use DATETIME for metadata timestamps (created_at, completed_at) where the exact moment matters, not the logical day.
**Warning signs:** Tests pass in one timezone but fail in another.

### Pitfall 4: Missing Model Imports for create_all
**What goes wrong:** `Base.metadata.create_all(engine)` creates only some tables.
**Why it happens:** Models not imported before `create_all()` is called. SQLAlchemy only knows about models that have been imported and registered with the Base.
**How to avoid:** In `models/__init__.py`, explicitly import every model class. Import `models` package before calling `create_all()`.
**Warning signs:** Missing tables in database; "no such table" errors at runtime.

### Pitfall 5: UUID String Format Mismatch
**What goes wrong:** Queries fail or return no results because UUID is stored as hex but queried with dashes (or vice versa).
**Why it happens:** SQLAlchemy's generic `Uuid` type stores as CHAR(32) hex on SQLite, but Python's `str(uuid)` includes dashes.
**How to avoid:** Always use Python `uuid.UUID` objects when querying, not strings. SQLAlchemy's `Uuid` type handles the conversion. If accepting UUIDs from API input, parse strings with `uuid.UUID(input_string)` first.
**Warning signs:** Queries returning empty results despite data existing.

### Pitfall 6: Seed Data Duplication on Re-run
**What goes wrong:** Running seed twice creates duplicate users, categories, quotes.
**Why it happens:** Seed function does INSERT without checking existing data.
**How to avoid:** Make seed functions idempotent: check for existing records before inserting (e.g., query for default user first; use `get_or_create` pattern for categories). For quotes, check count before bulk insert.
**Warning signs:** Multiple "Saiyan" users; duplicate categories; 200+ quotes after two runs.

## Code Examples

Verified patterns from official sources:

### Base Model with Common Mixin
```python
# backend/app/database/base.py
import uuid
from datetime import datetime
from typing import Annotated

from sqlalchemy import Uuid, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

# Reusable annotated types
uuid_pk = Annotated[uuid.UUID, mapped_column(Uuid, primary_key=True, default=uuid.uuid4)]
str_10 = Annotated[str, mapped_column(String(10))]
str_20 = Annotated[str, mapped_column(String(20))]
str_100 = Annotated[str, mapped_column(String(100))]

class Base(DeclarativeBase):
    pass
```

### Database Session Setup with FK Pragma
```python
# backend/app/database/session.py
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

engine = create_engine(settings.DATABASE_URL, echo=False)

# CRITICAL: Enable SQLite foreign key enforcement
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### Constants File (Single Source of Truth)
```python
# backend/app/core/constants.py

# --- Per-Habit Attribute XP ---
IMPORTANCE_XP = {
    "normal": 15,
    "important": 22,
    "critical": 30,
}

# --- Kaio-ken Completion Tiers ---
COMPLETION_TIERS = [
    {"min_rate": 1.0,  "multiplier": 2.0, "name": "kaio_x20", "label": "Kaio-ken x20"},
    {"min_rate": 0.8,  "multiplier": 1.5, "name": "kaio_x10", "label": "Kaio-ken x10"},
    {"min_rate": 0.5,  "multiplier": 1.2, "name": "kaio_x3",  "label": "Kaio-ken x3"},
    {"min_rate": 0.0,  "multiplier": 1.0, "name": "base",     "label": "Base"},
]

# --- Daily XP ---
BASE_DAILY_XP = 100

# --- Streak ---
STREAK_BONUS_PER_DAY = 0.05
STREAK_BONUS_CAP = 1.0
STREAK_MIN_COMPLETION = 0.8  # 80% needed for overall streak
ZENKAI_BONUS = 0.5  # +50% on comeback

# --- Capsule Drop ---
CAPSULE_DROP_CHANCE = 0.25
CAPSULE_RARITY_WEIGHTS = {
    "common": 0.60,
    "rare": 0.30,
    "epic": 0.10,
}

# --- Transformations (10 thresholds) ---
TRANSFORMATIONS = [
    {"key": "base",    "name": "Base Saiyan",             "threshold": 0},
    {"key": "ssj",     "name": "Super Saiyan",            "threshold": 1_000},
    {"key": "ssj2",    "name": "Super Saiyan 2",          "threshold": 3_000},
    {"key": "ssj3",    "name": "Super Saiyan 3",          "threshold": 7_500},
    {"key": "ssg",     "name": "Super Saiyan God",        "threshold": 15_000},
    {"key": "ssb",     "name": "Super Saiyan Blue",       "threshold": 30_000},
    {"key": "ui_sign", "name": "Ultra Instinct Sign",     "threshold": 50_000},
    {"key": "mui",     "name": "Mastered Ultra Instinct", "threshold": 75_000},
    {"key": "ue",      "name": "Ultra Ego",               "threshold": 110_000},
    {"key": "beast",   "name": "Beast Form",              "threshold": 150_000},
]

# --- Attribute Leveling ---
ATTRIBUTE_LEVEL_FORMULA_EXPONENT = 1.5
ATTRIBUTE_LEVEL_BASE_XP = 100  # xp_needed = 100 * level^1.5

ATTRIBUTE_TITLES = {
    "str": {5: "Fighter", 10: "Warrior", 25: "Elite Warrior", 50: "Super Elite", 100: "Legendary"},
    "vit": {5: "Survivor", 10: "Guardian", 25: "Defender", 50: "Immortal", 100: "Eternal"},
    "int": {5: "Student", 10: "Tactician", 25: "Strategist", 50: "Mastermind", 100: "Supreme"},
    "ki":  {5: "Beginner", 10: "Apprentice", 25: "Ki Adept", 50: "Ki Master", 100: "Ultra"},
}

# --- Dragon Balls ---
DRAGON_BALLS_REQUIRED = 7

# --- Streak Milestones ---
STREAK_MILESTONES = [3, 7, 21, 30, 60, 90, 365]

# --- Valid Enums ---
VALID_IMPORTANCES = ["normal", "important", "critical"]
VALID_ATTRIBUTES = ["str", "vit", "int", "ki"]
VALID_FREQUENCIES = ["daily", "weekdays", "custom"]
VALID_TRANSFORMATIONS = [t["key"] for t in TRANSFORMATIONS]
VALID_OFF_DAY_REASONS = ["sick", "vacation", "rest", "injury", "other"]
VALID_RARITIES = ["common", "rare", "epic"]
VALID_CHARACTERS = ["goku", "vegeta", "gohan", "piccolo", "whis", "beerus"]
VALID_TRIGGER_EVENTS = ["habit_complete", "perfect_day", "streak_milestone", "transformation", "zenkai", "roast", "welcome_back"]
VALID_SEVERITIES = ["mild", "medium", "savage"]
VALID_THEMES = ["dark", "light"]
VALID_COMPLETION_TIERS = ["base", "kaio_x3", "kaio_x10", "kaio_x20"]
```

### Model with Relationships and Constraints
```python
# Example: HabitLog model showing all key patterns
import uuid
from typing import Optional
from datetime import datetime

from sqlalchemy import String, ForeignKey, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

class HabitLog(Base):
    __tablename__ = "habit_logs"
    __table_args__ = (
        UniqueConstraint("habit_id", "log_date", name="uq_habit_log_date"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    habit_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("habits.id"))
    log_date: Mapped[str] = mapped_column(String(10))  # "YYYY-MM-DD" from client
    completed: Mapped[bool] = mapped_column(default=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    attribute_xp_awarded: Mapped[int] = mapped_column(default=0)
    capsule_dropped: Mapped[bool] = mapped_column(default=False)
    notes: Mapped[Optional[str]] = mapped_column(nullable=True)

    # Relationships
    user: Mapped["User"] = relationship(back_populates="habit_logs")
    habit: Mapped["Habit"] = relationship(back_populates="logs")
```

### Idempotent Seed Function Pattern
```python
# backend/app/database/seed.py
import uuid
from sqlalchemy.orm import Session

def seed_default_user(db: Session) -> None:
    """Create default user if none exists."""
    from app.models.user import User
    existing = db.query(User).filter(User.username == "default-user").first()
    if existing:
        return
    user = User(
        id=uuid.uuid4(),
        username="default-user",
        display_name="Saiyan",
        sound_enabled=True,
        theme="dark",
    )
    db.add(user)
    db.commit()

def seed_all(db: Session) -> None:
    """Run all seed functions in order."""
    seed_default_user(db)
    seed_default_categories(db)
    seed_default_rewards(db)
    seed_default_wishes(db)
    seed_quotes(db)
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `declarative_base()` function | `DeclarativeBase` class | SQLAlchemy 2.0 (Jan 2023) | Better type checking, IDE support |
| `Column()` with no types | `Mapped[type]` + `mapped_column()` | SQLAlchemy 2.0 | Type-safe columns, mypy/pyright compatible |
| `relationship(backref=...)` | `relationship(back_populates=...)` | SQLAlchemy 2.0 (recommended) | Explicit, both sides visible, better IDE support |
| PostgreSQL `UUID` type | Generic `Uuid` type | SQLAlchemy 2.0 | Works across all backends |
| `NullPool` for SQLite | `QueuePool` for file-based SQLite | SQLAlchemy 2.0 | Better connection reuse |

**Deprecated/outdated:**
- `declarative_base()` function: Replaced by `DeclarativeBase` class
- `Column()` without `Mapped`: Still works but loses type safety
- `backref` parameter: Still works but `back_populates` is preferred

## Open Questions

1. **Async vs Sync SQLAlchemy**
   - What we know: Async works with `aiosqlite` driver but adds complexity. SQLite I/O is local disk, not network. Single-user app.
   - What's unclear: Whether FastAPI's async endpoints will be used in later phases.
   - Recommendation: Use synchronous SQLAlchemy for this phase. The single-user, local-SQLite use case does not benefit from async. Can migrate to async later if needed, but the model definitions are the same either way.

2. **JSON Column for custom_days and metadata**
   - What we know: SQLAlchemy's `JSON` type works on SQLite 3.9+ with JSON1 extension. JSON1 is included by default in most SQLite builds since 2015.
   - What's unclear: Whether Python 3.14 bundles a SQLite version with JSON1 enabled.
   - Recommendation: Use `JSON` type. If JSON1 is missing, the column will store as TEXT which still works for basic read/write (just no JSON query operators). Test during implementation.

3. **Wish Deletion Strategy**
   - What we know: User decided wishes can be hard-deleted. WishLog has FK to wishes.
   - What's unclear: Whether to use CASCADE delete (deletes wish_logs when wish is deleted) or restrict (prevent deletion if wish_logs exist).
   - Recommendation: Use `ondelete="CASCADE"` on WishLog.wish_id FK -- if the user deletes a wish, the grant history for that specific wish is also deleted. This matches the user's intent of "wishes can be hard-deleted."

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | pytest + pytest-asyncio (if needed) |
| Config file | None -- Wave 0 must create `pytest.ini` or `pyproject.toml` |
| Quick run command | `cd backend && python -m pytest tests/ -x -q` |
| Full suite command | `cd backend && python -m pytest tests/ -v` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DB-01 | All 15 tables created from models without errors | integration | `pytest tests/test_models.py::test_create_all_tables -x` | Wave 0 |
| DB-02 | User model has all XP/power/transformation fields with correct defaults | unit | `pytest tests/test_models.py::test_user_defaults -x` | Wave 0 |
| DB-03 | Habit model has importance/attribute fields, no base_points | unit | `pytest tests/test_models.py::test_habit_fields -x` | Wave 0 |
| DB-04 | HabitLog stores attribute_xp_awarded and capsule_dropped | unit | `pytest tests/test_models.py::test_habit_log_fields -x` | Wave 0 |
| DB-05 | DailyLog stores all required fields | unit | `pytest tests/test_models.py::test_daily_log_fields -x` | Wave 0 |
| DB-06 | Date columns store YYYY-MM-DD strings, not datetime | integration | `pytest tests/test_models.py::test_date_columns_are_strings -x` | Wave 0 |
| DB-04/05 | UniqueConstraints reject duplicates on (habit_id, log_date) and (user_id, log_date) | integration | `pytest tests/test_constraints.py::test_unique_constraints -x` | Wave 0 |
| DB-07 | Seed quotes populates 100+ rows with all required fields | integration | `pytest tests/test_seed.py::test_seed_quotes -x` | Wave 0 |
| DB-08 | Category model has name/color/icon, no multiplier | unit | `pytest tests/test_models.py::test_category_fields -x` | Wave 0 |
| DB-08 | Category deletion sets habit category_id to NULL | integration | `pytest tests/test_constraints.py::test_category_set_null -x` | Wave 0 |
| -- | FK enforcement rejects invalid parent references | integration | `pytest tests/test_constraints.py::test_fk_enforcement -x` | Wave 0 |
| -- | Constants importable with correct values | unit | `pytest tests/test_constants.py -x` | Wave 0 |
| -- | Seed data idempotent (safe to run twice) | integration | `pytest tests/test_seed.py::test_seed_idempotent -x` | Wave 0 |

### Sampling Rate
- **Per task commit:** `cd backend && python -m pytest tests/ -x -q`
- **Per wave merge:** `cd backend && python -m pytest tests/ -v`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `backend/tests/conftest.py` -- in-memory SQLite engine, session fixture, FK pragma, table creation
- [ ] `backend/tests/test_models.py` -- covers DB-01 through DB-06, DB-08
- [ ] `backend/tests/test_constraints.py` -- covers unique constraints, FK enforcement, SET NULL cascade
- [ ] `backend/tests/test_seed.py` -- covers DB-07 (quotes), seed idempotency
- [ ] `backend/tests/test_constants.py` -- covers constants importability
- [ ] `backend/pyproject.toml` or `backend/pytest.ini` -- pytest configuration
- [ ] Framework install: `pip install pytest` -- not yet in requirements.txt

## Sources

### Primary (HIGH confidence)
- [SQLAlchemy 2.0 ORM Quickstart](https://docs.sqlalchemy.org/en/20/orm/quickstart.html) - DeclarativeBase, Mapped, mapped_column patterns
- [SQLAlchemy 2.0 Table Configuration](https://docs.sqlalchemy.org/en/20/orm/declarative_tables.html) - __table_args__, UniqueConstraint
- [SQLAlchemy 2.0 SQLite Dialect](https://docs.sqlalchemy.org/en/20/dialects/sqlite.html) - PRAGMA foreign_keys, aiosqlite, JSON support, connection pooling
- [SQLAlchemy 2.0 Cascades](https://docs.sqlalchemy.org/en/20/orm/cascades.html) - cascade delete, SET NULL, passive_deletes
- [SQLAlchemy 2.0 Constraints and Indexes](https://docs.sqlalchemy.org/en/20/core/constraints.html) - UniqueConstraint, Index, composite constraints
- [SQLAlchemy 2.0 Basic Relationships](https://docs.sqlalchemy.org/en/20/orm/basic_relationships.html) - one-to-many, back_populates

### Secondary (MEDIUM confidence)
- [SQLAlchemy UUID Discussion #12792](https://github.com/sqlalchemy/sqlalchemy/discussions/12792) - Correct UUID usage with 2.0 ORM
- [SQLAlchemy UUID Discussion #10698](https://github.com/sqlalchemy/sqlalchemy/discussions/10698) - UUID autogeneration patterns

### Tertiary (LOW confidence)
- None -- all findings verified against official documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - SQLAlchemy 2.0 and SQLite are mature, well-documented technologies
- Architecture: HIGH - One-file-per-model, DeclarativeBase patterns are established best practices from official docs
- Pitfalls: HIGH - SQLite FK pragma issue is well-documented; date/timezone issues are a known pattern; circular import solutions are standard
- Constants: MEDIUM - XP values and thresholds are directly from PRD; the structure is a design choice (verified as clean Python pattern)

**Research date:** 2026-03-04
**Valid until:** 2026-04-04 (stable technology, 30-day validity)
