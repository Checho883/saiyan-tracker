---
phase: 3
slug: api-routes-and-schemas
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-04
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest 9.0.2 |
| **Config file** | backend/pyproject.toml (`[tool.pytest.ini_options]`) |
| **Quick run command** | `cd backend && python -m pytest tests/test_api_habits.py -x` |
| **Full suite command** | `cd backend && python -m pytest tests/ -x` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd backend && python -m pytest tests/test_api_*.py -x --tb=short`
- **After every plan wave:** Run `cd backend && python -m pytest tests/ -x`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 0 | (infra) | setup | `cd backend && python -m pytest tests/ -x` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | API-02 | integration | `cd backend && python -m pytest tests/test_api_habits.py::test_habit_crud -x` | ❌ W0 | ⬜ pending |
| 03-01-03 | 01 | 1 | API-01 | integration | `cd backend && python -m pytest tests/test_api_habits.py::test_check_habit_response -x` | ❌ W0 | ⬜ pending |
| 03-01-04 | 01 | 1 | API-03 | integration | `cd backend && python -m pytest tests/test_api_habits.py::test_habits_today -x` | ❌ W0 | ⬜ pending |
| 03-01-05 | 01 | 1 | API-04 | integration | `cd backend && python -m pytest tests/test_api_habits.py::test_calendar -x` | ❌ W0 | ⬜ pending |
| 03-01-06 | 01 | 1 | API-13 | integration | `cd backend && python -m pytest tests/test_api_habits.py::test_contribution_graph -x` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 1 | API-05 | integration | `cd backend && python -m pytest tests/test_api_rewards.py -x` | ❌ W0 | ⬜ pending |
| 03-02-02 | 02 | 1 | API-06 | integration | `cd backend && python -m pytest tests/test_api_wishes.py -x` | ❌ W0 | ⬜ pending |
| 03-02-03 | 02 | 1 | API-07, API-08 | integration | `cd backend && python -m pytest tests/test_api_power.py -x` | ❌ W0 | ⬜ pending |
| 03-02-04 | 02 | 1 | API-09 | integration | `cd backend && python -m pytest tests/test_api_categories.py -x` | ❌ W0 | ⬜ pending |
| 03-02-05 | 02 | 1 | API-10 | integration | `cd backend && python -m pytest tests/test_api_off_days.py -x` | ❌ W0 | ⬜ pending |
| 03-02-06 | 02 | 1 | API-11, API-12 | integration | `cd backend && python -m pytest tests/test_api_analytics.py -x` | ❌ W0 | ⬜ pending |
| 03-02-07 | 02 | 1 | API-14 | integration | `cd backend && python -m pytest tests/test_api_quotes.py -x` | ❌ W0 | ⬜ pending |
| 03-02-08 | 02 | 1 | API-15 | integration | `cd backend && python -m pytest tests/test_api_settings.py -x` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `pip install "fastapi[standard]" httpx` — FastAPI and httpx not yet installed in venv
- [ ] Update `backend/requirements.txt` to include httpx
- [ ] `backend/app/api/__init__.py` — API package does not exist yet
- [ ] `backend/app/api/v1/__init__.py` — v1 sub-package does not exist yet
- [ ] `backend/app/api/deps.py` — Dependencies module (get_current_user) does not exist yet
- [ ] `backend/app/schemas/__init__.py` — Schemas package does not exist yet
- [ ] Test conftest needs `client` fixture with TestClient + dependency overrides
- [ ] All `tests/test_api_*.py` files — none exist yet

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Swagger UI renders all endpoints | (all) | Visual inspection | Open http://localhost:8000/docs, verify all endpoint groups appear |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
