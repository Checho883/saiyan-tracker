---
phase: 18
slug: dashboard-polish-responsive-design
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-08
---

# Phase 18 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + jsdom + @testing-library/react |
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
| TBD | 01 | 1 | RESP-03 | unit | `cd frontend && npx vitest run --reporter=verbose` | Existing tests | pending |
| TBD | 02 | 1 | RESP-01, RESP-02 | unit | `cd frontend && npx vitest run --reporter=verbose` | Existing tests | pending |
| TBD | 02 | 1 | RESP-04 | unit | `cd frontend && npx vitest run src/__tests__/responsive-hero.test.tsx -x` | Wave 0 | pending |
| TBD | 03 | 2 | RESP-05 | manual-only | Visual inspection at 375px | N/A | pending |
| TBD | 03 | 2 | RESP-06 | manual-only | Visual inspection at 375px | N/A | pending |

*Status: pending · green · red · flaky*

---

## Wave 0 Requirements

- [ ] `frontend/src/__tests__/responsive-hero.test.tsx` — stubs for RESP-04 (compact hero renders correctly)
- [ ] Update `frontend/src/__tests__/hero-section.test.tsx` — add assertion that full hero renders on desktop

*Note: Most RESP requirements are visual/layout concerns best verified manually. Wave 0 covers what can be unit tested.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Touch targets >= 44px | RESP-01 | CSS layout measurement needs browser | Inspect BottomTabBar buttons at 375px, verify computed size >= 44x44px |
| Desktop spacing consistency | RESP-03 | Visual alignment check | Load dashboard at 1440px, verify uniform gaps and no overlap |
| Charts fit mobile viewport | RESP-05 | Horizontal scroll detection | Load analytics at 375px, verify no horizontal scrollbar on any chart |
| Touch tooltips work | RESP-05 | Touch event testing | Tap chart data points at 375px, verify tooltip appears/dismisses |
| Form thumb-friendliness | RESP-06 | Input spacing ergonomics | Open all settings forms at 375px, verify thumb reach |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
