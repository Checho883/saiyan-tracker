---
phase: 06-audio-system
plan: 02
subsystem: ui
tags: [howler, audio, zustand, animation-events, sound-triggers]

requires:
  - phase: 06-audio-system
    provides: SoundProvider, useAudio hook, soundMap
provides:
  - useSoundEffect hook mapping 7 animation events to sound IDs
  - SoundEffectListener auto-subscriber mounted in SoundProvider
  - HabitCard undo sound on uncheck
  - BottomTabBar persistent mute toggle icon
affects: [07-animation-layer, 08-analytics-settings]

tech-stack:
  added: []
  patterns: [event-driven sound triggers, animation queue subscription]

key-files:
  created:
    - frontend/src/audio/useSoundEffect.ts
    - frontend/src/__tests__/sound-triggers.test.ts
  modified:
    - frontend/src/audio/SoundProvider.tsx
    - frontend/src/components/dashboard/HabitCard.tsx
    - frontend/src/components/layout/BottomTabBar.tsx
    - frontend/src/__tests__/routing.test.tsx
    - frontend/src/__tests__/dashboard-habits.test.tsx

key-decisions:
  - "xp_popup event maps to scouter_beep — habit check always produces xp_popup, so this is the habit check sound"
  - "Undo sound triggered directly in HabitCard (not via animation queue) because unchecking produces no animation events"
  - "Sound icon in BottomTabBar is a button (not NavLink) — visually consistent but functionally separate from navigation"

patterns-established:
  - "Event-to-sound mapping: EVENT_SOUND_MAP in useSoundEffect.ts maps AnimationEvent types to SoundId"
  - "prevLengthRef tracking: only play sounds for NEW queue additions, not replay old events"
  - "useAudio mock pattern: vi.mock('../audio/useAudio') returning play/toggleMute/isMuted for non-audio tests"

requirements-completed: [AUDIO-02, AUDIO-03, AUDIO-04, AUDIO-05, AUDIO-06, AUDIO-07, AUDIO-08]

duration: 5min
completed: 2026-03-05
---

# Phase 6 Plan 02: Sound Triggers & Mute Toggle Summary

**useSoundEffect wiring for all 7 game events, HabitCard undo sound, and BottomTabBar mute toggle icon**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-05T17:36:00Z
- **Completed:** 2026-03-05T17:41:00Z
- **Tasks:** 6
- **Files modified:** 7

## Accomplishments
- Created useSoundEffect hook mapping all 7 animation event types to sound IDs
- Mounted SoundEffectListener inside SoundProvider for automatic event subscription
- Added undo sound trigger in HabitCard for habit uncheck
- Added persistent speaker icon (Volume2/VolumeX) mute toggle in BottomTabBar
- Created 11 sound-triggers tests (all passing)
- Fixed existing routing and dashboard tests with useAudio mock
- All 53 tests pass across 10 test files

## Task Commits

1. **Task 1: useSoundEffect hook** - `9fdc056` (feat)
2. **Task 2: SoundEffectListener in SoundProvider** - `67e24d7` (feat)
3. **Task 3: HabitCard undo sound** - `707ab35` (feat)
4. **Task 4: BottomTabBar mute toggle** - `3d557fc` (feat)
5. **Task 5-6: Tests + existing test fixes** - `fc97aa6` (feat/test)

## Files Created/Modified
- `frontend/src/audio/useSoundEffect.ts` - Event-to-sound mapping with queue subscription
- `frontend/src/audio/SoundProvider.tsx` - Added SoundEffectListener component
- `frontend/src/components/dashboard/HabitCard.tsx` - Added undo sound on uncheck
- `frontend/src/components/layout/BottomTabBar.tsx` - Added speaker icon mute toggle
- `frontend/src/__tests__/sound-triggers.test.ts` - 11 tests for event mapping
- `frontend/src/__tests__/routing.test.tsx` - Added useAudio mock
- `frontend/src/__tests__/dashboard-habits.test.tsx` - Added useAudio mock

## Decisions Made
- Mapped xp_popup to scouter_beep because habit check always triggers xp_popup event
- Undo sound triggered directly in HabitCard.handleTap (not via animation queue)
- Sound icon is a button element, not a NavLink, to separate it from navigation

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added useAudio mock to existing tests**
- **Found during:** Task 6 (full test suite)
- **Issue:** routing.test.tsx and dashboard-habits.test.tsx render BottomTabBar/HabitCard which now use useAudio, causing "useAudio must be used within SoundProvider" errors
- **Fix:** Added `vi.mock('../audio/useAudio')` to both test files
- **Files modified:** frontend/src/__tests__/routing.test.tsx, frontend/src/__tests__/dashboard-habits.test.tsx
- **Verification:** All 53 tests pass
- **Committed in:** `fc97aa6` (Task 5-6 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Fix was necessary — adding useAudio to existing components requires mocking in their tests. No scope creep.

## Issues Encountered
None beyond the test mock fix documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Audio system fully wired: every game event and habit uncheck plays a sound
- Mute toggle accessible from BottomTabBar
- Phase 7 (Animation Layer) can trigger reveal_chime via useAudio().play('reveal_chime') when capsule reveal animation is built
- Phase 8 (Settings) can wire sound_enabled persistence to backend

---
*Phase: 06-audio-system*
*Completed: 2026-03-05*
