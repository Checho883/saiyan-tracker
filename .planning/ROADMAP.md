# Roadmap: Saiyan Tracker v3

## Overview

This roadmap delivers a Dragon Ball Z-themed habit tracker optimized for ADHD dopamine loops. The build follows a strict bottom-up dependency chain: database models and game constants first, then service-layer game logic, then API routes, then frontend state/stores, then the data-connected dashboard UI, then audio and animation layered on top, then analytics and settings pages, and finally the quote system and polish pass. Every phase delivers a verifiable capability that the next phase builds on. The architectural centerpiece is `check_habit()` -- a single atomic transaction that computes all game-state side effects -- and everything else radiates outward from it.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Database and Model Integrity** - SQLAlchemy models, constants, migrations, and the data contract that prevents XP drift and timezone bugs
- [ ] **Phase 2: Core Game Logic Services** - The check_habit() atomic transaction and all game mechanics as testable Python functions
- [ ] **Phase 3: API Routes and Schemas** - FastAPI endpoints wrapping services, testable via Swagger before any frontend exists
- [ ] **Phase 4: Frontend State Layer** - Zustand stores, typed API client, TypeScript types matching backend schemas
- [ ] **Phase 5: Dashboard UI** - Data-connected dashboard with habit cards, aura bar, avatar, attributes, Dragon Balls, streaks
- [ ] **Phase 6: Audio and Animation Layer** - SoundProvider, animation queue, Perfect Day explosion, Shenron ceremony, all sound effects
- [ ] **Phase 7: Analytics and Settings Pages** - Calendar heatmap, progression charts, summary stats, rewards/wishes/category management
- [ ] **Phase 8: Quote System and Polish** - 100+ seeded quotes, trigger routing, Vegeta escalation, streak milestones, transformation visuals

## Phase Details

### Phase 1: Database and Model Integrity
**Goal**: All data models exist with correct relationships, constraints, and indexes; the XP constants and transformation thresholds are defined as the single source of truth; date logic uses client-supplied local_date
**Depends on**: Nothing (first phase)
**Requirements**: DB-01, DB-02, DB-03, DB-04, DB-05, DB-06, DB-07, DB-08
**Success Criteria** (what must be TRUE):
  1. All 15 database tables can be created from SQLAlchemy models and queried without errors
  2. UniqueConstraints on (habit_id, log_date) and (user_id, log_date) reject duplicate entries
  3. constants.py contains all XP values, tier multipliers, and 10 transformation thresholds as importable Python values
  4. Quote seed data populates 100+ quotes with character, source_saga, trigger_event, transformation_level, and severity fields
  5. All date columns store YYYY-MM-DD strings (not DATETIME) and models accept local_date from external input
**Plans**: 2 plans

Plans:
- [ ] 01-01-PLAN.md — Database infrastructure, config, constants, and all 15 SQLAlchemy models
- [ ] 01-02-PLAN.md — Seed data (100+ quotes, defaults) and comprehensive test suite

### Phase 2: Core Game Logic Services
**Goal**: All game mechanics work as tested Python functions -- XP formulas, Kaio-ken tiers, Zenkai streaks, capsule RNG, Dragon Ball awards, transformations, and the composite check_habit() transaction
**Depends on**: Phase 1
**Requirements**: GAME-01, GAME-02, GAME-03, GAME-04, GAME-05, GAME-06, GAME-07, GAME-08, GAME-09, GAME-10, GAME-11, GAME-12, GAME-13, GAME-14
**Success Criteria** (what must be TRUE):
  1. check_habit() toggles a habit log, updates daily completion, awards attribute XP, updates streaks, recalculates daily XP, checks transformation threshold, awards Dragon Ball on Perfect Day, and rolls capsule RNG -- all in one atomic commit
  2. XP formula produces exact expected integers for known inputs (base_daily_xp * completion_rate * tier_multiplier * (1 + streak_bonus))
  3. Zenkai recovery halves streak on break (never resets to 0) and applies +50% bonus XP on first Perfect Day after recovery
  4. Collecting 7th Dragon Ball triggers wish-available state; granting wish resets dragon_balls_collected to 0
  5. Off days pause both streak types with no penalty and no XP awarded
