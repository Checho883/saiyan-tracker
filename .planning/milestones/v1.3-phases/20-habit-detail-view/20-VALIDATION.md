---
phase: 20
slug: habit-detail-view
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-08
---

# Phase 20 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest + @testing-library/react |
| **Config file** | frontend/vitest.config.ts |
| **Quick run command** | `cd frontend && npx vitest run --reporter=verbose` |
| **Full suite command** | `cd frontend && npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd frontend && npx vitest run --reporter=verbose`
- **After every plan wave:** Run `cd frontend && npx vitest run --reporter=verbose`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 20-01-01 | 01 | 1 | DTAIL-01 | unit | `cd frontend && npx vitest run src/__tests__/habit-detail-sheet.test.tsx -t "completion rates"` | ❌ W0 | ⬜ pending |
| 20-01-02 | 01 | 1 | DTAIL-02 | unit | `cd frontend && npx vitest run src/__tests__/habit-detail-sheet.test.tsx -t "attribute XP"` | ❌ W0 | ⬜ pending |
| 20-02-01 | 02 | 1 | DTAIL-03 | unit | `cd frontend && npx vitest run src/__tests__/habit-detail-sheet.test.tsx -t "metadata"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `frontend/src/__tests__/habit-detail-sheet.test.tsx` — stubs for DTAIL-01, DTAIL-02, DTAIL-03
- [ ] Test fixtures for mock HabitStatsResponse and HabitCalendarDay API responses

*Existing test infrastructure (vitest, testing-library) is already set up.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Responsive layout on mobile/desktop | SC-4 | Visual layout verification | Open sheet on 375px and 1024px viewports, confirm no overflow or misalignment |
| Aura glow gradient appearance | CONTEXT | Visual aesthetic | Verify subtle attribute-colored gradient at top of sheet |
| Progress ring animation smoothness | CONTEXT | Animation quality | Verify rings animate on open, no jank |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
