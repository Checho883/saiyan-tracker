---
phase: 4
slug: project-setup-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-05
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | frontend/vitest.config.ts (Wave 0 installs) |
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
| 04-01-01 | 01 | 1 | STATE-01 | build | `cd frontend && npx vite build` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | STATE-01 | unit | `cd frontend && npx vitest run` | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 1 | STATE-02 | unit | `cd frontend && npx vitest run src/types` | ❌ W0 | ⬜ pending |
| 04-02-02 | 02 | 1 | STATE-03 | unit | `cd frontend && npx vitest run src/services` | ❌ W0 | ⬜ pending |
| 04-02-03 | 02 | 2 | STATE-04 | unit | `cd frontend && npx vitest run src/store` | ❌ W0 | ⬜ pending |
| 04-02-04 | 02 | 2 | STATE-05, STATE-06 | visual | Manual dark theme check | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `frontend/vitest.config.ts` — vitest configuration
- [ ] `frontend/src/test/setup.ts` — test setup file
- [ ] vitest + @testing-library/react install — if no framework detected

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dark theme visual appearance | STATE-05, STATE-06 | CSS visual styling requires visual inspection | Run `npm run dev`, verify dark background, glowing borders, orange/blue accents |
| Page routing transitions | STATE-01 | Navigation UX requires browser interaction | Click Dashboard/Analytics/Settings links, verify URL changes and content renders |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
