---
phase: 9
slug: cross-phase-integration-fixes
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-05
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | `frontend/vitest.config.ts` |
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
| 09-01-01 | 01 | 1 | SET-01, AUDIO-01 | unit | `cd frontend && npx vitest run src/__tests__/sound-provider.test.tsx -x` | ✅ (needs new case) | ⬜ pending |
| 09-01-02 | 01 | 1 | DASH-04 | unit | `cd frontend && npx vitest run src/__tests__/stores.test.ts -x` | ✅ (needs new case) | ⬜ pending |
| 09-01-03 | 01 | 1 | AUDIO-04 | unit | `cd frontend && npx vitest run src/__tests__/capsule-drop.test.tsx -x` | ✅ (needs new case) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No Wave 0 needed.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Sound actually plays on capsule reveal | AUDIO-04 | Howler audio output cannot be verified in JSDOM | Open app, trigger capsule drop, tap to reveal, listen for chime |
| Sound mute persists across page reload | SET-01 | Requires full page lifecycle | Toggle mute in settings, reload page, verify mute state persists |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
