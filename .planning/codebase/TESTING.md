# Testing Patterns

**Analysis Date:** 2026-03-01

## Test Framework

**Runner:** None detected

**Status:** No test files found in the project. No test configuration files exist.

- No `jest.config.*`, `vitest.config.*`, or `pytest.ini` / `pyproject.toml` test config
- No `*.test.ts`, `*.spec.ts`, `*.test.tsx`, `*.spec.tsx` files in `frontend/src/`
- No `tests/` or `test/` directories in `backend/` or `frontend/`

**Run Commands:**
```bash
# No test commands configured
```

## Test File Organization

**Location:** Not established — no tests exist

**Naming:** No pattern to observe

## Test Structure

No test suites exist in this codebase.

## Mocking

No mocking patterns established.

## Fixtures and Factories

No fixtures or factories established.

## Coverage

**Requirements:** None enforced

## Test Types

**Unit Tests:** Not present

**Integration Tests:** Not present

**E2E Tests:** Not present

## Recommended Setup (for new tests)

Based on the tech stack, these frameworks would fit naturally:

**Backend (Python/FastAPI):**
- `pytest` with `pytest-asyncio` for async support
- `httpx` with FastAPI's `TestClient` for route testing
- In-memory SQLite for test database isolation

```python
# Recommended pattern for backend route tests
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_list_habits():
    response = client.get("/api/v1/habits/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
```

**Frontend (React/TypeScript/Vite):**
- `vitest` (consistent with Vite toolchain)
- `@testing-library/react` for component tests
- `msw` (Mock Service Worker) for API mocking

```typescript
// Recommended pattern for store tests
import { renderHook, act } from '@testing-library/react';
import { useHabitStore } from '@/store/habitStore';

test('fetchTodayHabits sets loading state', async () => {
  const { result } = renderHook(() => useHabitStore());
  await act(async () => {
    await result.current.fetchTodayHabits();
  });
  expect(result.current.loading).toBe(false);
});
```

## Coverage Gaps (High Priority)

**Backend service logic:**
- `backend/app/services/habit_service.py` — streak increment/decrement logic, Zenkai boost calculation, consistency bonus tiers
- `backend/app/services/power_service.py` — transformation threshold checks
- `backend/app/api/v1/habits.py` — all 10+ routes untested

**Frontend state:**
- `frontend/src/store/habitStore.ts` — all store actions untested
- `frontend/src/store/taskStore.ts` — all store actions untested
- `frontend/src/services/api.ts` — API client layer untested

**Critical business logic to test first:**
1. `HabitService._increment_streak` — Zenkai recovery halving logic
2. `HabitService._apply_consistency_bonus` — tiered bonus calculation
3. `HabitService.is_habit_due_on` — frequency/custom_days filtering
4. `HabitService.check_habit` — toggle on/off behavior

---

*Testing analysis: 2026-03-01*
