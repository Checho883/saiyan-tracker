---
phase: 7
slug: animation-layer
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-05
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x + React Testing Library 16.x |
| **Config file** | frontend/vitest.config.ts |
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
| 07-01-01 | 01 | 1 | ANIM-01 | unit | `cd frontend && npx vitest run src/__tests__/animation-queue.test.tsx -x` | ❌ W0 | ⬜ pending |
| 07-01-02 | 01 | 1 | ANIM-02 | unit | `cd frontend && npx vitest run src/__tests__/tier-change-banner.test.tsx -x` | ❌ W0 | ⬜ pending |
| 07-02-01 | 02 | 2 | ANIM-03 | unit | `cd frontend && npx vitest run src/__tests__/perfect-day.test.tsx -x` | ❌ W0 | ⬜ pending |
| 07-02-02 | 02 | 2 | ANIM-04, ANIM-05 | unit | `cd frontend && npx vitest run src/__tests__/capsule-drop.test.tsx -x` | ❌ W0 | ⬜ pending |
| 07-02-03 | 02 | 2 | ANIM-06 | unit | `cd frontend && npx vitest run src/__tests__/dragon-ball-trajectory.test.tsx -x` | ❌ W0 | ⬜ pending |
| 07-02-04 | 02 | 2 | ANIM-07 | unit | `cd frontend && npx vitest run src/__tests__/transformation.test.tsx -x` | ❌ W0 | ⬜ pending |
| 07-02-05 | 02 | 2 | ANIM-08, ANIM-09 | unit | `cd frontend && npx vitest run src/__tests__/shenron-ceremony.test.tsx -x` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `frontend/src/__mocks__/motion/react.ts` — Motion component mocks (motion.div, AnimatePresence, useAnimation, useReducedMotion)
- [ ] `frontend/src/__tests__/animation-queue.test.tsx` — stubs for ANIM-01

*Framework and config already exist (Vitest 4.x configured).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Spring physics feel natural | ANIM-04, ANIM-07 | Subjective visual quality | Open app, trigger capsule drop and transformation, verify bounce/spring feel game-like |
| Screen shake feels subtle | ANIM-03 | Perceptual assessment | Trigger Perfect Day, verify shake is 2-4px and doesn't feel jarring |
| 3D card flip looks correct | ANIM-05 | Visual depth perception | Trigger capsule reveal, verify rotateY creates convincing 3D flip |
| Shenron ceremony feels epic | ANIM-08 | Emotional impact assessment | Collect 7 Dragon Balls, trigger ceremony, verify theatrical pacing |
| Reduced motion respects OS | All | Requires OS setting change | Toggle OS reduced motion, verify animations simplified/skipped |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
