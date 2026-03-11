---
phase: 22-feedback-gaps-shareable-summary
plan: 01
subsystem: ui
tags: [react, animation, feedback, css-keyframes, zustand]

requires:
  - phase: 05-dashboard-core
    provides: XpPopup, AuraGauge, HabitCard components
  - phase: 17-status-roast
    provides: StatusResponse type, RoastWelcomeCard dismiss pattern
provides:
  - Negative XP popup variant with red downward animation
  - StreakBreakCard component for overnight streak-break acknowledgment
  - StreakBreak type and streak_breaks field on StatusResponse
  - xp-sink CSS keyframe for downward float animation
affects: [dashboard, feedback-ux]

tech-stack:
  added: []
  patterns: [negative-variant-prop, dismissible-card-pattern]

key-files:
  created:
    - frontend/src/components/dashboard/StreakBreakCard.tsx
    - frontend/src/__tests__/negative-xp-popup.test.tsx
    - frontend/src/__tests__/streak-break-card.test.tsx
  modified:
    - frontend/src/types/index.ts
    - frontend/src/components/dashboard/XpPopup.tsx
    - frontend/src/components/dashboard/HabitCard.tsx
    - frontend/src/components/dashboard/AuraGauge.tsx
    - frontend/src/index.css
    - frontend/src/pages/Dashboard.tsx

key-decisions:
  - "No additional sound on uncheck — undo sound is sufficient per user decision"
  - "AuraGauge transition changed from 700ms to 500ms per user decision"

patterns-established:
  - "Negative variant via boolean prop: XpPopup negative prop toggles color, position, animation, prefix"
  - "Dismissible card pattern: session-only useState dismiss, same as RoastWelcomeCard"

requirements-completed: [FDBK-01, FDBK-02, FDBK-03]

duration: 8min
completed: 2026-03-11
---

# Plan 22-01: Negative Feedback UX Summary

**Red negative XP popup on uncheck, streak-break Zenkai card on dashboard load, AuraGauge 500ms shrink transition**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-11T12:24:00Z
- **Completed:** 2026-03-11T12:32:00Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- XpPopup renders red downward-floating "-{amount} {ATTR} XP" on uncheck with negative=true prop
- HabitCard triggers negative popup on uncheck when attribute_xp_awarded > 0
- AuraGauge shrink transition adjusted to 500ms for snappier feel
- StreakBreakCard renders above habit list on dashboard load when streak breaks present
- Card shows Zenkai orange theme, lists each broken streak, dismissible via X or "Get Back Up" CTA
- power_up sound plays when streak-break card appears

## Task Commits

Each task was committed atomically:

1. **Task 1: Negative XP popup variant + AuraGauge timing + type sync** - `00dc44a` (feat)
2. **Task 2: Streak-break acknowledgment card** - `3ef1c91` (feat)

## Files Created/Modified
- `frontend/src/types/index.ts` - Added StreakBreak interface and streak_breaks to StatusResponse
- `frontend/src/components/dashboard/XpPopup.tsx` - Added negative prop with red text, -bottom-2 position, xp-sink animation
- `frontend/src/components/dashboard/HabitCard.tsx` - Triggers negative XP popup on uncheck path
- `frontend/src/components/dashboard/AuraGauge.tsx` - Transition 700ms -> 500ms
- `frontend/src/index.css` - Added xp-sink keyframe (downward float)
- `frontend/src/components/dashboard/StreakBreakCard.tsx` - New dismissible streak-break card
- `frontend/src/pages/Dashboard.tsx` - Wired StreakBreakCard between RoastWelcomeCard and HeroSection
- `frontend/src/__tests__/negative-xp-popup.test.tsx` - 4 tests for negative XP popup variant
- `frontend/src/__tests__/streak-break-card.test.tsx` - 6 tests for streak-break card
- `frontend/src/__tests__/aura-gauge.test.tsx` - Extended with 500ms transition test

## Decisions Made
- No additional sound on uncheck — undo sound at line 84 is sufficient per user decision
- AuraGauge transition 500ms per user decision (was 700ms)

## Deviations from Plan
None - plan executed exactly as written

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Negative feedback loop complete for uncheck events
- Streak-break acknowledgment ready (requires backend to populate streak_breaks in StatusResponse)
- Ready for Plan 22-02 (milestone celebrations + shareable summary)

---
*Phase: 22-feedback-gaps-shareable-summary*
*Completed: 2026-03-11*
