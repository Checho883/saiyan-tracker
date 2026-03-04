---
phase: 2
slug: core-game-logic-services
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-04
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest 7.x |
| **Config file** | backend/pytest.ini |
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
| 02-01-01 | 01 | 1 | GAME-01 | unit | `cd backend && python -m pytest tests/test_xp_service.py -x -q` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | GAME-02 | unit | `cd backend && python -m pytest tests/test_xp_service.py -x -q` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | GAME-03 | unit | `cd backend && python -m pytest tests/test_streak_service.py -x -q` | ❌ W0 | ⬜ pending |
| 02-01-04 | 01 | 1 | GAME-04 | unit | `cd backend && python -m pytest tests/test_streak_service.py -x -q` | ❌ W0 | ⬜ pending |
| 02-01-05 | 01 | 1 | GAME-05 | unit | `cd backend && python -m pytest tests/test_capsule_service.py -x -q` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 2 | GAME-06 | unit | `cd backend && python -m pytest tests/test_dragon_ball_service.py -x -q` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 2 | GAME-07 | unit | `cd backend && python -m pytest tests/test_transformation_service.py -x -q` | ❌ W0 | ⬜ pending |
| 02-02-03 | 02 | 2 | GAME-08, GAME-09 | unit | `cd backend && python -m pytest tests/test_off_day_service.py -x -q` | ❌ W0 | ⬜ pending |
| 02-02-04 | 02 | 2 | GAME-10, GAME-11, GAME-12, GAME-13, GAME-14 | integration | `cd backend && python -m pytest tests/test_check_habit.py -x -q` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/test_xp_service.py` — stubs for GAME-01, GAME-02
- [ ] `tests/test_streak_service.py` — stubs for GAME-03, GAME-04
- [ ] `tests/test_capsule_service.py` — stubs for GAME-05
- [ ] `tests/test_dragon_ball_service.py` — stubs for GAME-06
- [ ] `tests/test_transformation_service.py` — stubs for GAME-07
- [ ] `tests/test_off_day_service.py` — stubs for GAME-08, GAME-09
- [ ] `tests/test_check_habit.py` — stubs for GAME-10 through GAME-14
- [ ] `tests/conftest.py` — extended fixtures (sample habits, daily logs, attribute logs)

---

## Manual-Only Verifications

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
