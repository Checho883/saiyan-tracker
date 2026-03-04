---
phase: 1
slug: database-and-model-integrity
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-04
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest 7.x |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `cd backend && python -m pytest tests/ -x -q` |
| **Full suite command** | `cd backend && python -m pytest tests/ -v` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd backend && python -m pytest tests/ -x -q`
- **After every plan wave:** Run `cd backend && python -m pytest tests/ -v`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 0 | -- | setup | `pytest --version` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | DB-01 | integration | `pytest tests/test_models.py::test_create_all_tables -x` | ❌ W0 | ⬜ pending |
| 01-01-03 | 01 | 1 | DB-02 | unit | `pytest tests/test_models.py::test_user_defaults -x` | ❌ W0 | ⬜ pending |
| 01-01-04 | 01 | 1 | DB-03 | unit | `pytest tests/test_models.py::test_habit_fields -x` | ❌ W0 | ⬜ pending |
| 01-01-05 | 01 | 1 | DB-04 | unit | `pytest tests/test_models.py::test_habit_log_fields -x` | ❌ W0 | ⬜ pending |
| 01-01-06 | 01 | 1 | DB-05 | unit | `pytest tests/test_models.py::test_daily_log_fields -x` | ❌ W0 | ⬜ pending |
| 01-01-07 | 01 | 1 | DB-06 | integration | `pytest tests/test_models.py::test_date_columns_are_strings -x` | ❌ W0 | ⬜ pending |
| 01-01-08 | 01 | 1 | DB-04,DB-05 | integration | `pytest tests/test_constraints.py::test_unique_constraints -x` | ❌ W0 | ⬜ pending |
| 01-01-09 | 01 | 1 | DB-08 | unit | `pytest tests/test_models.py::test_category_fields -x` | ❌ W0 | ⬜ pending |
| 01-01-10 | 01 | 1 | DB-08 | integration | `pytest tests/test_constraints.py::test_category_set_null -x` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 1 | -- | unit | `pytest tests/test_constants.py -x` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 1 | DB-07 | integration | `pytest tests/test_seed.py::test_seed_quotes -x` | ❌ W0 | ⬜ pending |
| 01-02-03 | 02 | 1 | DB-07 | integration | `pytest tests/test_seed.py::test_seed_idempotent -x` | ❌ W0 | ⬜ pending |
| 01-02-04 | 02 | 1 | -- | integration | `pytest tests/test_constraints.py::test_fk_enforcement -x` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `backend/tests/conftest.py` — in-memory SQLite engine, session fixture, FK pragma, table creation
- [ ] `backend/tests/test_models.py` — stubs for DB-01 through DB-06, DB-08
- [ ] `backend/tests/test_constraints.py` — unique constraints, FK enforcement, SET NULL cascade
- [ ] `backend/tests/test_seed.py` — seed quotes, seed idempotency
- [ ] `backend/tests/test_constants.py` — constants importability
- [ ] `backend/pyproject.toml` — pytest configuration
- [ ] `pip install pytest` — framework install

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| -- | -- | -- | -- |

*All phase behaviors have automated verification.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
