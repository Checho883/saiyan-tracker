---
phase: 06-audio-system
plan: 01
subsystem: ui
tags: [howler, audio, web-audio-api, react-context, sprite-sheet]

requires:
  - phase: 05-dashboard-core-habit-management
    provides: uiStore animationQueue, AppShell layout, SettingsResponse.sound_enabled type
provides:
  - SoundProvider React Context with lazy Howl initialization
  - useAudio() hook with play(soundId), toggleMute(), isMuted
  - Sprite sound map with 13 sound IDs
  - Placeholder audio sprite file
  - Howler.js mock for test environment
affects: [06-audio-system, 07-animation-layer, 08-analytics-settings]

tech-stack:
  added: [howler 2.2.4, @types/howler]
  patterns: [React Context for audio, lazy audio init on user interaction, playbackRate variation]

key-files:
  created:
    - frontend/src/audio/soundMap.ts
    - frontend/src/audio/SoundProvider.tsx
    - frontend/src/audio/useAudio.ts
    - frontend/public/audio/sprite.mp3
    - frontend/src/__tests__/sound-provider.test.tsx
  modified:
    - frontend/src/components/layout/AppShell.tsx
    - frontend/src/test-setup.ts
    - frontend/package.json

key-decisions:
  - "React Context (not Zustand store) for audio — Howl is a mutable external resource managed via ref, not reactive state"
  - "Sound OFF by default — respectful of user context, user enables explicitly"
  - "Lazy Howl init on first play — respects browser autoplay policy"

patterns-established:
  - "Audio Context pattern: SoundProvider wraps AppShell, useAudio hook provides play/mute API"
  - "PlaybackRate variation: 0.9 + Math.random() * 0.2 on every play call"
  - "Howler.js mock: class-based mock in test-setup.ts with lastHowlInstance tracking"

requirements-completed: [AUDIO-01, AUDIO-09]

duration: 8min
completed: 2026-03-05
---

# Phase 6 Plan 01: Audio Infrastructure Summary

**SoundProvider context with Howler.js sprite sheet, useAudio hook, 13-sound sprite map, and playbackRate variation**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-05T17:30:00Z
- **Completed:** 2026-03-05T17:38:00Z
- **Tasks:** 6
- **Files modified:** 8

## Accomplishments
- Installed Howler.js with TypeScript definitions
- Created sprite sound map with 13 sound IDs covering all game events and UI interactions
- Built SoundProvider React Context with lazy Howl initialization (respects autoplay policy)
- Created useAudio hook exposing play(soundId), toggleMute(), isMuted
- Wrapped AppShell with SoundProvider
- Added Howler.js class-based mock to test-setup.ts for jsdom
- Created 6 unit tests for SoundProvider (all passing)

## Task Commits

1. **Task 1: Install Howler.js** - `efb60d0` (feat)
2. **Task 2: Create sprite sound map** - `83d0089` (feat)
3. **Task 3: Placeholder audio sprite** - `53a3565` (feat)
4. **Task 4: SoundProvider + useAudio** - `fba8ddc` (feat)
5. **Task 5: Wrap AppShell** - `290a1fb` (feat)
6. **Task 6: Tests + Howler mock** - `5a8d09d` (feat/test)

## Files Created/Modified
- `frontend/src/audio/soundMap.ts` - SoundId type, SPRITE_MAP offsets, SPRITE_SRC paths
- `frontend/src/audio/SoundProvider.tsx` - React Context with lazy Howl, playbackRate variation
- `frontend/src/audio/useAudio.ts` - Hook consuming AudioContext
- `frontend/public/audio/sprite.mp3` - Placeholder audio sprite
- `frontend/src/components/layout/AppShell.tsx` - Wrapped with SoundProvider
- `frontend/src/test-setup.ts` - Added class-based Howler.js mock
- `frontend/src/__tests__/sound-provider.test.tsx` - 6 tests for provider/hook
- `frontend/package.json` - Added howler, @types/howler

## Decisions Made
- Used React Context instead of Zustand for audio — Howl is mutable external state managed via useRef, not reactive state
- Sound OFF by default (isMuted starts true) per user decision
- Class-based mock for Howler.js (vi.fn().mockImplementation doesn't work as constructor in Vitest)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed Howler.js mock pattern**
- **Found during:** Task 6 (test creation)
- **Issue:** vi.fn().mockImplementation(() => ({...})) is not a valid constructor in Vitest 4.x
- **Fix:** Changed to class-based MockHowl with vi.fn() instance methods
- **Files modified:** frontend/src/test-setup.ts, frontend/src/__tests__/sound-provider.test.tsx
- **Verification:** All 6 tests pass
- **Committed in:** `5a8d09d` (Task 6 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Fix was necessary for test correctness. No scope creep.

## Issues Encountered
None beyond the mock pattern fix documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Audio infrastructure complete, ready for sound trigger wiring (Plan 02)
- SoundProvider accessible from all components via useAudio hook
- Placeholder sprite allows development; real sounds can replace it later

---
*Phase: 06-audio-system*
*Completed: 2026-03-05*
