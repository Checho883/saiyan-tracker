---
phase: 10
slug: milestone-verification-housekeeping
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-06
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.x |
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
| 10-01-01 | 01 | 1 | ANIM-01..09 | manual (code review) | `npx vitest run --reporter=verbose` (no regressions) | N/A — doc only | pending |
| 10-01-02 | 01 | 1 | ANLYT-01..05, SET-01..07 | manual (code review) | `npx vitest run --reporter=verbose` (no regressions) | N/A — doc only | pending |
| 10-01-03 | 01 | 1 | N/A (metadata) | manual | N/A | N/A — doc only | pending |
| 10-01-04 | 01 | 1 | N/A (metadata) | manual | N/A | N/A — doc only | pending |

*Status: pending*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. This phase creates documentation only — no new test files needed.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| VERIFICATION.md accuracy | ANIM-01..09 | Code review against source | Read each component file, verify file:line references |
| VERIFICATION.md accuracy | ANLYT-01..05, SET-01..07 | Code review against source | Read each component file, verify file:line references |
| SUMMARY frontmatter | N/A | Metadata update | Verify arrays match PLAN.md task assignments |
| REQUIREMENTS.md sync | N/A | Metadata update | Verify checkboxes match verification results |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
