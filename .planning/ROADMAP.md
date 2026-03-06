# Roadmap: Saiyan Tracker v3

## Overview

This roadmap delivers a Dragon Ball Z-themed habit tracker optimized for ADHD dopamine loops. The build follows a strict bottom-up dependency chain: database models and game constants first, then service-layer game logic, then API routes, then frontend state/stores, then the data-connected dashboard UI, then audio and animation layered on top, then analytics and settings pages. Every phase delivers a verifiable capability that the next phase builds on. The architectural centerpiece is `check_habit()` -- a single atomic transaction that computes all game-state side effects -- and everything else radiates outward from it.

## Milestones

- ✅ **v1.0 Backend Foundation** — Phases 1-3 (shipped 2026-03-04)
- 🚧 **v1.1 The Dopamine Layer** — Phases 4-8 (in progress)

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

<details>
<summary>✅ v1.0 Backend Foundation (Phases 1-3) — SHIPPED 2026-03-04</summary>

- [x] Phase 1: Database and Model Integrity (2/2 plans) — completed 2026-03-04
- [x] Phase 2: Core Game Logic Services (3/3 plans) — completed 2026-03-04
- [x] Phase 3: API Routes and Schemas (2/2 plans) — completed 2026-03-04

</details>

### 🚧 v1.1 The Dopamine Layer (Phases 4-8)

**Milestone Goal:** Build the complete frontend experience -- every habit check triggers sound, visual feedback, and dopamine-rewarding animations on top of the v1.0 backend.

- [x] **Phase 4: Project Setup & Foundation** - React 19 + Vite 7 scaffold, TypeScript types, API client, Zustand stores, dark theme, routing (completed 2026-03-05)
- [ ] **Phase 5: Dashboard Core & Habit Management** - Habit list with check/uncheck, aura bar, attributes, Dragon Balls, avatar, streaks, quotes, XP popup, habit CRUD
- [ ] **Phase 6: Audio System** - SoundProvider with Howler.js sprite sheet, sound effects on every interaction, global mute toggle
- [ ] **Phase 7: Animation Layer** - Animation queue, tier-change flash, Perfect Day explosion, capsule reveal, Dragon Ball trajectory, transformation, Shenron ceremony
- [x] **Phase 8: Analytics & Settings** - Calendar heatmap, progression charts, summary stats, rewards/wishes/categories CRUD, off-day management, preferences (completed 2026-03-05)
- [x] **Phase 9: Cross-Phase Integration Fixes** - Fix SoundProvider settings sync, powerStore transformationName staleness, capsule reveal chime wiring (completed 2026-03-05)
- [x] **Phase 10: Milestone Verification & Housekeeping** - Create Phase 7/8 VERIFICATION.md, fix SUMMARY frontmatter, update REQUIREMENTS.md checkboxes (completed 2026-03-06)

## Phase Details