**Plans**: TBD

Plans:
- [ ] 02-01: TBD
- [ ] 02-02: TBD

### Phase 3: API Routes and Schemas
**Goal**: All backend functionality is accessible via REST endpoints with typed request/response schemas, testable via Swagger UI and curl before any frontend exists
**Depends on**: Phase 2
**Requirements**: API-01, API-02, API-03, API-04, API-05, API-06, API-07, API-08, API-09, API-10, API-11, API-12, API-13, API-14, API-15
**Success Criteria** (what must be TRUE):
  1. POST /habits/{id}/check returns the full composite response (attribute_xp_awarded, completion_rate, tier, capsule_drop, is_perfect_day, dragon_ball_earned, new_transformation, streak, daily_xp, quote)
  2. Habit CRUD (create, read, update, delete) works with importance and attribute fields via /habits/ endpoints
  3. GET /habits/today/list returns today's habits with completion status, streaks, attribute, and importance
  4. Reward CRUD, Wish CRUD, Category CRUD, Off-day management, and Settings endpoints all accept and return valid data
  5. GET /analytics endpoints return summary stats, capsule history, wish history, and per-habit contribution data
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD

### Phase 4: Frontend State Layer
**Goal**: Zustand stores and typed API client establish the frontend data contract, so components render real backend data without computing game logic client-side
**Depends on**: Phase 3
**Requirements**: STATE-01, STATE-02, STATE-03, STATE-04, STATE-05, STATE-06
**Success Criteria** (what must be TRUE):
  1. services/api.ts provides typed functions for every backend endpoint; no raw fetch calls exist outside this file
  2. habitStore exposes today's habits, daily progress, and a checkHabit action that updates state from backend response (no client-side XP calculation)
  3. powerStore exposes power level, current transformation, attribute levels with XP, and dragon_balls_collected -- all set from API responses
  4. uiStore manages animation queue with enqueue/dequeue, active modal state, sound toggle, and quote display
  5. Dark mode theme is applied with #050510 background, glowing borders, and orange/blue accents via Tailwind CSS v4 CSS-first config
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD

### Phase 5: Dashboard UI
**Goal**: Users can view their daily habits, check them off, and see all game state (aura %, attributes, Dragon Balls, streaks, transformation) update from real backend data
**Depends on**: Phase 4
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, DASH-06, DASH-07, DASH-08, DASH-09, DASH-10
**Success Criteria** (what must be TRUE):
  1. Checking a habit updates the Daily Aura bar percentage, the habit's streak counter, and the attribute XP bars -- all from the backend response
  2. Saiyan avatar displays the current transformation form image with an aura that visually grows as completion % increases
  3. Dragon Ball tracker shows 7 slots that fill as Perfect Days are achieved, and streak display shows current/best overall streak with XP bonus %
  4. Habit cards display attribute tag (STR/VIT/INT/KI), importance badge (Normal/Important/Critical), streak flame, and a functional check toggle
  5. User can create/edit habits via modal with importance selector and attribute selector, and mark today as an off day
**Plans**: TBD

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD

