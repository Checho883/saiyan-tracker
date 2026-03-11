---
phase: 21
slug: enhanced-analytics-views
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-08
---

# Phase 21 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
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
| 21-01-01 | 01 | 1 | ANLYT-01 | unit | `cd frontend && npx vitest run` | ❌ W0 | ⬜ pending |
| 21-01-02 | 01 | 1 | ANLYT-02 | unit | `cd frontend && npx vitest run` | ❌ W0 | ⬜ pending |
| 21-02-01 | 02 | 1 | ANLYT-03 | unit | `cd frontend && npx vitest run` | ❌ W0 | ⬜ pending |
| 21-02-02 | 02 | 1 | ANLYT-04 | unit | `cd frontend && npx vitest run` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Test stubs for ANLYT-01 through ANLYT-04 analytics components
- [ ] Mock setup for recharts components and analytics API responses

*Existing vitest infrastructure covers framework needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Visual chart rendering | ANLYT-01 | Chart visual accuracy needs visual inspection | Open analytics view, verify off-day chart renders with correct data |
| Arrow indicators direction | ANLYT-02 | CSS animation/visual indicator | Verify up/down arrows match positive/negative deltas |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
