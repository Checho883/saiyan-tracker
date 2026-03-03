# Project Research Summary

**Project:** Saiyan Tracker v2 (GSD rebuild)
**Domain:** Gamified habit tracker — Dragon Ball Z theme, RPG progression, ADHD-optimized, animation-heavy, single-user
**Researched:** 2026-03-03
**Confidence:** HIGH

## Executive Summary

Saiyan Tracker is an ADHD-optimized gamified habit tracker built on a React 19 + Vite 7 frontend and a FastAPI + SQLite backend. The product's core differentiation is not RPG mechanics in isolation — Habitica, LifeUp, and Finch all have those — but the specific combination of audio-first design (sound on every single action), a forgiving streak model (Zenkai halving instead of reset), a user-controlled reward economy (user defines capsule loot and Shenron wishes), and a visceral full-screen climax at 100% daily completion. Research confirms this combination is unique in the competitive space. The recommended build approach is a React SPA served locally against a FastAPI backend, with SQLite as the database. No auth, no multi-user, no cloud sync for v1.

The most important architectural pattern is the composite `/habits/{id}/check` endpoint: a single atomic transaction that computes all game-state side effects (XP, streak, transformation, Dragon Ball, capsule drop, quote selection) and returns them in one response. The frontend stores never recompute game logic — the backend is the sole source of truth for all XP values, transformation thresholds, and rarity weights. On the frontend, the animation queue pattern in uiStore sequences multiple concurrent events (XP popup, tier change, perfect day explosion, capsule reveal) so each reward fires distinctly rather than simultaneously, maximizing dopamine impact per habit check.

The two highest-risk pitfalls are both data-contract decisions that must be made before any frontend is built: XP calculation must live exclusively in the backend (frontend drift is silent and compounds for weeks), and streak date logic must use client-provided `local_date` in every request rather than server-side `datetime.now()` (server timezone mismatches cause midnight streak breaks that are invisible in development). Both are prevented entirely by establishing the correct contract in Phase 1 and writing tests that enforce it.

---

## Key Findings

### Recommended Stack

The stack is validated and version-specific. React 19 with Vite 7 handles the animation-heavy UI; framer-motion 12.x is the correct animation library (not react-spring, not GSAP) because its declarative variant model fits the transformation animation chain. Zustand 5 manages client state in four domain stores (habitStore, powerStore, rewardStore, uiStore). Tailwind CSS v4 (not v3 — v4 is the 2026 standard with a completely different CSS-first config model) handles styling. FastAPI 0.135+ with Pydantic v2 and SQLAlchemy 2.0 (sync, not async) handles the backend. SQLite with aiosqlite is sufficient for single-user local use — no PostgreSQL needed for v1.

Two libraries require explicit attention: `use-sound` 5.0.0 is semi-maintained (flag for maintenance risk at implementation time); `@tsparticles/react` 3.0.0 was last published two years ago and should only be added if `react-canvas-confetti` cannot cover ambient particle effects. The Tailwind v4 configuration breaking change is significant: there is no `tailwind.config.js` file; all customization is done via `@theme` directive in `index.css`.

**Core technologies:**
- React 19 + Vite 7: UI framework — concurrent rendering handles animation-heavy UIs without jank
- framer-motion 12.x: All animated elements — declarative variants for the transformation sequence
- Zustand 5.x: Client state — four domain stores; `useSyncExternalStore` eliminates React 19 tearing
- FastAPI 0.135+ + Pydantic v2: REST API — automatic validation, async-first, single composite check endpoint
- SQLAlchemy 2.0 (sync) + SQLite: Persistence — zero-config, file-based, single-user appropriate
- Tailwind CSS v4 + `@tailwindcss/vite`: Styling — CSS-first config, 100x faster incremental builds
- use-sound 5.0.0 + Howler.js 2.x: Audio — hook-based for event sounds; direct Howler for looping ki-charge
- Recharts 3.x: Analytics charts — declarative React, 3.6M weekly downloads, React 19 compatible

### Expected Features

The feature dependency graph is complex. The daily habit check is the root dependency of the entire system: XP, streaks, transformations, Dragon Ball collection, and capsule drops all derive from it. The Perfect Day 100% explosion is the most downstream feature — it has five upstream dependencies and should not be built until all of them are stable.

