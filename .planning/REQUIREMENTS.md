# Requirements: Saiyan Tracker v3

**Defined:** 2026-03-03
**Core Value:** Every habit check must feel like something happened — a sound, a visual pulse, a number going up. If the app is silent and still, it has failed.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Database & Models

- [ ] **DB-01**: SQLAlchemy 2.0 models for all 15 tables (Users, Categories, Habits, HabitLogs, HabitStreaks, DailyLogs, Streaks, PowerLevels, Rewards, CapsuleDrops, Wishes, WishLogs, OffDays, Achievements, Quotes)
- [ ] **DB-02**: User model stores cumulative attribute XP (str_xp, vit_xp, int_xp, ki_xp), power_level, current_transformation, dragon_balls_collected, wishes_granted, sound_enabled
- [ ] **DB-03**: Habit model has importance (normal/important/critical) and attribute (str/vit/int/ki) fields — no base_points
- [ ] **DB-04**: HabitLog stores attribute_xp_awarded and capsule_dropped per completion
- [ ] **DB-05**: DailyLog stores is_perfect_day, completion_tier, xp_earned, streak_multiplier, zenkai_bonus_applied, dragon_ball_earned
- [ ] **DB-06**: All date-based logic uses client-supplied local_date (not server datetime) to prevent timezone/midnight bugs
- [ ] **DB-07**: Seed 100+ quotes with character, source_saga, trigger_event, transformation_level, and severity fields
- [ ] **DB-08**: Category model is visual-only (name, color, icon) — no point_multiplier

### Core Game Logic

- [ ] **GAME-01**: XP formula: daily_xp = floor(base_daily_xp * completion_rate * tier_multiplier * (1 + streak_bonus)) — computed exclusively on backend
- [ ] **GAME-02**: Kaio-ken tier system: <50% = 1.0x, >=50% = 1.2x, >=80% = 1.5x, 100% = 2.0x
- [ ] **GAME-03**: Per-habit attribute XP: Normal = 15, Important = 22, Critical = 30 XP to the habit's attribute
- [ ] **GAME-04**: Streak bonus: +5%/day on overall streak, capped at +100%
- [ ] **GAME-05**: Zenkai recovery: streak halved on break (never reset to 0), +50% bonus XP on first Perfect Day after recovery
- [ ] **GAME-06**: Overall streak requires >=80% daily completion
- [ ] **GAME-07**: Per-habit streaks track consecutive due-day completions (visual only, no XP effect)
- [ ] **GAME-08**: Capsule drop: 25% chance per habit check, rarity weighted (60% common, 30% rare, 10% epic)
- [ ] **GAME-09**: Dragon Ball earned on each Perfect Day (100%); 7 Dragon Balls trigger Shenron wish
- [ ] **GAME-10**: Wish granting resets dragon_balls_collected to 0 and increments times_wished on chosen wish
- [ ] **GAME-11**: Power Level = cumulative total XP (never decreases); 10 transformation thresholds from Base (0) to Beast (150,000)
- [ ] **GAME-12**: Attribute leveling formula: xp_needed = 100 * level^1.5 with title unlocks at levels 5/10/25/50/100
- [ ] **GAME-13**: Off days pause both streak types — no penalty, no XP
- [ ] **GAME-14**: check_habit() is a single atomic transaction: toggle log, update daily log, award attribute XP, update habit streak, update overall streak, recalc daily XP, update power level, check transformation, award Dragon Ball, roll capsule RNG

### API

