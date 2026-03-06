---
phase: 8
slug: analytics-settings
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-05
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.0.18 + @testing-library/react 16.3.2 |
| **Config file** | frontend/vitest.config.ts |
| **Quick run command** | `cd frontend && npx vitest run --reporter=verbose` |
| **Full suite command** | `cd frontend && npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd frontend && npx vitest run --reporter=verbose`
- **After every plan wave:** Run `cd frontend && npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| TBD | 01 | 1 | ANLYT-01 | unit | `npx vitest run src/__tests__/calendar-heatmap.test.tsx` | ❌ W0 | ⬜ pending |
| TBD | 01 | 1 | ANLYT-02 | unit | `npx vitest run src/__tests__/calendar-heatmap.test.tsx` | ❌ W0 | ⬜ pending |
| TBD | 01 | 1 | ANLYT-03 | unit | `npx vitest run src/__tests__/analytics-charts.test.tsx` | ❌ W0 | ⬜ pending |
| TBD | 01 | 1 | ANLYT-04 | unit | `npx vitest run src/__tests__/stat-cards.test.tsx` | ❌ W0 | ⬜ pending |
| TBD | 01 | 1 | ANLYT-05 | unit | `npx vitest run src/__tests__/analytics-charts.test.tsx` | ❌ W0 | ⬜ pending |
| TBD | 02 | 1 | SET-01 | unit | `npx vitest run src/__tests__/settings.test.tsx` | ❌ W0 | ⬜ pending |
| TBD | 02 | 1 | SET-02 | unit | `npx vitest run src/__tests__/settings.test.tsx` | ❌ W0 | ⬜ pending |
| TBD | 02 | 1 | SET-03 | unit | `npx vitest run src/__tests__/settings-crud.test.tsx` | ❌ W0 | ⬜ pending |
| TBD | 02 | 1 | SET-04 | unit | `npx vitest run src/__tests__/settings-crud.test.tsx` | ❌ W0 | ⬜ pending |
| TBD | 02 | 1 | SET-05 | unit | `npx vitest run src/__tests__/settings-crud.test.tsx` | ❌ W0 | ⬜ pending |
| TBD | 02 | 1 | SET-06 | unit | `npx vitest run src/__tests__/settings.test.tsx` | ❌ W0 | ⬜ pending |
| TBD | 02 | 1 | SET-07 | unit | `npx vitest run src/__tests__/settings.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/calendar-heatmap.test.tsx` — stubs for ANLYT-01, ANLYT-02
- [ ] `src/__tests__/analytics-charts.test.tsx` — stubs for ANLYT-03, ANLYT-05
- [ ] `src/__tests__/stat-cards.test.tsx` — stubs for ANLYT-04
- [ ] `src/__tests__/settings.test.tsx` — stubs for SET-01, SET-02, SET-06, SET-07
- [ ] `src/__tests__/settings-crud.test.tsx` — stubs for SET-03, SET-04, SET-05
- [ ] `npm install recharts` + react-is override in package.json

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Chart glow/neon effect appearance | ANLYT-03, ANLYT-05 | Visual aesthetic judgment | Verify charts show neon glow on dark background |
| Scouter HUD scan-line effect | ANLYT-04 | CSS animation visual | Verify scan-line animation on stat cards |
| Swipe-to-reveal feel | SET-03-05 | Touch interaction quality | Swipe left on list items to reveal edit/delete |
| Theme instant switch (no flash) | SET-02 | Visual timing | Toggle theme and verify no white flash |
| Off-day reason icon grid layout | SET-06 | Visual layout | Verify 5 icons in grid with labels |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
