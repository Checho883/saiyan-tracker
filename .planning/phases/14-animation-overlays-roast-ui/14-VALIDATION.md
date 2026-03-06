---
phase: 14
slug: animation-overlays-roast-ui
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-06
---

# Phase 14 -- Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (frontend), pytest (backend) |
| **Config file** | frontend/vitest.config.ts, backend/pytest.ini |
| **Quick run command** | `cd frontend && npx tsc --noEmit` |
| **Full suite command** | `cd frontend && npx vitest run --reporter=verbose 2>&1 | tail -30` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd frontend && npx tsc --noEmit`
- **After every plan wave:** Run `cd frontend && npx vitest run --reporter=verbose 2>&1 | tail -30`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 14-01-01 | 01 | 1 | ACHV-03 | integration | `cd backend && python -c "from app.schemas.achievement import AchievementResponse; print('OK')"` | N/A (new) | pending |
| 14-01-02 | 01 | 1 | FEED-01, FEED-03 | type-check | `cd frontend && npx tsc --noEmit` | N/A (new) | pending |
| 14-02-01 | 02 | 1 | FEED-01 | type-check | `cd frontend && npx tsc --noEmit` | N/A (new) | pending |
| 14-02-02 | 02 | 1 | FEED-03 | type-check | `cd frontend && npx tsc --noEmit` | N/A (new) | pending |
| 14-03-01 | 03 | 2 | FEED-03 | type-check | `cd frontend && npx tsc --noEmit` | N/A (new) | pending |
| 14-03-02 | 03 | 2 | ACHV-03 | type-check | `cd frontend && npx tsc --noEmit` | N/A (new) | pending |

*Status: pending -- all pending*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. Frontend has vitest + TypeScript. Backend has pytest. No new test framework needed.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Level-up overlay visual appearance | FEED-01 | Visual animation timing/aesthetics | Check habit that triggers level-up, verify overlay shows attribute + level + title |
| Zenkai recovery dramatic effect | FEED-03 | Visual animation timing/aesthetics | Break streak, return with perfect day, verify full-screen cyan flash + text |
| Roast severity escalation visuals | FEED-03 | Visual styling progression | Test with mild/medium/savage roast data, verify color/shake escalation |
| Achievements grid layout | ACHV-03 | Visual grid layout/responsiveness | Navigate to Analytics, verify earned vs locked badge styling |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