**Must have (table stakes):**
- Habit CRUD with attribute (STR/VIT/INT/KI), importance, and frequency — foundation of everything
- Daily habit checklist with toggle — primary daily interaction
- Streak tracking with Zenkai recovery (halve, not reset) — design pillar; absence would make the app feel punishing for ADHD users
- Off-day mechanic (sick/vacation/rest) — needed before first real use to prevent day-1 streak breaks
- XP formula with Kaio-ken tiers and streak bonus — numbers must go up
- Calendar heatmap (Gold/Blue/Red/Gray) — retroactive progress visibility
- Sound effects on every interaction with global toggle — non-negotiable per PRD and differentiation
- Settings page: sound toggle, rewards CRUD, wishes CRUD — user controls the reward loops

**Should have (competitive differentiators):**
- Full-screen Perfect Day 100% explosion (screen shake + scream + XP reveal + Dragon Ball) — the single most memorable UX moment
- Transformation system (10 forms, SSJ1 at ~4 days) — long-term visual identity investment
- Capsule Corp loot drop (25% per check, user-configured rewards, 3 rarity tiers) — variable reward schedule
- Dragon Ball collection → Shenron ceremony animation + wish grant — macro reward cycle
- Character quote system (100+ quotes, 5 characters, 7 trigger events) — personality layer
- RPG attributes (STR/VIT/INT/KI) with independent leveling and dashboard charts
- Daily aura % bar — the progress centerpiece; equal weight per habit prevents gaming

**Defer (v1.x and v2+):**
- Vegeta escalating roast system — enhancement on top of working quote system; add after quotes verified
- Contribution graph per habit (GitHub-style 90-day grid) — add when user asks about specific habit consistency
- Calendar day drill-down popover — add when heatmap is in use
- Tournament mode vs past self — requires weeks of data to be meaningful
- Mobile PWA, cloud sync, VPS deployment — v2 concerns

**Explicit anti-features (do not build):**
- Task/to-do list — dilutes the daily aura model
- HP loss / punitive streak resets — abandonment driver per research; Zenkai is the correct replacement
- Multi-user, auth, leaderboards, cloud sync — scope creep with zero value for a solo personal tool

### Architecture Approach

The architecture is layered: React pages compose from Zustand stores, stores call a typed `services/api.ts` client, which talks to FastAPI routes, which delegate all logic to service functions, which operate on SQLAlchemy models backed by SQLite. The key constraint is that all game logic (XP formulas, capsule RNG, transformation detection, Dragon Ball award) lives exclusively in the service layer and is tested as plain Python functions — never in routes, never in the frontend. The frontend is a pure display layer that renders what the backend returns.

**Major components:**
1. `habit_service.check_habit()` — the composite transaction function that runs all 10 sequential game-state operations atomically in one DB commit
2. `uiStore.animationQueue` — the sequential animation queue that ensures each reward event (XP popup, tier change, perfect day, Dragon Ball, capsule) fires distinctly rather than simultaneously
3. `SoundProvider` (context) — a singleton at the app root that manages all Howler.js instances; components call `play(soundId)`, never instantiate Howler directly
4. `services/api.ts` — the single typed HTTP client; all fetch calls live here; no raw fetch in stores or components
5. `constants.py` — all XP values, transformation thresholds, and rarity weights; the single source of truth for tunable game balance numbers

### Critical Pitfalls

1. **XP calculation drift** — Frontend must never independently compute XP, transformation thresholds, or tier multipliers. Backend returns all computed values in the `/check` response. Frontend stores set values from responses (`power_level = response.power_level`), never derive them. Establish this contract in Phase 1 with backend tests that assert exact integer formula output.

