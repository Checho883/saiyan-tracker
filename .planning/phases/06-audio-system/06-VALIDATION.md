---
phase: 6
slug: audio-system
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-05
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.0.18 + jsdom |
| **Config file** | `frontend/vitest.config.ts` |
| **Quick run command** | `cd frontend && npx vitest run --reporter=verbose` |
| **Full suite command** | `cd frontend && npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~10 seconds |

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
| 06-01-01 | 01 | 1 | AUDIO-01 | unit | `cd frontend && npx vitest run src/__tests__/sound-provider.test.tsx -x` | ❌ W0 | ⬜ pending |
| 06-01-02 | 01 | 1 | AUDIO-09 | unit | `cd frontend && npx vitest run src/__tests__/sound-provider.test.tsx -x` | ❌ W0 | ⬜ pending |
| 06-02-01 | 02 | 1 | AUDIO-02 | unit | `cd frontend && npx vitest run src/__tests__/sound-triggers.test.ts -x` | ❌ W0 | ⬜ pending |
| 06-02-02 | 02 | 1 | AUDIO-03 | unit | `cd frontend && npx vitest run src/__tests__/sound-triggers.test.ts -x` | ❌ W0 | ⬜ pending |
| 06-02-03 | 02 | 1 | AUDIO-04 | unit | `cd frontend && npx vitest run src/__tests__/sound-triggers.test.ts -x` | ❌ W0 | ⬜ pending |
| 06-02-04 | 02 | 1 | AUDIO-05 | unit | `cd frontend && npx vitest run src/__tests__/sound-triggers.test.ts -x` | ❌ W0 | ⬜ pending |
| 06-02-05 | 02 | 1 | AUDIO-06 | unit | `cd frontend && npx vitest run src/__tests__/sound-triggers.test.ts -x` | ❌ W0 | ⬜ pending |
| 06-02-06 | 02 | 1 | AUDIO-07 | unit | `cd frontend && npx vitest run src/__tests__/sound-triggers.test.ts -x` | ❌ W0 | ⬜ pending |
| 06-02-07 | 02 | 1 | AUDIO-08 | unit | `cd frontend && npx vitest run src/__tests__/sound-triggers.test.ts -x` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `frontend/src/__tests__/sound-provider.test.tsx` — stubs for AUDIO-01, AUDIO-09
- [ ] `frontend/src/__tests__/sound-triggers.test.ts` — stubs for AUDIO-02 through AUDIO-08
- [ ] Howler.js mock in test setup (jsdom has no Web Audio API)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Sounds actually play correct audio | AUDIO-02-08 | Audio playback requires real browser | Open app, check habit, verify scouter beep plays |
| playbackRate variation audible | AUDIO-09 | Subtle pitch changes need human ear | Rapidly check/uncheck habits, listen for pitch variation |
| Mute toggle persists across sessions | AUDIO-01 | Requires backend integration | Toggle mute, refresh page, verify state persists |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
