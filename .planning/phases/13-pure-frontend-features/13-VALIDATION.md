---
phase: 13
slug: pure-frontend-features
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-06
---

# Phase 13 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.0 + @testing-library/react |
| **Config file** | `frontend/vitest.config.ts` |
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
| 13-01-01 | 01 | 1 | ANLT-01 | unit | `cd frontend && npx vitest run src/__tests__/capsule-history.test.tsx -x` | Wave 0 | pending |
| 13-01-02 | 01 | 1 | ANLT-02 | unit | `cd frontend && npx vitest run src/__tests__/wish-history.test.tsx -x` | Wave 0 | pending |
| 13-02-01 | 02 | 1 | ANLT-03 | unit | `cd frontend && npx vitest run src/__tests__/contribution-graph.test.tsx -x` | Wave 0 | pending |
| 13-03-01 | 03 | 2 | FEED-04 | unit | `cd frontend && npx vitest run src/__tests__/nudge-banner.test.tsx -x` | Wave 0 | pending |
| 13-03-02 | 03 | 2 | FEED-05 | unit | `cd frontend && npx vitest run src/__tests__/daily-summary.test.ts -x` | Wave 0 | pending |
| 13-03-03 | 03 | 2 | FEED-02 | unit | `cd frontend && npx vitest run src/__tests__/power-milestone.test.ts -x` | Wave 0 | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `frontend/src/__tests__/capsule-history.test.tsx` -- stubs for ANLT-01
- [ ] `frontend/src/__tests__/wish-history.test.tsx` -- stubs for ANLT-02
- [ ] `frontend/src/__tests__/contribution-graph.test.tsx` -- stubs for ANLT-03
- [ ] `frontend/src/__tests__/nudge-banner.test.tsx` -- stubs for FEED-04
- [ ] `frontend/src/__tests__/daily-summary.test.ts` -- stubs for FEED-05
- [ ] `frontend/src/__tests__/power-milestone.test.ts` -- stubs for FEED-02

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Power milestone celebration animation visual | FEED-02 | Visual quality of animation | Check animation on screen, verify overlay plays with milestone number |
| Nudge banner DBZ tone | FEED-04 | Copy quality | Read the banner text, verify it uses habit names and motivational tone |
| Daily summary toast auto-dismiss | FEED-05 | Timing behavior | Check toast after last habit, verify it auto-dismisses after ~4 seconds |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