- [ ] **API-01**: POST /habits/{id}/check returns: attribute_xp_awarded, completion_rate, completion_tier, capsule_drop (with reward details), is_perfect_day, dragon_ball_earned, new_transformation, streak, daily_xp_so_far, quote
- [ ] **API-02**: Habit CRUD (GET/POST/PUT/DELETE /habits/) with importance and attribute fields
- [ ] **API-03**: GET /habits/today/list returns today's habits with completion status, streaks, attribute, importance
- [ ] **API-04**: GET /habits/calendar/all returns monthly heatmap with is_perfect_day, completion_tier, xp_earned per day
- [ ] **API-05**: Reward CRUD (GET/POST/PUT/DELETE /rewards/) for Capsule Corp loot box items
- [ ] **API-06**: Wish CRUD (GET/POST/PUT/DELETE /wishes/) plus POST /wishes/grant for Shenron claiming
- [ ] **API-07**: GET /power/current returns power level, transformation, attribute levels with XP, dragon_balls_collected
- [ ] **API-08**: GET /attributes/ returns current attribute levels, titles, XP breakdown
- [ ] **API-09**: Category CRUD (GET/POST/PUT/DELETE /categories/)
- [ ] **API-10**: Off day management (GET/POST/DELETE /off-days/)
- [ ] **API-11**: GET /analytics/summary?period=week|month|all with perfect days, avg %, total XP, longest streak
- [ ] **API-12**: GET /analytics/capsule-history and GET /analytics/wish-history
- [ ] **API-13**: GET /habits/{id}/contribution-graph?days=90 for per-habit GitHub-style grid
- [ ] **API-14**: GET /quotes/random?trigger_event=X for trigger-filtered quotes
- [ ] **API-15**: GET/PUT /settings/ for user preferences (sound, theme, display_name)

### Frontend — Dashboard

- [ ] **DASH-01**: Saiyan avatar with current form image and Framer Motion animated aura that grows with completion %
- [ ] **DASH-02**: Attribute bars showing STR/VIT/INT/KI levels with current XP progress
- [ ] **DASH-03**: Daily Aura bar — percentage-based progress showing habits_completed/habits_due with Kaio-ken tier label
- [ ] **DASH-04**: Dragon Ball tracker — 7 slots (filled/empty) with glow effects
- [ ] **DASH-05**: Habit cards with attribute tag, importance badge, streak flame counter, and checkbox with ki-burst animation
- [ ] **DASH-06**: Streak display showing current/best overall streak and XP bonus percentage
- [ ] **DASH-07**: Transformation progress meter (current form → next form with % to unlock)
- [ ] **DASH-08**: Character quote bar at bottom (Goku encouragement, context-appropriate)
- [ ] **DASH-09**: Off Day button to mark today as off day
- [ ] **DASH-10**: Habit form modal with importance selector (Normal/Important/Critical) and attribute selector (STR/VIT/INT/KI)

### Frontend — Animations & Audio

- [ ] **ANIM-01**: SoundProvider singleton context at app root — components call play(soundId), never create Howler instances
- [ ] **ANIM-02**: Scouter beep sound on every habit check
- [ ] **ANIM-03**: Ki charging hum that grows with completion % (looping, requires direct Howler.js)
- [ ] **ANIM-04**: Power-up burst sound on Kaio-ken tier changes (50%, 80%)
- [ ] **ANIM-05**: Perfect Day explosion: screen darkens → full-screen aura + screen shake → power-up scream → "100% COMPLETE" banner → XP multiplier reveal → Dragon Ball earned → Goku quote → wind-down
- [ ] **ANIM-06**: Capsule drop popup: capsule appears with pop sound → tap to open → item reveal chime → reward displayed
- [ ] **ANIM-07**: Shenron ceremony: sky darkens → thunder + Shenron roar → Shenron animation → "MAKE YOUR WISH" → wish selection → Dragon Balls scatter
- [ ] **ANIM-08**: Transformation unlock: unique per-form full-screen animation with character quote and power-up audio
- [ ] **ANIM-09**: Animation queue system — animations play sequentially (XP popup → tier change → perfect day → dragon ball → capsule), not simultaneously
- [ ] **ANIM-10**: Attribute XP popup ("+22 STR XP") floats up on habit completion
- [ ] **ANIM-11**: Sound toggle in settings (on/off), respects browser autoplay policy (resume AudioContext on first user gesture)
- [ ] **ANIM-12**: Streak milestone achievement fanfare sound

### Frontend — Analytics