### Phase 4: Project Setup & Foundation
**Goal**: A working React 19 SPA scaffold with typed API client, Zustand stores, dark theme, and routing -- so all subsequent phases build components on a verified foundation
**Depends on**: Phase 3
**Requirements**: STATE-01, STATE-02, STATE-03, STATE-04, STATE-05, STATE-06
**Success Criteria** (what must be TRUE):
  1. Running `npm run dev` serves a React 19 SPA at localhost:5173 with Vite 7 hot reload, Tailwind CSS v4 styling, and working page routing between Dashboard, Analytics, and Settings views
  2. TypeScript types in `types/index.ts` match all backend API response schemas and the API client layer successfully calls all 9 backend endpoints with typed request/response (verified by fetching today's habits from a running backend)
  3. Four Zustand stores (habitStore, powerStore, rewardStore, uiStore) hold client state with selector discipline -- `useShallow` used for multi-value selections, no bare `useStore()` calls
  4. Dark theme is applied by default with DBZ color tokens (deep space background, glowing borders, orange/blue accents) via CSS custom properties in Tailwind v4 `@theme` config
**Plans**: 2 plans in 2 waves

Plans:
- [ ] 04-01-PLAN.md — Vite 7 scaffold, Tailwind v4 dark theme, TypeScript types, ky API client
- [ ] 04-02-PLAN.md — Zustand stores, useInitApp hydration, React Router 7 routing, AppShell + BottomTabBar + LoadingScreen

### Phase 5: Dashboard Core & Habit Management
**Goal**: Users can view all their habits, check them off with optimistic UI, and see every game-state display (aura %, attributes, Dragon Balls, avatar, streaks, quotes, XP popup) update from real backend data -- plus create, edit, and delete habits
**Depends on**: Phase 4
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, DASH-06, DASH-07, DASH-08, DASH-09, DASH-10, DASH-11, DASH-12, DASH-13
**Success Criteria** (what must be TRUE):
  1. User can see all active habits grouped by category, check/uncheck a habit with optimistic UI toggle (instant visual feedback with rollback on API error), and see an XP popup float up from the habit card showing "+N [ATTR] XP" in attribute color
  2. Daily aura progress bar animates from 0% to current completion with spring physics and displays tier label (Kaio-ken x3/x10/x20) updating at 50%/80%/100% thresholds
  3. Four RPG attribute bars (STR/VIT/INT/KI) display current level and XP fill, Dragon Ball tracker shows 7 slots with glowing filled balls, and streak display shows current/best streak with visual scaling
  4. Saiyan avatar displays the current transformation form with form-appropriate aura effect, shows power level in scouter-style display, and shows progress bar to next form
  5. User can create a new habit via modal (title, description, importance, attribute, frequency, category), edit and delete existing habits, and see a character quote with avatar and attribution after each habit check
**Plans**: 4 plans in 3 waves

Plans:
- [ ] 05-01-PLAN.md — Test scaffolds + habit list/cards with check/uncheck, XP popup, character quotes, streaks
- [ ] 05-02-PLAN.md — Hero section (avatar, scouter HUD, aura gauge) + stats panel (attributes, Dragon Balls, streaks)
- [ ] 05-03-PLAN.md — Dashboard page orchestration + habit CRUD (Vaul bottom sheet, form, delete)
- [ ] 05-04-PLAN.md — Visual verification checkpoint for all 13 DASH requirements

### Phase 6: Audio System
**Goal**: Every user interaction produces a sound effect -- the app is never silent when something happens
**Depends on**: Phase 5
**Requirements**: AUDIO-01, AUDIO-02, AUDIO-03, AUDIO-04, AUDIO-05, AUDIO-06, AUDIO-07, AUDIO-08, AUDIO-09
**Success Criteria** (what must be TRUE):
  1. SoundProvider context wraps the app with a single Howler.js sprite sheet loaded at mount, providing a `useAudio().play(soundId)` hook and a global sound toggle that mutes/unmutes all audio
  2. Habit check plays scouter beep, tier change plays power-up burst, capsule drop plays capsule pop + reveal chime, and Perfect Day plays explosion/SSJ scream -- each sound fires at the correct moment
  3. Dragon Ball earned plays radar ping, Shenron ceremony plays thunder + roar, transformation plays power-up sequence, and all sounds use playbackRate variation (0.9-1.1) to prevent monotony on repeated interactions
**Plans**: TBD

Plans:
- [ ] 06-01: TBD

### Phase 7: Animation Layer
**Goal**: Major game events (tier change, Perfect Day, capsule drop, Dragon Ball earned, transformation, Shenron) play choreographed sequential animations that make the app feel like a game
**Depends on**: Phase 6
**Requirements**: ANIM-01, ANIM-02, ANIM-03, ANIM-04, ANIM-05, ANIM-06, ANIM-07, ANIM-08, ANIM-09
**Success Criteria** (what must be TRUE):
  1. Animation queue in uiStore enforces sequential playback -- when a habit check triggers multiple events (XP popup, tier change, capsule, transformation), they play one after another via AnimatePresence mode="wait", never simultaneously
  2. Perfect Day (100%) plays a choreographed 2-3s full-screen sequence (overlay, screen shake, particles, "100% COMPLETE" text, XP counter, quote, fadeout) and tier change flashes a brief banner ("Kaio-ken x3!") at 50%/80% thresholds
  3. Capsule drop bounces in with scale spring and pulses to invite tap; capsule reveal plays 3D card flip (rotateY) showing reward with rarity-appropriate glow (white/blue/purple for common/rare/epic)
  4. New Dragon Ball earned flies into tracker slot with trajectory animation; transformation unlock plays form-specific visual (golden flash SSJ, lightning SSJ2, red SSG, blue SSB, silver UI) with avatar swap
  5. Shenron ceremony plays full-screen sequence (sky darkens, lightning, Shenron scales up, wish prompt, balls scatter, reset) and enforces minimum 1 active wish before allowing completion
**Plans**: 2 plans in 2 waves

Plans:
- [x] 07-01-PLAN.md — Animation infrastructure: motion install, AnimationPlayer queue consumer with AnimatePresence mode="wait", TierChangeBanner inline animation, shared utilities (springs, shake, particles, skip hook), MotionConfig reducedMotion="user" (completed 2026-03-05)
- [x] 07-02-PLAN.md — Animation overlays: PerfectDayOverlay, CapsuleDropOverlay, DragonBallTrajectory, TransformationOverlay, ShenronCeremony wired into AnimationPlayer dispatcher with tap-to-skip and wish enforcement (completed 2026-03-05)

### Phase 8: Analytics & Settings
**Goal**: Users can review their habit history through visual analytics and manage all app configuration (rewards, wishes, categories, preferences, off-days)
**Depends on**: Phase 5
**Requirements**: ANLYT-01, ANLYT-02, ANLYT-03, ANLYT-04, ANLYT-05, SET-01, SET-02, SET-03, SET-04, SET-05, SET-06, SET-07
**Success Criteria** (what must be TRUE):
  1. Calendar heatmap displays days with 4-color coding (gold 100%, blue 75-99%, red 50-74%, gray <50%) with blue outline for off-days, and user can navigate by month with prev/next controls
  2. Attribute progression area chart shows STR/VIT/INT/KI growth over time with period selector (week/month/all), power level line chart shows cumulative XP progression, and summary stat cards display perfect days count, average %, total XP, and longest streak
  3. User can toggle sound effects on/off, switch between dark and light theme, set display name, and mark an off-day with reason selection -- all persisted via backend
  4. User can CRUD capsule rewards with rarity assignment and distribution stats, CRUD Shenron wishes with active toggle and times-wished count, and manage categories (name, color, emoji)
**Plans**: TBD

Plans:
- [x] 08-01-PLAN.md — Analytics page with recharts, calendar heatmap, stat cards, attribute/power charts, neon glow SVG filters (completed 2026-03-05)
- [x] 08-02-PLAN.md — Settings page with preferences (sound/theme/name/off-day), CRUD sections for rewards/wishes/categories via bottom sheet forms, useTheme hook, HeroSection display name (completed 2026-03-05)

### Phase 9: Cross-Phase Integration Fixes
**Goal**: Fix 3 integration bugs identified by milestone audit that break user-visible behavior — sound preference persistence, stale transformation name, and missing capsule reveal chime
**Depends on**: Phase 8
**Requirements**: SET-01, AUDIO-01, AUDIO-04, DASH-04
**Gap Closure:** Closes integration gaps from v1.1 audit
**Success Criteria** (what must be TRUE):
  1. SoundProvider reads `rewardStore.settings.sound_enabled` on mount and syncs mute state — sound preference persists across page loads
  2. `powerStore.updateFromCheck` updates `transformationName` alongside `transformation` — ScouterHUD shows correct form name immediately after transformation
  3. CapsuleDropOverlay tap handler calls `play('reveal_chime')` during card-flip reveal — capsule open is no longer silent
**Plans**: 1 plan in 1 wave

Plans:
- [ ] 09-01-PLAN.md — Fix SoundProvider settings sync, powerStore transformationName staleness, CapsuleDropOverlay reveal chime wiring

### Phase 10: Milestone Verification & Housekeeping
**Goal**: Close all verification gaps from v1.1 audit — create missing VERIFICATION.md for Phases 7 and 8, fix Phase 7 SUMMARY frontmatter, and update all stale REQUIREMENTS.md checkboxes
**Depends on**: Phase 9
**Requirements**: ANIM-01, ANIM-02, ANIM-03, ANIM-04, ANIM-05, ANIM-06, ANIM-07, ANIM-08, ANIM-09, ANLYT-01, ANLYT-02, ANLYT-03, ANLYT-04, ANLYT-05, SET-01, SET-02, SET-03, SET-04, SET-05, SET-06, SET-07
**Gap Closure:** Closes verification gaps from v1.1 audit
**Success Criteria** (what must be TRUE):
  1. Phase 7 VERIFICATION.md exists and confirms ANIM-01..09 against actual code
  2. Phase 8 VERIFICATION.md exists and confirms ANLYT-01..05, SET-01..07 against actual code
  3. Phase 7 SUMMARY frontmatter `requirements_completed` arrays are populated
  4. REQUIREMENTS.md checkboxes reflect verified state — DASH-01..13, AUDIO-01..09 are `[x]`; ANIM and ANLYT/SET updated based on verification results
**Plans**: TBD

Plans:
- [x] 10-01-PLAN.md — Verification documents, SUMMARY frontmatter fixes, REQUIREMENTS.md updates (completed 2026-03-06)

## Progress

**Execution Order:**
Phases execute in numeric order: 4 → 5 → 6 → 7 → 8
Note: Phase 8 depends on Phase 5 (not Phase 7), so Phases 6/7 and 8 could theoretically overlap, but sequential execution is simpler.

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Database and Model Integrity | v1.0 | 2/2 | Complete | 2026-03-04 |
| 2. Core Game Logic Services | v1.0 | 3/3 | Complete | 2026-03-04 |
| 3. API Routes and Schemas | v1.0 | 2/2 | Complete | 2026-03-04 |
| 4. Project Setup & Foundation | 4/4 | Complete   | 2026-03-05 | - |
| 5. Dashboard Core & Habit Management | v1.1 | 4/4 | Complete | 2026-03-05 |
| 6. Audio System | v1.1 | 1/1 | Complete | 2026-03-05 |
| 7. Animation Layer | v1.1 | 2/2 | Complete | 2026-03-05 |
| 8. Analytics & Settings | v1.1 | 2/2 | Complete | 2026-03-05 |
| 9. Cross-Phase Integration Fixes | v1.1 | 1/1 | Complete | 2026-03-05 |
| 10. Milestone Verification & Housekeeping | v1.1 | 1/1 | Complete | 2026-03-06 |