2. **Streak timezone / midnight bug** — Every `/check` request body must include `local_date: "YYYY-MM-DD"` (client's local calendar date). Backend streak logic uses this value, never `datetime.now()` on the server. SQLite `DATE` columns store `YYYY-MM-DD` strings; never use DATETIME for streak date comparison. Test explicitly with simulated midnight boundary cases.

3. **Animation avalanche (jank)** — Never fire multiple Framer Motion overlays simultaneously. Use the uiStore animation queue; each overlay's `onAnimationComplete` calls `advanceQueue()`. Animate only `transform` and `opacity` — never `width`, `height`, `backgroundColor`, or `boxShadow` (layout/paint triggers). The aura bar fill must be a CSS `scaleX` transition, not a Framer Motion value, because it runs on every habit check.

4. **Audio autoplay restriction** — `AudioContext` starts suspended in all major browsers. The `SoundProvider` must call `audioContext.resume()` inside the first user interaction. The `play()` call for habit-check sound must happen directly in the click handler, not in a `useEffect` or `setTimeout` triggered by state change. Test cold-load behavior (open new tab, first click plays sound) every time a new sound event is added.

5. **Overlapping audio on rapid habit checks** — ADHD users naturally rapid-check habits. Use `interrupt: true` in use-sound for short per-event sounds (scouter beep). Implement a sound priority queue: transformation/explosion (tier 1, interrupts all), capsule/achievement (tier 2), habit beep (tier 3). Gate the perfect-day explosion behind an `isAnimating` ref to prevent re-entrant triggers.

6. **Capsule reward saturation** — 25% drop rate on 6 habits = statistically ~1.5 capsules/day. By week 3, this feels spammy. Use a "pending capsule" notification badge, not an immediate popup interrupt. The capsule opening animation must be skippable and under 2 seconds.

---

## Implications for Roadmap

### Phase 1: Database and Model Integrity

**Rationale:** Every other phase depends on correct data models. XP drift and streak timezone bugs are impossible to prevent after the frontend is built against a flawed contract. The data schema, the `local_date` contract, and the XP formula tests must exist before any service or UI layer is built on top of them.

**Delivers:** SQLAlchemy models (User, Habit, HabitLog, HabitStreak, DailyLog, Streak, PowerLevel, Reward, CapsuleDrop, Wish, WishLog, OffDay, Achievement, Quote), Alembic migrations, UniqueConstraints on `(habit_id, log_date)` and `(user_id, log_date)`, indexes on `(habit_id, log_date)` and `(user_id, log_date)`, `constants.py` with all XP values and transformation thresholds, backend tests asserting exact XP formula output and streak date arithmetic with explicit midnight boundary cases.

**Addresses:** Habit CRUD data foundation, streak system data foundation
**Avoids:** XP calculation drift (Pitfall 4), streak timezone bug (Pitfall 5)

---

### Phase 2: Core Game Logic Services

**Rationale:** The service layer is testable as plain Python without HTTP. Building and testing `habit_service.check_habit()` before routes or frontend exist means the game logic is verified correct before it becomes load-bearing.

**Delivers:** `habit_service.py` (complete 10-step `check_habit()` transaction), `power_service.py` (transformation detection, attribute leveling), `reward_service.py` (capsule RNG, wish grant), `quote_service.py` (trigger-based selection), `analytics_service.py` (aggregation queries), pytest coverage of all service functions including edge cases (rapid check at XP threshold, Dragon Ball 7th collection, capsule drop with empty rewards pool).

**Addresses:** XP formula, Kaio-ken tier calculation, Zenkai streak recovery logic, Dragon Ball award, capsule RNG
**Avoids:** Business logic in routes (Architecture Anti-Pattern 1), XP calculation drift (Pitfall 4)

---

### Phase 3: FastAPI Routes and API Schemas

**Rationale:** Thin route wrappers over completed services. At this phase the API is testable via Swagger UI and curl before any frontend is built, which validates integration assumptions early.

**Delivers:** All FastAPI route modules (`habits.py`, `power.py`, `rewards.py`, `wishes.py`, `categories.py`, `quotes.py`, `off_days.py`, `analytics.py`, `settings.py`), Pydantic request/response schemas including `CheckHabitResponse` (the 15-field composite response), CORS configuration, FastAPI app factory with router includes, httpx integration tests against all endpoints.

**Addresses:** Habit CRUD API, daily habit check endpoint, off-day API, settings API
**Avoids:** Multiple sequential API calls from frontend (Architecture Anti-Pattern 2), partial-state race conditions

---

### Phase 4: Frontend State Layer and API Client

**Rationale:** The Zustand stores and typed API client must be established before any component renders real data. Getting the store-to-API contract correct here prevents XP optimistic-update drift bugs from entering the component layer.

**Delivers:** `services/api.ts` (typed fetch wrapper for all endpoints), `habitStore.ts` (today's habits, daily progress, check action), `powerStore.ts` (power level, attributes, dragon balls), `rewardStore.ts` (rewards CRUD, wishes CRUD, capsule history), `uiStore.ts` (animation queue, active modal, sound toggle, quote display), TypeScript types in `types/index.ts` matching backend schemas exactly.

**Addresses:** State management for all dashboard data, animation queue scaffolding
**Avoids:** XP display optimistic drift (Pitfall 4), Zustand full-dashboard re-render on XP change (Performance Trap — use selectors)

---

### Phase 5: Core Dashboard UI

**Rationale:** The base UI layer that all animations overlay. Build with real data from stores, no placeholder data. The dashboard must be functionally correct (habit checking works, aura bar updates, streaks display) before the animation layer is added on top.

**Delivers:** `Dashboard.tsx`, `SaiyanAvatar` (transformation-aware), `DailyAuraBar` (CSS `scaleX` transition, not Framer Motion), `HabitCard` (attribute badge, importance label, streak display, check toggle), `AttributeBars` (STR/VIT/INT/KI independent progress), `DragonBallTracker` (7 balls with fill state), `StreakDisplay`, `PowerLevelBar`, Zustand selector isolation so individual habit cards don't trigger full-dashboard re-renders.

**Addresses:** Habit CRUD UI, daily checklist, daily aura %, RPG attributes display, Dragon Ball tracker
**Avoids:** Aura bar using Framer Motion (would add JS animation budget to every habit check), N+1 habit-streak loading (use `selectinload` in backend habits query)

---

### Phase 6: Audio Foundation and Animation Layer

**Rationale:** Audio architecture must be established as a single pattern before individual sounds are wired. The SoundProvider singleton, gesture-resume pattern, and priority queue logic must exist before any `play()` call is added anywhere in the app. Animation overlays build on the working dashboard and use the established queue.

**Delivers:** `SoundProvider.tsx` (singleton Howler context, gesture-resume on first interaction, priority queue, `interrupt: true` on per-event sounds), `PerfectDayAnimation.tsx` (screen shake, SSJ aura overlay, XP counter, staggered sequence), `ShenronAnimation.tsx` (thunder + roar + wish selection), `TransformationAnimation.tsx` (per-form power-up sequence), `CapsuleDropPopup.tsx` (short, skippable, rarity reveal), `PointsPopup.tsx` (floats up from habit card on check), `AnimationOrchestrator` logic in uiStore consuming the animation queue with `advanceQueue()` callbacks, all 7 sound files mapped in SOUND_MAP, sound toggle respected in SoundProvider.

**Addresses:** Sound on every interaction, Perfect Day climax, transformation unlock animation, Shenron ceremony, capsule reveal
**Avoids:** Audio autoplay restriction (Pitfall 2), overlapping audio soup (Pitfall 3), animation avalanche jank (Pitfall 1), simultaneous overlay rendering (Architecture Anti-Pattern 5)

---

### Phase 7: Analytics and Settings Pages

**Rationale:** Read-only analytics depend on data generated by Phases 1-6. Settings require the reward/wish CRUD APIs from Phase 3 and stores from Phase 4. Both pages are lower risk than the game mechanics and can be built with confidence once the data layer is established.

**Delivers:** `Analytics.tsx` (calendar heatmap Gold/Blue/Red/Gray, summary stats, attribute progression Recharts line chart, capsule/wish history table), `Settings.tsx` (sound toggle, theme toggle, habits management, rewards CRUD, wishes CRUD, categories management), `CalendarHeatmap` component, `AttributeChart` component, `WeeklyChart` component.

**Addresses:** Calendar heatmap, analytics summary stats, settings management, rewards CRUD, wishes CRUD
**Avoids:** Analytics with stale cached state (Off day declared today must immediately reflect; use store invalidation, not a stale GET)

---

### Phase 8: Polish and Quote System

**Rationale:** The character quote system (100+ quotes, 5 characters, 7 trigger events) and Vegeta roast escalation are personality layers. They require the underlying trigger events (habit check, perfect day, streak milestone, transformation) to exist before quotes can be wired to them. This is the final enhancement pass.

**Delivers:** Quote database seeding (100+ quotes with character, trigger, and severity fields), `GokuQuote` and `VegetaDialog` components wired to uiStore `activeQuote`, Vegeta roast escalation (triggers on session start after missed days, not mid-session), streak milestone badges (7 milestones with character-specific quotes), transformation form visuals for all 10 forms (real art assets per PRD), `constants.py` game balance tuning pass (XP values, threshold calibration, Dragon Ball / Shenron timing).

**Addresses:** Character quote system, Vegeta roast escalation, streak milestone badges, transformation visuals
**Avoids:** Vegeta roast interrupting active habit-check session (trigger only on app open after missed day), transformation firing twice at XP boundary (gate behind `isAnimating` ref)

---

### Phase Ordering Rationale

- Phases 1-2 establish the data contract and game logic before anything else exists. This is non-negotiable: XP drift and timezone bugs are architectural — they cannot be refactored cheaply after the frontend is built against wrong assumptions.
- Phases 3-4 build the API and state layer in sequence: routes require services (Phase 2), stores require routes (Phase 3). The API is testable via Swagger at the end of Phase 3 before any component is built.
- Phase 5 (dashboard UI) requires Phase 4 (stores with real data). Building UI against placeholder data creates integration surprises; building against real stores validates the full stack incrementally.
- Phase 6 (audio + animations) builds on a working Phase 5 dashboard. Animations cannot be meaningfully tested without real data flowing through real components.
- Phase 7 (analytics) is read-only and depends on data from Phases 1-6 being generated. No data = no meaningful chart to validate.
- Phase 8 (polish + quotes) is additive — it enhances existing trigger events and does not modify core game logic.

### Research Flags

Phases likely needing deeper research during planning:

- **Phase 6 (Animation + Audio):** The animation queue sequencing and per-animation `onComplete` → `advanceQueue()` wiring is the most complex frontend integration. The exact Framer Motion patterns for `AnimatePresence` with dynamic `key` props on overlays need verified implementation examples before coding begins. Audio priority queue implementation in Howler.js should be designed explicitly before wiring individual sounds.
- **Phase 8 (Quote System):** The 100+ quote database and 7 trigger event routing need explicit schema design (trigger field, character field, severity field for Vegeta escalation). The escalation tiers for Vegeta roasts need calibration decisions before implementation.

Phases with standard patterns (skip research-phase):

- **Phase 1 (Database):** SQLAlchemy 2.0 `mapped_column()` patterns are well-documented; Alembic migration setup is standard.
- **Phase 2 (Services):** Plain Python functions with pytest; no novel patterns.
- **Phase 3 (FastAPI Routes):** Thin wrapper pattern is standard FastAPI; Pydantic v2 schema shapes are well-understood.
- **Phase 4 (Zustand Stores):** Zustand 5 slice pattern is documented; the store interfaces are fully defined in the architecture research.
- **Phase 5 (Dashboard UI):** Standard React component composition; Tailwind v4 utility classes.
- **Phase 7 (Analytics):** Recharts declarative API is well-documented; calendar heatmap is a standard grid pattern.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All library versions verified via npm/PyPI as of March 2026; compatibility matrix confirmed; Tailwind v4 breaking change fully documented |
| Features | HIGH | Competitor analysis against Habitica, LifeUp, Finch, Streaks; ADHD UX research from multiple studies; gamification research from Cohorty real-user data and ResearchGate |
| Architecture | HIGH | Patterns drawn from official SQLAlchemy 2.0 docs, FastAPI best practices (zhanymkanov), Framer Motion and Zustand official docs; composite endpoint pattern well-established for single-user apps |
| Pitfalls | MEDIUM-HIGH | Audio autoplay from Chrome official docs (HIGH); XP drift and streak timezone from implementation experience and community sources (MEDIUM); animation jank from reactlibraries.com benchmark (MEDIUM) |

**Overall confidence:** HIGH

### Gaps to Address

- **tsParticles ambient particles:** `@tsparticles/react` 3.0.0 was last published two years ago. At implementation time: start with `react-canvas-confetti` for burst effects; only add tsParticles if the ambient aura field requires persistent looping particles that confetti cannot produce. Evaluate at Phase 6 start.
- **use-sound maintenance:** `use-sound` 5.0.0 is semi-maintained. At Phase 6: verify it still works with React 19 and Howler.js 2.x before committing to it. Fallback is direct Howler.js usage for all sounds.
- **Capsule drop rate calibration:** The 25% rate is specified by PRD and is correct. The saturation risk (Pitfall 6) must be monitored after 2-3 weeks of real use. The "notification badge, open when ready" UX pattern must be built from the start — do not build popup-first and retrofit.
- **10 transformation form assets:** The actual Dragon Ball Z art assets for all 10 transformation forms are not addressed in research. These must be sourced or created before Phase 8. Confirm asset availability and licensing before that phase begins.
- **Shenron wish gate:** When 7 Dragon Balls are collected and `dragon_balls_collected` resets to 0, the Shenron animation requires at least 1 active wish in the database. A guard must be implemented in the backend that prevents the Dragon Ball reset (and therefore the Shenron trigger) if the wishes table is empty. This is a correctness bug waiting to happen — address in Phase 2 service layer.

---

## Sources

### Primary (HIGH confidence)

- [framer-motion npm](https://www.npmjs.com/package/framer-motion) + [motion.dev docs](https://motion.dev/docs/react) — version 12.34.4, React 19 support, animation patterns
- [Vite releases](https://vite.dev/releases) — version 7.3.1 confirmed
- [Zustand GitHub](https://github.com/pmndrs/zustand/releases) — version 5.0.11, useSyncExternalStore
- [Tailwind CSS v4 announcement](https://tailwindcss.com/blog/tailwindcss-v4) — CSS-first config, breaking changes
- [FastAPI GitHub releases](https://github.com/fastapi/fastapi/releases) — version 0.135.1, Pydantic v2 requirement
- [SQLAlchemy 2.0 Basic Relationship Patterns](https://docs.sqlalchemy.org/en/20/orm/basic_relationships.html) — ORM design
- [SQLAlchemy 2.0 Relationship Loading](https://docs.sqlalchemy.org/en/20/orm/queryguide/relationships.html) — selectinload patterns
- [FastAPI Best Practices — zhanymkanov](https://github.com/zhanymkanov/fastapi-best-practices) — service layer architecture
- [Web Audio Autoplay Policy — Chrome for Developers](https://developer.chrome.com/blog/web-audio-autoplay) — AudioContext restriction
- [MDN Autoplay Guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay) — cross-browser policy
- [How to Build a Streaks Feature — Trophy](https://trophy.so/blog/how-to-build-a-streaks-feature) — DST and midnight edge cases
- [use-sound GitHub — Josh W. Comeau](https://github.com/joshwcomeau/use-sound) — interrupt option

### Secondary (MEDIUM confidence)

- [FastAPI Service Layer Architecture 2025 — Medium](https://medium.com/@abhinav.dobhal/building-production-ready-fastapi-applications-with-service-layer-architecture-in-2025-f3af8a6ac563) — service pattern
- [Gamification in Habit Tracking — Cohorty](https://blog.cohorty.app/gamification-in-habit-tracking-does-it-work-research-real-user-data) — 67% abandonment by week 4, variable reward calibration
- [Framer Motion vs Motion One Mobile Performance 2025 — reactlibraries.com](https://reactlibraries.com/blog/framer-motion-vs-motion-one-mobile-animation-performance-in-2025) — JS engine vs WAAPI, jank causes
- [Variable Rewards — Nir Eyal/NirAndFar](https://www.nirandfar.com/want-to-hook-your-users-drive-them-crazy/) — slot-machine psychology
- [Counterproductive Effects of Gamification — ResearchGate](https://www.researchgate.net/publication/327451529_Counterproductive_effects_of_gamification_An_analysis_on_the_example_of_the_gamified_task_manager_Habitica) — HP loss / punishment abandonment
- [Neurodiversity in UX — AufaitUX](https://www.aufaitux.com/blog/neuro-inclusive-ux-design/) — ADHD design principles
- [Gamification+ Best Gamified Habit App 2026](https://gamificationplus.uk/which-gamified-habit-building-app-do-i-think-is-best-in-2026/) — competitor landscape

### Tertiary (LOW confidence / evaluate at implementation)

- [@tsparticles/react npm](https://www.npmjs.com/package/@tsparticles/react) — 3.0.0, last published 2 years ago; maintenance status uncertain
- [use-sound npm](https://www.npmjs.com/package/use-sound) — 5.0.0, semi-maintained; verify React 19 compatibility at Phase 6

---

*Research completed: 2026-03-03*
*Ready for roadmap: yes*