- [ ] **ANLYT-01**: Calendar heatmap with gold (100%), blue (75-99%), red (50-74%), gray (<50%), blue outline (off day)
- [ ] **ANLYT-02**: Click any calendar day → popover with per-habit breakdown and XP earned
- [ ] **ANLYT-03**: Per-habit contribution graph (GitHub-style, 90 days)
- [ ] **ANLYT-04**: Attribute progression charts (STR/VIT/INT/KI over time) using Recharts
- [ ] **ANLYT-05**: Summary stats: perfect days this week/month, average %, total XP, longest streak
- [ ] **ANLYT-06**: Capsule history: what rewards earned from loot boxes
- [ ] **ANLYT-07**: Shenron wishes history: wishes granted and rewards claimed

### Frontend — Settings

- [ ] **SET-01**: Warrior profile: display name
- [ ] **SET-02**: Sound toggle: on/off
- [ ] **SET-03**: Theme toggle: dark/light mode with CSS variable theming
- [ ] **SET-04**: Category management: visual-only CRUD (name, color, icon)
- [ ] **SET-05**: Capsule Rewards manager: CRUD with rarity assignment (common/rare/epic)
- [ ] **SET-06**: Shenron Wishes manager: CRUD for big rewards
- [ ] **SET-07**: Habit management: create/edit with importance and attribute assignment

### Frontend — State & Infrastructure

- [ ] **STATE-01**: habitStore (Zustand): habits, todayHabits, calendar, dailyProgress
- [ ] **STATE-02**: powerStore (Zustand): power level, transformation, attributes, dragon_balls
- [ ] **STATE-03**: rewardStore (Zustand): capsule rewards CRUD, wishes CRUD, capsule history
- [ ] **STATE-04**: uiStore (Zustand): modals, quotes, animation queue (perfectDay, tierChange, transformation, shenron, capsuleDrop)
- [ ] **STATE-05**: Dark mode as primary theme with #050510 background, glowing borders, orange/blue accents
- [ ] **STATE-06**: Tailwind CSS v4 with @tailwindcss/vite plugin (CSS-first config, not tailwind.config.js)

### Quotes & Characters

- [ ] **QUOTE-01**: 100+ seeded quotes across 6 characters (goku, vegeta, gohan, piccolo, whis, beerus)
- [ ] **QUOTE-02**: 7 trigger events: habit_complete, perfect_day, streak_milestone, transformation, zenkai, roast, welcome_back
- [ ] **QUOTE-03**: Vegeta escalation: mild (1 missed day), medium (2 missed), savage (3+ missed)
- [ ] **QUOTE-04**: Streak milestone quotes: 3, 7, 21, 30, 60, 90, 365 days with character-specific responses
- [ ] **QUOTE-05**: Transformation quotes: unique per form unlock, character-appropriate

## v2 Requirements

Deferred to future release.

### Mobile & Deployment

- **MOB-01**: PWA with offline support and service worker
- **MOB-02**: VPS deployment with PostgreSQL migration

### Advanced Gamification

- **ADV-01**: Training Arc system (multi-week themed challenges)
- **ADV-02**: Fusion mechanic (combine two habits into super-habit)
- **ADV-03**: Tournament mode (weekly leaderboard against past self)
- **ADV-04**: Drag-and-drop habit reordering

### Data Management

- **DATA-01**: Habit archival/history view
- **DATA-02**: Data export/import

## Out of Scope

| Feature | Reason |
|---------|--------|
| Task management | Habits only — tasks compete with habits and enable hyperfocus exploits |
| Multi-user / authentication | Single tenant, Sergio only — no auth overhead |
| Cloud sync | Local SQLite is sufficient; no privacy/latency concerns |
| Social features / leaderboards | Solo tracker — competition is against yourself |
| Punishment mechanics (HP, death) | Research-backed: punishment kills ADHD motivation; Zenkai is the right answer |
| Category point multipliers | Removed in v3 — all habits equal weight toward 100% |
| Base points per habit | Removed in v3 — replaced by importance-weighted attribute XP |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| (Populated during roadmap creation) | | |

**Coverage:**
- v1 requirements: 75 total
- Mapped to phases: 0
- Unmapped: 75

---
*Requirements defined: 2026-03-03*
*Last updated: 2026-03-03 after initial definition*
