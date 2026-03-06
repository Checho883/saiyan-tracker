# Phase 16: Settings, Forms & Audio Polish - Context

**Gathered:** 2026-03-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Expose all habit model capabilities in the frontend forms (archived habits list + restore, temporary habits with start/end dates, day picker UX improvements) and replace placeholder audio sprite with real sound effects. The backend already supports is_active, is_temporary, start_date, end_date, and custom_days — this phase is purely frontend form/UX work plus audio asset creation.

</domain>

<decisions>
## Implementation Decisions

### Archived Habits UX
- Add an "Archived Habits" section inside the existing Settings page (not a separate route)
- Each archived habit shows title + icon emoji + inline "Restore" button
- No confirmation dialog for restore — it's a safe action, user can re-archive if needed
- No extra metadata (no archived date, no streak info) — keep it minimal
- Backend already uses `is_active=false` for soft-delete; need a new API call to list inactive habits

### Temporary Habits Flow
- Add a "Temporary habit" toggle in the HabitForm under the frequency section
- When toggled on, reveal start date and end date pickers
- Start date defaults to today but user can pick a future date
- Habits with future start dates don't appear on dashboard until that date
- When end_date passes, the habit auto-hides from dashboard (silently — no notification)
- Expired temporary habits remain visible in analytics/calendar history
- Temporary habits show a subtle indicator on the dashboard HabitCard (small clock icon or "temp" badge)

### Day Picker Refinement
- Move frequency selection (Daily/Weekdays/Custom) OUT of "More options" to always be visible in the main form
- Day-of-week buttons become larger circular buttons with single-letter labels (M, T, W, T, F, S, S)
- Selected state uses saiyan-500 fill, unselected uses space-700 fill (iOS alarm picker style)
- Daily and Weekdays remain separate preset modes — selecting Weekdays does NOT show day buttons
- Custom mode shows the circular day picker
- Submit button disabled when frequency is "custom" and zero days are selected

### Audio Replacement
- Source real sound effects from free/royalty-free SFX libraries (freesound.org, mixkit, pixabay)
- Dragon Ball-inspired but not copyrighted DBZ audio
- Sound vibe: punchy and arcade-like — short, snappy, satisfying. Mobile game SFX feel. Power-up and transform can be slightly longer/dramatic
- Keep existing sprite sheet architecture (single combined file with Howler.js offset map)
- Generate both .mp3 and .webm formats (existing SPRITE_SRC already references both)
- All 13 sound IDs must have real, distinct audio: scouter_beep, power_up, capsule_pop, reveal_chime, explosion, radar_ping, thunder_roar, transform, swoosh, modal_open, modal_close, undo, error_tone
- Update SPRITE_MAP offsets to match new compiled sprite sheet

### Claude's Discretion
- Exact date picker component choice (native HTML date input vs library)
- Temporary habit badge visual design details
- Audio file selection from free libraries (specific sounds per ID)
- Sprite sheet compilation tooling (ffmpeg, audiosprite, etc.)
- Empty state for archived habits section when none exist

</decisions>

<specifics>
## Specific Ideas

- Day picker buttons should feel like iOS alarm day-of-week selector — circular, clear, satisfying tap targets
- Frequency is a core choice that shouldn't be hidden — users need to see it immediately
- Archived habits section is low-traffic; keep it simple and out of the way in Settings
- Audio should feel like a mobile game — clear feedback without being annoying or distracting from the productivity focus

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `HabitForm.tsx`: Already has frequency selector + custom day buttons — needs restructuring, not rewriting
- `DeleteConfirmDialog.tsx`: Pattern for confirmation dialogs (not needed for restore, but reference for consistency)
- `PreferencesSection.tsx`, `CategorySection.tsx`, `RewardSection.tsx`: Existing Settings sections — archived habits section follows same pattern
- `EmptyState.tsx`: Can reuse for empty archived habits list
- `SoundProvider.tsx` + `useAudio.ts` + `useSoundEffect.ts`: Complete audio system already wired up with Howler.js
- `soundMap.ts`: 13 SoundIds defined with SPRITE_MAP offsets — just needs real values

### Established Patterns
- Settings page uses collapsible sections (`CollapsibleSection.tsx`)
- Forms use bottom sheet pattern (`HabitFormSheet.tsx`, `CategoryFormSheet.tsx`)
- Button groups use flex gap with conditional saiyan-500/space-700 styling
- State management via Zustand stores (`habitStore`, `rewardStore`)

### Integration Points
- `habitStore.ts`: Needs new actions for listing archived habits and restoring (PATCH is_active=true)
- `backend/app/api/v1/habits.py`: Currently filters `is_active==True` — needs endpoint for inactive habits
- `HabitForm.tsx`: Add temporary toggle + date fields, restructure frequency out of "More options"
- `frontend/public/audio/`: Replace sprite.mp3, add sprite.webm
- `soundMap.ts`: Update SPRITE_MAP offsets after recompilation
- Dashboard habit filtering: Must respect start_date/end_date for temporary habits

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 16-settings-forms-audio-polish*
*Context gathered: 2026-03-07*
