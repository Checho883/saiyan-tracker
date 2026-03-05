---
phase: 5
slug: dashboard-core-habit-management
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-05
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.0.18 + @testing-library/react 16.3.2 |
| **Config file** | `frontend/vitest.config.ts` |
| **Quick run command** | `cd frontend && npx vitest run --reporter=verbose` |
| **Full suite command** | `cd frontend && npx vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd frontend && npx vitest run --reporter=verbose`
- **After every plan wave:** Run `cd frontend && npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | DASH-01 | unit | `cd frontend && npx vitest run src/__tests__/dashboard-habits.test.tsx -t "groups habits by category"` | No - Wave 0 | pending |
| 05-01-02 | 01 | 1 | DASH-02 | unit | `cd frontend && npx vitest run src/__tests__/dashboard-habits.test.tsx -t "optimistic toggle"` | No - Wave 0 | pending |
| 05-01-03 | 01 | 1 | DASH-09 | unit | `cd frontend && npx vitest run src/__tests__/dashboard-habits.test.tsx -t "streak"` | No - Wave 0 | pending |
| 05-01-04 | 01 | 1 | DASH-10 | unit | `cd frontend && npx vitest run src/__tests__/dashboard-habits.test.tsx -t "character quote"` | No - Wave 0 | pending |
| 05-01-05 | 01 | 1 | DASH-13 | unit | `cd frontend && npx vitest run src/__tests__/dashboard-habits.test.tsx -t "xp popup"` | No - Wave 0 | pending |
| 05-02-01 | 02 | 1 | DASH-03 | unit | `cd frontend && npx vitest run src/__tests__/aura-gauge.test.tsx` | No - Wave 0 | pending |
| 05-02-02 | 02 | 1 | DASH-04 | unit | `cd frontend && npx vitest run src/__tests__/aura-gauge.test.tsx -t "tier label"` | No - Wave 0 | pending |
| 05-02-03 | 02 | 1 | DASH-05 | unit | `cd frontend && npx vitest run src/__tests__/game-stats.test.tsx -t "attribute bars"` | No - Wave 0 | pending |
| 05-02-04 | 02 | 1 | DASH-06 | unit | `cd frontend && npx vitest run src/__tests__/game-stats.test.tsx -t "dragon ball tracker"` | No - Wave 0 | pending |
| 05-02-05 | 02 | 1 | DASH-07 | unit | `cd frontend && npx vitest run src/__tests__/hero-section.test.tsx -t "avatar"` | No - Wave 0 | pending |
| 05-02-06 | 02 | 1 | DASH-08 | unit | `cd frontend && npx vitest run src/__tests__/hero-section.test.tsx -t "scouter"` | No - Wave 0 | pending |
| 05-03-01 | 03 | 2 | DASH-11 | unit | `cd frontend && npx vitest run src/__tests__/habit-form.test.tsx -t "create"` | No - Wave 0 | pending |
| 05-03-02 | 03 | 2 | DASH-12 | unit | `cd frontend && npx vitest run src/__tests__/habit-form.test.tsx -t "edit"` | No - Wave 0 | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `frontend/src/__tests__/dashboard-habits.test.tsx` — stubs for DASH-01, DASH-02, DASH-09, DASH-10, DASH-13
- [ ] `frontend/src/__tests__/aura-gauge.test.tsx` — stubs for DASH-03, DASH-04
- [ ] `frontend/src/__tests__/game-stats.test.tsx` — stubs for DASH-05, DASH-06
- [ ] `frontend/src/__tests__/hero-section.test.tsx` — stubs for DASH-07, DASH-08
- [ ] `frontend/src/__tests__/habit-form.test.tsx` — stubs for DASH-11, DASH-12
- [ ] Mock fixtures for `HabitTodayResponse[]`, `PowerResponse`, `CategoryResponse[]`, `CheckHabitResponse`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Circular gauge visual appearance | DASH-03 | SVG rendering visual correctness | Inspect gauge at 0%, 50%, 80%, 100% |
| Collapsing hero on scroll | N/A | Scroll behavior with IntersectionObserver | Scroll habit list, verify hero collapses/expands |
| Bottom sheet modal UX | DASH-11 | Gesture interaction (swipe to dismiss) | Open create modal, swipe down to dismiss |
| XP popup float animation | DASH-13 | CSS animation visual timing | Check habit, verify popup floats up and fades |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
