# Phase 16: Settings, Forms & Audio Polish — Research

**Researched:** 2026-03-07
**Status:** Complete

## Phase Boundary

Phase 16 delivers four capabilities:
1. **Archived habits** — view/restore inactive habits from Settings (HMGT-03)
2. **Temporary habits** — create habits with start/end dates via toggle in HabitForm (HMGT-04)
3. **Day picker refinement** — circular day-of-week buttons, frequency visible in main form (HMGT-05)
4. **Real audio sprite** — replace placeholder sounds with real SFX files (TECH-02)

Requirements: HMGT-03, HMGT-04, HMGT-05, TECH-02

## Codebase Analysis

### Archived Habits (HMGT-03)

**Backend:**
- `Habit.is_active` already exists (soft-delete pattern). `DELETE /habits/{id}` sets `is_active=False`.
- Current `GET /habits/` filters `is_active==True` — no way to fetch archived habits.
- Need: New `GET /habits/archived` endpoint returning `is_active==False` habits.
- Need: `PATCH /habits/{id}/restore` or reuse `PUT /habits/{id}` with `{is_active: true}`.
- The `HabitUpdate` schema already has `is_active: bool | None = None`, so `PUT /habits/{id}` with `{is_active: true}` works. But `_get_active_habit()` helper filters `is_active==True`, so updating an archived habit via PUT would 404. Need a new helper or bypass.
- Simplest: Add `GET /habits/archived` (list inactive) + `PUT /habits/{id}/restore` (set is_active=True).

**Frontend:**
- `habitsApi` needs `listArchived()` and `restoreHabit(id)` methods.
- Settings page uses `CollapsibleSection` pattern — add "Archived Habits" section with Archive icon.
- Each item shows: icon_emoji + title + "Restore" button.
- `EmptyState` component available for zero-archived-habits state.
- No store needed for archived habits — it's a read-and-action view, not live state. Can use local component state with API calls.

### Temporary Habits (HMGT-04)

**Backend:**
- `Habit` model already has `is_temporary`, `start_date`, `end_date` fields.
- `HabitCreate` schema accepts `is_temporary`, `start_date`, `end_date`.
- `get_habits_due_on_date()` already filters by `start_date <=` and `end_date` exclusion.
- Backend is COMPLETE for temporary habits. This is purely a frontend task.

**Frontend:**
- `HabitForm.tsx` currently sends `start_date: today` hardcoded in createHabit.
- Need: Toggle "Temporary habit" (below frequency or after category).
- When toggled on: show start_date and end_date date pickers.
- `start_date` defaults to today but user can change.
- `end_date` required when temporary is toggled on.
- Need to pass `is_temporary`, `start_date`, `end_date` to createHabit/updateHabit.
- HabitCard should show a subtle indicator for temporary habits — context says "small clock icon or temp badge".
- `HabitTodayResponse` already includes `is_temporary`, `start_date`, `end_date`.

**Date Picker:**
- Native HTML `<input type="date">` is simplest — matches existing `<input type="time">` pattern for target_time.
- No library needed. Works well on mobile browsers.

### Day Picker Refinement (HMGT-05)

**Current state (HabitForm.tsx):**
- Frequency selector is inside `showMore` (hidden behind "More options" toggle).
- Custom day buttons use `flex gap-1`, 3-letter labels (Mon, Tue, Wed...), small `py-1.5 rounded text-xs`.
- Selected state: `bg-saiyan-500 text-white`. Unselected: `bg-space-700 text-text-secondary`.

**Required changes (from CONTEXT.md):**
- Move frequency section OUT of "More options" to always-visible main form.
- Day buttons: larger circular buttons with single-letter labels (M, T, W, T, F, S, S).
- Selected: `saiyan-500` fill. Unselected: `space-700` fill. (iOS alarm picker style)
- Daily/Weekdays remain preset modes — Custom shows day picker.
- Submit disabled when frequency=custom and customDays.length===0.

**Implementation:**
- Move the frequency `<div>` block from inside `{showMore && ...}` to the main form area (after Category).
- Change `DAY_LABELS` from `['Mon', 'Tue', ...]` to `['M', 'T', 'W', 'T', 'F', 'S', 'S']`.
- Make buttons circular: `w-9 h-9 rounded-full` instead of `flex-1 py-1.5 rounded`.
- Add submit button disabled condition: `frequency === 'custom' && customDays.length === 0`.

### Audio Sprite Replacement (TECH-02)

