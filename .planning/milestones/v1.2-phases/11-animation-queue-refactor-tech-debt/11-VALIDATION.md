---
phase: 11
slug: animation-queue-refactor-tech-debt
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-06
---

# Phase 11 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.x |
| **Config file** | `frontend/vitest.config.ts` |
| **Quick run command** | `cd frontend && npx vitest run --reporter=verbose 2>&1 | tail -20` |
| **Full suite command** | `cd frontend && npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd frontend && npx vitest run --reporter=verbose 2>&1 | tail -20`
- **After every plan wave:** Run `cd frontend && npx vitest run --reporter=verbose`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 11-01-01 | 01 | 1 | FEED-06 | unit | `cd frontend && npx vitest run src/__tests__/animation-queue.test.tsx` | Yes | pending |
| 11-01-02 | 01 | 1 | FEED-06 | unit | `cd frontend && npx vitest run src/__tests__/animation-queue.test.tsx` | Yes | pending |
| 11-01-03 | 01 | 1 | FEED-06 | unit | `cd frontend && npx vitest run src/__tests__/animation-queue.test.tsx` | Yes | pending |
| 11-02-01 | 02 | 1 | TECH-01 | unit | `cd frontend && npx vitest run src/__tests__/analytics-charts.test.tsx` | Yes | pending |

*Status: pending*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. Test file `animation-queue.test.tsx` already exists and will be extended.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Combo overlay visual styling | FEED-06 | Visual fidelity | Check combo overlay shows "COMBO xN!" with energy burst styling |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