### Phase 6: Audio and Animation Layer
**Goal**: Every habit interaction produces sound and visual feedback; major events (Perfect Day, transformation, Shenron, capsule drop) play sequential cinematic animations
**Depends on**: Phase 5
**Requirements**: ANIM-01, ANIM-02, ANIM-03, ANIM-04, ANIM-05, ANIM-06, ANIM-07, ANIM-08, ANIM-09, ANIM-10, ANIM-11, ANIM-12
**Success Criteria** (what must be TRUE):
  1. Every habit check plays a scouter beep sound; ki charging hum loops and grows with completion %; tier change triggers power-up burst sound
  2. Perfect Day (100%) triggers the full cinematic sequence: screen darkens, aura + screen shake, power-up scream, "100% COMPLETE" banner, XP reveal, Dragon Ball earned, quote, wind-down
  3. Capsule drops show a popup with pop sound, tap-to-open interaction, rarity reveal chime, and reward display
  4. Shenron ceremony plays when 7 Dragon Balls are collected: sky darkens, thunder + roar, Shenron animation, wish selection, Dragon Balls scatter
  5. Animation queue ensures events play sequentially (XP popup, tier change, perfect day, dragon ball, capsule) -- never simultaneously; sound toggle in settings mutes all audio
**Plans**: TBD

Plans:
- [ ] 06-01: TBD
- [ ] 06-02: TBD

### Phase 7: Analytics and Settings Pages
**Goal**: Users can review their history via calendar heatmap and progression charts, and manage all configurable items (rewards, wishes, categories, preferences)
**Depends on**: Phase 5
**Requirements**: ANLYT-01, ANLYT-02, ANLYT-03, ANLYT-04, ANLYT-05, ANLYT-06, ANLYT-07, SET-01, SET-02, SET-03, SET-04, SET-05, SET-06, SET-07
**Success Criteria** (what must be TRUE):
  1. Calendar heatmap displays days with correct color coding: gold (100%), blue (75-99%), red (50-74%), gray (<50%), blue outline (off day)
  2. Clicking a calendar day shows a popover with per-habit breakdown and XP earned for that day
  3. Attribute progression charts (STR/VIT/INT/KI over time) and per-habit contribution graph (90-day GitHub-style grid) render with real data
  4. Settings page provides working CRUD for capsule rewards (with rarity), Shenron wishes, categories (name/color/icon), and habit management
  5. Sound toggle, theme toggle (dark/light), and warrior display name are editable and persist across sessions
**Plans**: TBD

Plans:
- [ ] 07-01: TBD
- [ ] 07-02: TBD

### Phase 8: Quote System and Polish
**Goal**: The app has personality -- character quotes fire on the right triggers, Vegeta roasts escalate based on missed days, streak milestones have fanfare, and all 10 transformation forms have unique visuals
**Depends on**: Phase 6, Phase 7
**Requirements**: QUOTE-01, QUOTE-02, QUOTE-03, QUOTE-04, QUOTE-05
**Success Criteria** (what must be TRUE):
  1. Quotes from 6 characters (Goku, Vegeta, Gohan, Piccolo, Whis, Beerus) display in context based on 7 trigger events (habit_complete, perfect_day, streak_milestone, transformation, zenkai, roast, welcome_back)
  2. Vegeta roast quotes escalate in severity based on consecutive missed days (mild at 1, medium at 2, savage at 3+)
  3. Streak milestones at 3, 7, 21, 30, 60, 90, and 365 days trigger character-specific celebration quotes with fanfare sound
  4. Transformation unlocks display unique per-form full-screen animations with character quotes and power-up audio for all 10 forms
**Plans**: TBD

Plans:
- [ ] 08-01: TBD
- [ ] 08-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8
Note: Phase 7 depends on Phase 5 (not Phase 6), so Phases 6 and 7 could theoretically overlap, but sequential execution is simpler.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Database and Model Integrity | 0/? | Not started | - |
| 2. Core Game Logic Services | 0/? | Not started | - |
| 3. API Routes and Schemas | 0/? | Not started | - |
| 4. Frontend State Layer | 0/? | Not started | - |
| 5. Dashboard UI | 0/? | Not started | - |
| 6. Audio and Animation Layer | 0/? | Not started | - |
| 7. Analytics and Settings Pages | 0/? | Not started | - |
| 8. Quote System and Polish | 0/? | Not started | - |