**Current state:**
- `frontend/public/audio/sprite.mp3` exists (placeholder).
- No `sprite.webm` exists yet.
- `soundMap.ts` has 13 SoundIds with placeholder offsets.
- `SoundProvider.tsx` uses Howler.js with sprite map, supports both `.webm` and `.mp3` via `SPRITE_SRC`.

**Requirements:**
- Source 13 real, distinct sound effect files (royalty-free).
- Concatenate into a single audio sprite file.
- Generate both `.mp3` and `.webm` formats.
- Update `SPRITE_MAP` offsets to match compiled sprite.

**Approach:**
- Use `ffmpeg` (available via npm audiosprite or direct CLI) to compile individual .wav/.mp3 files into a sprite.
- The executor will need to either:
  a) Generate synthetic sounds using ffmpeg's built-in audio synthesis (sine waves, noise, filters), or
  b) Download free SFX from a royalty-free source.
- Option (a) is more reliable for CI/automation and avoids licensing concerns.
- ffmpeg can create convincing game-style SFX using: `aevalsrc` for tones, `anoisesrc` for noise, pitch shifts, fades, tremolo.

**Sound Design Plan (all under 3s, punchy arcade feel):**

| SoundId | Duration | Description | ffmpeg approach |
|---------|----------|-------------|-----------------|
| scouter_beep | 400ms | Short electronic beep, rising pitch | Sine sweep 800->1600Hz |
| power_up | 1000ms | Rising energy whoosh | Noise + sine sweep + tremolo |
| capsule_pop | 300ms | Quick pop/click | Short burst noise with sharp attack |
| reveal_chime | 500ms | Bright chime/bell | Dual sine harmonics with decay |
| explosion | 1500ms | Low boom + crackle | Low freq sine + noise burst + fade |
| radar_ping | 600ms | Sonar-style ping | Sine pulse with echo/delay |
| thunder_roar | 2000ms | Rolling thunder | Low noise with tremolo + fade |
| transform | 2500ms | Dramatic power surge | Rising sweep + layered harmonics |
| swoosh | 200ms | Quick air movement | Shaped noise with fast fade |
| modal_open | 150ms | UI click/slide up | Quick high sine tap |
| modal_close | 150ms | UI click/slide down | Quick descending sine tap |
| undo | 250ms | Reverse/rewind feel | Descending two-tone |
| error_tone | 200ms | Negative buzz/beep | Dissonant dual sine |

**Compilation:**
1. Generate each sound as individual WAV via ffmpeg.
2. Concatenate with 100ms silence gaps.
3. Export as `.mp3` (192kbps) and `.webm` (opus codec).
4. Calculate offsets and update `SPRITE_MAP`.

## Dependency Analysis

- HMGT-03 (archived habits): Needs a new backend endpoint + frontend section. Independent.
- HMGT-04 (temporary habits): Purely frontend HabitForm changes. Independent.
- HMGT-05 (day picker): Purely frontend HabitForm changes. Overlaps with HMGT-04 (both modify HabitForm.tsx).
- TECH-02 (audio): Purely frontend/asset work. Independent.

**File overlap:** HMGT-04 and HMGT-05 both modify `HabitForm.tsx`. They should be in the same plan to avoid conflicts.

## Wave Assignment

- **Wave 1:** Plan 01 (Forms: HMGT-04 + HMGT-05 in HabitForm + HabitCard temp indicator) AND Plan 02 (Archived Habits: HMGT-03 backend endpoint + Settings section)
- **Wave 2:** Plan 03 (Audio: TECH-02 — fully independent, separate wave because it involves ffmpeg operations that are time-intensive and don't overlap with any form files)

Actually, since Plan 01 and Plan 02 have no file overlap, they can all be Wave 1. Plan 03 (audio) also has no file overlap. All three can be Wave 1.

**Revised: All 3 plans can be Wave 1** — zero file overlap between any of them.

## Validation Architecture

### Critical Behaviors to Verify
1. Archived habits list loads in Settings and Restore button re-activates habit
2. Temporary habit toggle reveals date pickers, habit auto-hides after end_date
3. Day picker circular buttons visible in main form (not behind "More options")
4. All 13 sounds produce distinct, audible audio (not silence/identical)

### Testing Strategy
- Backend: pytest for `GET /habits/archived` and `PUT /habits/{id}/restore`
- Frontend: TypeScript compilation check + existing test suite
- Audio: Manual verification that sprite.mp3 and sprite.webm exist with non-zero sizes and SPRITE_MAP offsets are updated

---

## RESEARCH COMPLETE
