# Coding Conventions

**Analysis Date:** 2026-03-01

## Naming Patterns

**Files:**
- Python: `snake_case.py` (e.g., `habit_service.py`, `habit_streak.py`)
- TypeScript/TSX: `PascalCase.tsx` for components (e.g., `HabitCard.tsx`, `HabitFormModal.tsx`)
- TypeScript non-component: `camelCase.ts` (e.g., `habitStore.ts`, `api.ts`)
- Stores: `{noun}Store.ts` pattern (e.g., `habitStore.ts`, `taskStore.ts`, `powerStore.ts`)

**Functions:**
- Python: `snake_case` for all functions and methods (e.g., `get_today_habits`, `check_habit`, `is_habit_due_on`)
- TypeScript: `camelCase` for functions and hooks (e.g., `fetchHabits`, `checkHabit`)
- React hooks: `use` prefix (e.g., `useHabitStore`, `useThemeContext`)

**Variables:**
- Python: `snake_case` (e.g., `user_id`, `habit_id`, `streak_bonus_rate`)
- TypeScript: `camelCase` (e.g., `todayHabits`, `habitId`)
- Constants: `UPPER_SNAKE_CASE` in both Python and TypeScript (e.g., `DEFAULT_USER_ID`, `HABIT_STREAK_BONUS_CAP`, `WEEKDAYS`)

**Types/Classes:**
- Python classes: `PascalCase` (e.g., `HabitService`, `HabitCreate`, `ReorderRequest`)
- TypeScript interfaces/types: `PascalCase` (e.g., `HabitState`, `HabitToday`, `HabitCheckResult`)

## Code Style

**Formatting:**
- Python: No formatter config detected; follows PEP 8 style manually
- TypeScript: No `.prettierrc` or `eslint.config.*` detected at project root

**Linting:**
- Not configured (no `.eslintrc*`, `biome.json` found)

## Import Organization

**Python order:**
1. Standard library (`datetime`, `math`, `calendar`)
2. Third-party (`fastapi`, `sqlalchemy`, `pydantic`)
3. Internal app imports (`app.models.*`, `app.schemas.*`, `app.services.*`, `app.core.*`)

Example from `backend/app/services/habit_service.py`:
```python
import math
from datetime import date, datetime, timedelta
from calendar import monthrange
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.habit import Habit
from app.models.habit_log import HabitLog
```

**TypeScript order:**
1. Third-party (`zustand`, `react`)
2. Internal with `@/` alias (e.g., `@/types`, `@/services/api`)

Example from `frontend/src/store/habitStore.ts`:
```typescript
import { create } from 'zustand';
import type { Habit, HabitToday } from '@/types';
import { habitApi } from '@/services/api';
```

**Path Aliases:**
- `@/` maps to `frontend/src/` — use for all internal imports

## Error Handling

**Backend patterns:**
- Use `HTTPException` from FastAPI for all API errors
- Standard HTTP status codes: 404 for not found, 201 for creation
- Service methods return `None` on not-found; API layer converts to `HTTPException`

```python
# Service layer returns None:
if not habit:
    return None

# API layer raises exception:
result = HabitService.check_habit(db, DEFAULT_USER_ID, habit_id)
if result is None:
    raise HTTPException(status_code=404, detail="Habit not found")
```

**Frontend patterns:**
- No explicit try/catch observed in stores — errors propagate from `fetch` calls
- API errors are not currently caught at the store level

## Service Layer Pattern

**Backend services use static methods exclusively:**
```python
class HabitService:
    @staticmethod
    def get_today_habits(db: Session, user_id: str) -> list[dict]:
        ...

    @staticmethod
    def _increment_streak(streak: HabitStreak, today: date) -> bool:
        ...
```
- Private helpers prefixed with `_` (e.g., `_get_total_power`, `_increment_streak`)
- All public methods take `db: Session` and `user_id: str` as first two args
- Return plain `dict` or `list[dict]` — not Pydantic models — from service methods

## API Route Pattern

**Consistent structure in route files:**
- `DEFAULT_USER_ID = "default-user"` declared at module level in each router
- Dependency injection via `db: Session = Depends(get_db)`
- One-line docstrings on every route function
- Route functions delegate business logic to service classes

```python
@router.post("/{habit_id}/check")
def check_habit(habit_id: str, db: Session = Depends(get_db)):
    """Toggle today's completion for a habit."""
    result = HabitService.check_habit(db, DEFAULT_USER_ID, habit_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Habit not found")
    return result
```

## Response Shape Pattern

**Backend returns raw dicts, not Pydantic response models, from most endpoints:**
- Responses are manually constructed dicts that include denormalized category fields
- Every habit response includes: `category_name`, `category_color`, `category_multiplier`
- This is repeated across `list_habits`, `get_habit`, `create_habit`, `update_habit`

## Frontend State Management

**Zustand store pattern:**
- Interface defines state shape + all actions
- `create<StateInterface>((set, get) => ({...}))` factory pattern
- Mutations call API then re-fetch (optimistic updates not used)
- `loading` boolean tracked per store

```typescript
export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  loading: false,

  fetchHabits: async () => {
    const habits = await habitApi.list();
    set({ habits });
  },

  updateHabit: async (id, data) => {
    await habitApi.update(id, data);
    await get().fetchHabits();       // re-fetch after mutation
    await get().fetchTodayHabits();
  },
}));
```

## Logging

**Framework:** None — no logging framework configured on backend or frontend

## Comments

**Python docstrings:**
- One-line docstrings on all route functions and public service methods
- Inline comments used for complex logic blocks (e.g., "# Zenkai recovery: halve streak instead of resetting")

**TypeScript:**
- Minimal comments; code is largely self-documenting through naming

## Constants

**Backend constants centralised at** `backend/app/core/constants.py`:
- Game constants: `HABIT_STREAK_BONUS_PER_DAY`, `HABIT_STREAK_BONUS_CAP`, `ZENKAI_BOOST`, `CONSISTENCY_TIERS`
- Day lists: `WEEKDAYS`, `ALL_DAYS`
- Import from constants rather than inline magic numbers

## Soft Delete Pattern

- Habits and tasks use `is_active = False` for deletion, not physical row removal
- Delete endpoints return `{"message": "...", "habit_id": id}` shape

---

*Convention analysis: 2026-03-01*
