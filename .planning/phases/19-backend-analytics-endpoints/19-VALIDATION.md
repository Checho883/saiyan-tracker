---
phase: 19
slug: backend-analytics-endpoints
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-08
---

# Phase 19 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest (existing) |
| **Config file** | `backend/pyproject.toml` |
| **Quick run command** | `cd backend && python -m pytest tests/test_api_analytics.py tests/test_api_habits.py tests/test_api_status.py -x` |
| **Full suite command** | `cd backend && python -m pytest tests/ -x` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd backend && python -m pytest tests/test_api_analytics.py tests/test_api_habits.py tests/test_api_status.py -x`
- **After every plan wave:** Run `cd backend && python -m pytest tests/ -x`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 19-01-01 | 01 | 1 | ANLYT-01 | integration | `pytest tests/test_api_analytics.py::TestOffDaySummary -x` | ❌ W0 | ⬜ pending |
| 19-01-02 | 01 | 1 | ANLYT-02 | integration | `pytest tests/test_api_analytics.py::TestCompletionTrend -x` | ❌ W0 | ⬜ pending |
| 19-02-01 | 02 | 1 | DTAIL-01/02/03 | integration | `pytest tests/test_api_habits.py::TestHabitStatsEnhanced tests/test_api_habits.py::TestHabitCalendar -x` | ❌ W0 | ⬜ pending |
| 19-02-02 | 02 | 1 | FDBK-03 | integration | `pytest tests/test_api_status.py::TestStreakBreaks -x` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

All test files exist but test classes are new — created as part of TDD tasks within each plan. No separate Wave 0 needed since each task writes tests first (tdd="true").

*Existing infrastructure covers all phase requirements — test files and conftest.py already exist.*

---

## Manual-Only Verifications

*All phase behaviors have automated verification.*

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (handled by TDD tasks)
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
