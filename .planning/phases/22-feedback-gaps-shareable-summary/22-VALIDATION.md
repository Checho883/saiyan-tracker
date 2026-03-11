---
phase: 22
slug: feedback-gaps-shareable-summary
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-11
---

# Phase 22 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x + @testing-library/react 16.x |
| **Config file** | `frontend/vitest.config.ts` |
| **Quick run command** | `cd frontend && npx vitest run --reporter=verbose` |
| **Full suite command** | `cd frontend && npx vitest run` |
| **Estimated runtime** | ~15 seconds |

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
| 22-01-01 | 01 | 1 | FDBK-01 | unit | `cd frontend && npx vitest run src/__tests__/negative-xp-popup.test.tsx -x` | ❌ W0 | ⬜ pending |
| 22-01-02 | 01 | 1 | FDBK-02 | unit | `cd frontend && npx vitest run src/__tests__/aura-gauge.test.tsx -x` | ✅ (extend) | ⬜ pending |
| 22-01-03 | 01 | 1 | FDBK-03 | unit | `cd frontend && npx vitest run src/__tests__/streak-break-card.test.tsx -x` | ❌ W0 | ⬜ pending |
| 22-01-04 | 01 | 1 | FDBK-04 | unit | `cd frontend && npx vitest run src/__tests__/power-milestone.test.ts -x` | ✅ (extend) | ⬜ pending |
| 22-02-01 | 02 | 1 | SHAR-01 | unit | `cd frontend && npx vitest run src/__tests__/share-summary.test.tsx -x` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `frontend/src/__tests__/negative-xp-popup.test.tsx` — stubs for FDBK-01 (negative variant rendering, downward animation class)
- [ ] `frontend/src/__tests__/streak-break-card.test.tsx` — stubs for FDBK-03 (renders with streak breaks, dismisses, plays sound)
- [ ] `frontend/src/__tests__/share-summary.test.tsx` — stubs for SHAR-01 (clipboard write, toast feedback, summary content)
- [ ] Extend `frontend/src/__tests__/aura-gauge.test.tsx` — stubs for FDBK-02 (transition on percent decrease)
- [ ] Extend `frontend/src/__tests__/power-milestone.test.ts` — stubs for FDBK-04 (expanded milestones array, escalation tier detection)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Sound plays on uncheck | FDBK-01 | Audio playback requires browser environment | 1. Check a habit, 2. Uncheck it, 3. Listen for negative sound |
| AuraGauge visual shrink animation | FDBK-02 | CSS transition visual timing | 1. Uncheck habit, 2. Watch gauge animate down smoothly |
| Celebration overlay visual | FDBK-04 | Full-screen overlay with animation | 1. Reach a milestone threshold, 2. Observe celebration overlay |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
