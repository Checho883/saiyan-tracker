# Feature Research

**Domain:** Gamified habit tracker frontend (RPG progression, ADHD-optimized, DBZ-themed, single-user)
**Researched:** 2026-03-04
**Confidence:** HIGH

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features the app MUST have to function. Without these, the core dopamine loop ("check habit, feel something") is broken.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Habit list with check/uncheck | Core daily interaction -- nothing works without this | MEDIUM | Each check calls `POST /habits/{id}/check` which returns a rich payload (XP, capsule, completion rate, tier, transformation, Dragon Balls, quote). Must fan out response to 4 Zustand stores (habit, power, reward, ui). Needs optimistic UI toggle with rollback on error |
| Daily aura progress bar | THE visual centerpiece per PRD -- "a filling progress bar you can see growing" | MEDIUM | Animated fill via Framer Motion `animate={{ width }}` with spring physics (not linear). Color/glow intensifies at tier thresholds (50%/80%/100%). Tier label ("Kaio-ken x3!") updates alongside. Bar must NEVER jump -- always animate from previous to new value |
| RPG attribute bars (STR/VIT/INT/KI) | Core differentiation -- habits map to attributes, leveling must be visible | LOW | Four horizontal bars with level number + XP fill toward next level. Data from `GET /power/current`. Each bar has distinct color (orange STR, green VIT, blue INT, purple KI). Animate fill on data change. Formula: `xp_needed = 100 * level^1.5` |
| Dragon Ball tracker (7 slots) | Core macro-reward visibility -- users must see collection progress at all times | LOW | 7 circular slots in a row. Filled balls glow with `box-shadow: 0 0 20px #FF6B00`. Empty slots are dim outlines. Data: `dragon_balls_collected` from power store. When new ball earned, it flies into slot with trajectory animation |
| Saiyan avatar with transformation | Visual identity -- user needs to see "who they are" | MEDIUM | Character image swaps based on `current_transformation` (10 forms). Layered aura effect: background gradient + blur, character image centered (~200px), foreground particles optional. Power level displayed "scouter style" (monospace). Progress bar to next form below |
| Streak display | Expected in every habit tracker; drives retention | LOW | Show `current_streak` and `best_streak`. Fire emoji/flame icon scaling with length. Per-habit streaks on habit cards |
| Sound effects on all interactions | PRD core value: "if the app is silent and still, it has failed" | MEDIUM | `use-sound` wrapping Howler.js (~1kb gzip + 10kb async load). ~10 distinct short clips (<3s). SoundProvider context at app root. Global toggle via settings. Browser requires first user interaction before audio -- first habit check naturally satisfies this. Use `playbackRate` variation (0.9-1.1) for repeated sounds to avoid monotony |
| Character quote display | Contextual feedback making each interaction feel alive | LOW | Bottom bar or slide-up toast. Character avatar icon + quote text (italic) + character name + saga. Quote comes in `check_habit` response (already contextually selected by backend). Fade in/out, 5s display. Vegeta roasts use aggressive visual treatment (red tint) |
| Settings: sound/theme toggle | Basic configuration expected in any app | LOW | Toggle switches hitting `PUT /settings/`. Theme uses CSS class strategy (`dark`/`light` on `<html>`). Persisted via backend |
| Habit CRUD modal | Can't use the app without creating/editing habits | MEDIUM | Modal form: title, description, importance (3-level selector), attribute (4-option), frequency (daily/weekdays/custom with day-of-week multi-select), category dropdown. Calls `POST/PUT/DELETE /habits/` |
| XP popup on habit check | Minimum visual feedback showing "something happened" | LOW | Float-up text "+22 STR XP" from habit card position. Framer Motion `animate={{ y: -50, opacity: 0 }}` over 1s. Color matches attribute |
| Off-day management | Life happens; must not punish or break streaks | LOW | Simple modal: select reason (sick/vacation/rest/injury/other), optional notes. `POST /off-days/`. Calendar shows blue marker |

### Differentiators (Competitive Advantage)

Features that make this feel like a game, not a todo list. These ARE "The Dopamine Edition."

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Full-screen Perfect Day explosion | THE climax moment -- massive screen-shaking celebration that no habit tracker does. ADHD brains live for this peak | HIGH | Choreographed 2-3s sequence using Framer Motion `AnimatePresence` with staggered delays: (0ms) overlay fades to black, (100ms) screen shake `x: [-10, 10, -10, 10, 0]`, (200ms) energy particles via canvas-confetti (gold/orange/white, NOT default confetti shapes), (500ms) "100% COMPLETE" text spring `scale: [0, 1.2, 1]`, (800ms) XP counter count-up animation, (1200ms) Dragon Ball earned notification, (1800ms) Goku quote, (2500ms) fade out. Full-screen overlay `position: fixed; inset: 0; z-index: 50` |
| Capsule Corp loot box reveal | Gacha/slot-machine dopamine hit on random 25% drops. Variable reward schedule is proven addictive | HIGH | Two-phase UX: (1) Capsule bounces in from bottom with scale spring + "pop" sound, pulses to invite tap. (2) On tap: 3D card flip via Framer Motion `rotateY: 180` with `perspective: 1000px`. Rarity determines glow: white shimmer (common), blue pulse (rare), purple burst with particles (epic). Reward title + rarity badge displayed. Auto-dismiss after 3s or on tap. Unclaimed capsules should persist |
| Shenron summoning ceremony | Ultimate macro-reward payoff. Collecting all 7 Dragon Balls triggers a mythic event -- rarest moment in app | HIGH | Full-screen overlay: sky darkens (background to near-black), lightning CSS flashes, Shenron image scales up `scale: [0, 1.2, 1]` with spring, thunder audio plays, "MAKE YOUR WISH" prompt appears, user selects from configured wishes list, Dragon Balls scatter (7 balls fly off-screen with staggered trajectory), counter resets. Must enforce minimum 1 active wish or ceremony cannot complete |
| Transformation unlock animation | Each of 10 form changes is a lifetime milestone (happens ~10 times ever). Must feel irreplaceable | MEDIUM | Triggered when `new_transformation` is non-null in check response. Form-specific visual: golden flash (SSJ), lightning sparks (SSJ2), crimson calm aura (SSG), blue intensity (SSB), silver flicker (UI). Avatar image swaps during animation. Character quote from `transformation` trigger pool. Each form needs unique color palette for aura effect |
| Kaio-ken tier change flash | Crossing 50%/80% thresholds triggers mini-celebration -- breadcrumb dopamine toward 100% | LOW | Brief banner flash ("Kaio-ken x3!" or "Kaio-ken x10!") with scale-in animation. Power-up burst sound. Compare previous `completion_tier` to new one in check response. Smaller than Perfect Day but noticeable enough to register |
| Vegeta escalating roast system | Entertaining "negative feedback" through humor, never shame. 3 severity levels based on consecutive missed days | MEDIUM | Quote system enhanced with severity field. Mild (1 miss), Medium (2), Savage (3+). Beerus appears at 3+ as ultimate threat. Visual treatment: red-tinted quote bar, slightly larger text, Vegeta portrait. Backend already handles severity selection |
| Calendar heatmap (custom 4-color) | GitHub-style contribution graph but with DBZ theming. See consistency patterns at a glance | MEDIUM | Use `@uiw/react-heat-map` (lightweight SVG, customizable). Custom color scale: gold (#FFD700) + glow for 100%, blue (#1E90FF) for 75-99%, red (#FF4444) for 50-74%, gray (#333) for <50%, blue outline for off-days. Click any cell to open popover with per-habit breakdown. Data from `GET /habits/calendar/all`. Month navigation with prev/next |
| Per-habit contribution graph | 90-day GitHub-style grid per individual habit. Spot which habits are weakest | MEDIUM | Same heatmap library, binary coloring (completed/missed). Data from `GET /habits/{id}/contribution-graph`. Simple but revealing -- which habits get skipped most? |
| Attribute progression charts | Line/area charts showing STR/VIT/INT/KI growth over time. Long-term RPG stat evolution | MEDIUM | Recharts `AreaChart` with 4 colored series + `ResponsiveContainer` for auto-sizing. `Tooltip` on hover. Period selector (week/month/all) via `GET /analytics/summary?period=X`. Summary stat cards above: perfect days count, avg %, total XP, longest streak |
| User-configured capsule rewards | User sets their OWN real-life loot pool -- personalization drives engagement. No competitor does this | LOW | Standard list + form. Three rarity categories with visual color coding. Distribution shown (60%/30%/10%). `GET/POST/PUT/DELETE /rewards/` |
| User-configured Shenron wishes | User sets their dream rewards -- makes Dragon Ball collection personally meaningful | LOW | Simpler than rewards (title + active toggle). `GET/POST/PUT/DELETE /wishes/`. Show `times_wished` count. Must have at least 1 active wish for ceremony |
| Streak milestone badges | 7 milestones (3/7/21/30/60/90/365 days) with character-specific quotes. Milestones feel earned, not just counted | LOW | Piccolo for discipline (21+), Whis for long streaks (60+). Badge icons displayed on streak section. Data from achievements table |

### Anti-Features (Commonly Requested, Often Problematic)

| Anti-Feature | Why Requested | Why Problematic | Alternative |
|--------------|---------------|-----------------|-------------|
| Task / to-do list | "Everything in one app" | Competes with habits; enables ADHD hyperfocus exploit (complete 10 easy tasks, skip habits); dilutes the clean 100% model | Pure habit tracker only. PRD explicitly excludes tasks |
| HP loss / punishment mechanics | "RPG authenticity" | Loss aversion increases abandonment. ADHD users quit rather than recover from punishment spirals | Vegeta verbal roasts (humor, not punishment). Zenkai halves streaks instead of resetting |
| Leaderboards / social | "Competition is motivating" | External comparison triggers shame for neurodivergent users. Solo tool, not social app | "Compete against past self" via analytics |
| Multi-user / auth | "My partner wants it" | Single-tenant by design. Auth adds massive surface area for zero value | Single default user, no login friction |
| Cloud sync / multi-device | "Expected in 2026" | VPS + PostgreSQL + sync adds 2-3 phases of complexity for one person | Local SQLite. PWA with offline in v2 |
| Importance affecting completion % | "Important habits should count more" | Opens gaming: mark everything critical, skip 'normal' habits guilt-free | Importance affects XP only. All habits equal toward 100% |
| Notification/reminder system | "Remind me to do habits" | Notification fatigue is real for ADHD. External reminders feel like nagging | Make app so rewarding to open that dopamine loop IS the reminder |
| Drag-and-drop habit reordering | "I want to sort my habits" | Complex touch handling, accessibility, mobile jank. API already has `PUT /habits/reorder` | Simple sort_order via settings or up/down arrows. Drag-and-drop is v2 |
| Dark mode auto-detection | "Match my OS theme" | App defaults dark per PRD. Auto-detection adds complexity for minimal value | Manual dark/light toggle in settings |
| Complex onboarding tutorial | "New users won't know what to do" | Solo tool for Sergio. He designed it. Tutorials add initial friction | Simple first launch with default categories |
| AI habit suggestions | "Feels smart" | Not needed for someone who knows their habits. Analysis paralysis risk | User-defined habits, manual control |

---

## Feature Dependencies

```
[Zustand Stores + API Service Layer]
    |-- foundation for --> [Everything below]

[Habit List + Check/Uncheck]
    |-- requires --> [Zustand Stores (habit, power, reward, ui)]
    |-- requires --> [API Service Layer]
    |-- triggers --> [Sound Effects]
    |-- triggers --> [Character Quotes]
    |-- triggers --> [XP Popup Animation]
    |-- triggers --> [Aura Progress Update]
    |-- may trigger --> [Capsule Drop Popup]
    |-- may trigger --> [Tier Change Animation]
    |-- may trigger --> [Perfect Day Explosion] (when 100%)
    |-- may trigger --> [Transformation Animation] (on level up)
    |-- may trigger --> [Shenron Ceremony] (when 7th Dragon Ball + 100%)

[Daily Aura Progress Bar]
    |-- requires --> [Habit Store (completion rate)]
    |-- enhances --> [Tier Change Animation]

[RPG Attribute Bars]
    |-- requires --> [Power Store (attribute XP/levels)]

[Dragon Ball Tracker]
    |-- requires --> [Power Store (dragon_balls_collected)]
    |-- visual cue for --> [Shenron Ceremony] (pulse at 7/7)

[Saiyan Avatar]
    |-- requires --> [Power Store (current_transformation)]
    |-- requires --> [10 Character Images as Assets]

[Sound Effects]
    |-- requires --> [use-sound / Howler.js]
    |-- requires --> [Audio Asset Files (~10 clips)]
    |-- requires --> [SoundProvider Context at app root]
    |-- enhances --> [Nearly every other feature]

[Perfect Day Explosion]
    |-- requires --> [Sound Effects (explosion audio)]
    |-- requires --> [Canvas Particles Library (canvas-confetti)]
    |-- requires --> [Framer Motion (screen shake, AnimatePresence)]
    |-- requires --> [UI Store (animation queue/sequencing)]
    |-- requires --> [Daily Aura at 100%]

[Capsule Drop Popup]
    |-- requires --> [Sound Effects (capsule pop + reveal chime)]
    |-- requires --> [Framer Motion (3D flip: rotateY)]
    |-- requires --> [Reward Store (capsule data from check response)]

[Shenron Ceremony]
    |-- requires --> [Sound Effects (thunder + roar)]
    |-- requires --> [Shenron Image Asset]
    |-- requires --> [Wish Store (available wishes -- min 1 required)]
    |-- requires --> [Dragon Ball Tracker shows 7/7]

[Transformation Animation]
    |-- requires --> [Sound Effects (power-up sequence)]
    |-- requires --> [10 form-specific color palettes]
    |-- requires --> [Avatar image swap]

[Calendar Heatmap]
    |-- requires --> [Heatmap Library (@uiw/react-heat-map)]
    |-- requires --> [Calendar API Data (GET /habits/calendar/all)]
    |-- enhances --> [Day Detail Popover (click-to-expand)]

[Attribute Progression Charts]
    |-- requires --> [Recharts]
    |-- requires --> [Analytics API Data]

[Settings Page]
    |-- contains --> [Reward CRUD (capsule rewards)]
    |-- contains --> [Wish CRUD (Shenron wishes)]
    |-- contains --> [Category CRUD]
    |-- contains --> [Sound/Theme Toggle]
    |-- contains --> [Habit Management]
```

### Critical Dependency Notes

- **Habit check is the hub:** The `POST /habits/{id}/check` response contains XP, capsule drops, completion rate, tier, transformation, Dragon Balls, and quotes. The frontend must parse this rich payload and dispatch to multiple stores and potentially queue multiple animations.
- **Animation sequencing is critical:** When checking the final habit, multiple animations can trigger simultaneously (Perfect Day + Dragon Ball earned + possible transformation + capsule drop). Need an animation queue in uiStore to play them sequentially with staggered timing, NOT on top of each other. Order: capsule drop first (if any), then tier change, then Perfect Day, then transformation (if any), then Shenron (if 7th ball).
- **Sound effects are cross-cutting infrastructure:** Nearly every feature needs sound. Build the SoundProvider early as foundational infrastructure.
- **Assets are hard dependencies:** Character images (10 forms), Dragon Ball images (7), sound clips (~10), Shenron image must exist before components that use them. Source or create these early in the project.
- **Shenron requires wishes:** If the wishes table is empty when 7 Dragon Balls are collected, the ceremony breaks. Must enforce minimum 1 active wish via UI validation.

---

## MVP Definition

### Launch With (v1.1 Core -- Foundation)

Infrastructure and core interaction loop:

- [x] **Zustand stores + API service layer** -- foundation for all features
- [x] **TypeScript types matching API schemas** -- type safety across the app
- [x] **Habit list with check/uncheck + optimistic UI** -- the primary daily interaction
- [x] **Daily aura progress bar with tier labels** -- the visual centerpiece
- [x] **RPG attribute bars (STR/VIT/INT/KI)** -- core differentiation
- [x] **Dragon Ball tracker (7 slots)** -- macro-reward visibility
- [x] **Saiyan avatar with transformation display** -- visual identity
- [x] **Streak display (overall + per-habit)** -- retention mechanic
- [x] **Character quote display** -- contextual personality
- [x] **Habit CRUD modal** -- must manage habits
- [x] **XP popup animations** -- minimum "something happened" feedback
- [x] **SoundProvider + sound effects on all interactions** -- PRD core value
- [x] **Dark theme with CSS variables** -- primary visual identity

### Launch With (v1.1 Dopamine -- Animations)

The celebrations that make it FEEL different:

- [x] **Tier change flash** -- mini-celebration at 50%/80% thresholds
- [x] **Perfect Day explosion** -- THE climax moment (screen shake, particles, XP reveal)
- [x] **Capsule drop reveal** -- gacha dopamine hit with 3D flip
- [x] **Transformation animation** -- milestone celebration with form-specific effects
- [x] **Shenron ceremony** -- payoff for Dragon Ball collection

### Launch With (v1.1 Complete -- Analytics & Settings)

Round out the full feature set:

- [x] **Calendar heatmap (gold/blue/red/gray)** -- consistency visualization
- [x] **Attribute progression charts** -- see growth over time
- [x] **Analytics summary stats** -- perfect days, avg %, total XP, longest streak
- [x] **Settings: sound/theme toggle** -- basic configuration
- [x] **Settings: reward CRUD** -- personalize capsule loot pool
- [x] **Settings: wish CRUD** -- personalize Shenron goals
- [x] **Settings: category management** -- visual habit grouping
- [x] **Off-day management** -- handle breaks gracefully

### Add After Validation (v1.x)

- [ ] **Per-habit contribution graph (90-day grid)** -- when user asks "how am I doing on X specifically"
- [ ] **Vegeta escalating roast system** -- enhance quote system after base quotes are verified
- [ ] **Streak milestone badges with character quotes** -- when streak system has real data
- [ ] **Calendar day drill-down popover** -- when "why was this day red?" question arises
- [ ] **Capsule/wish history in analytics** -- when enough data accumulates
- [ ] **Drag-and-drop habit reordering** -- when habit count grows past manual ordering

### Future Consideration (v2+)

- [ ] **PWA with offline support** -- defer until web version stable
- [ ] **Training Arc challenges** -- requires weeks of daily use data
- [ ] **Tournament mode (vs past self)** -- needs historical data to compare
- [ ] **VPS deployment with PostgreSQL** -- local SQLite sufficient for solo
- [ ] **Habit archival/history view** -- soft delete covers immediate need

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Zustand stores + API layer | HIGH | MEDIUM | P1 |
| Habit list + check/uncheck | HIGH | MEDIUM | P1 |
| Daily aura progress bar | HIGH | MEDIUM | P1 |
| SoundProvider + sound effects | HIGH | MEDIUM | P1 |
| Saiyan avatar display | HIGH | MEDIUM | P1 |
| RPG attribute bars | HIGH | LOW | P1 |
| Dragon Ball tracker | HIGH | LOW | P1 |
| Streak display | MEDIUM | LOW | P1 |
| Character quotes | MEDIUM | LOW | P1 |
| Habit CRUD modal | HIGH | MEDIUM | P1 |
| XP popup animations | HIGH | LOW | P1 |
| Dark theme + CSS variables | HIGH | LOW | P1 |
| Perfect Day explosion | HIGH | HIGH | P1 |
| Capsule drop reveal | HIGH | HIGH | P1 |
| Tier change animation | MEDIUM | LOW | P1 |
| Transformation animation | MEDIUM | MEDIUM | P2 |
| Shenron ceremony | MEDIUM | HIGH | P2 |
| Calendar heatmap | MEDIUM | MEDIUM | P2 |
| Attribute progression charts | MEDIUM | MEDIUM | P2 |
| Analytics summary stats | MEDIUM | LOW | P2 |
| Settings: sound/theme | MEDIUM | LOW | P2 |
| Settings: reward CRUD | MEDIUM | LOW | P2 |
| Settings: wish CRUD | MEDIUM | LOW | P2 |
| Off-day management | LOW | LOW | P2 |
| Per-habit contribution graph | LOW | MEDIUM | P3 |
| Vegeta roast escalation | MEDIUM | MEDIUM | P3 |
| Streak milestone badges | LOW | LOW | P3 |
| Calendar day drill-down | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have -- core daily loop (check habits, see progress, hear sounds, feel celebrations)
- P2: Should have -- completes the feature set (analytics, settings, rare events like Shenron)
- P3: Nice to have -- polish and enhancement features

---

## UX Patterns and Interaction Design

### 1. Daily Aura Progress Bar

**Expected behavior:** Animated fill bar growing with each habit check, color shifts at tier thresholds.

**Implementation pattern:** Single horizontal bar with Framer Motion `animate={{ width: `${percentage}%` }}` and `transition={{ type: "spring", stiffness: 100, damping: 15 }}` for satisfying bounce overshoot. Background glow intensifies with percentage via CSS `box-shadow` with dynamic spread value. Tier label ("Kaio-ken x3!") appears as overlay text with entrance animation.

**Key detail:** Spring physics, never linear easing. The bar must always animate from previous to new value -- never teleport.

### 2. RPG Attribute Bars (STR/VIT/INT/KI)

**Expected behavior:** Four horizontal bars with level + XP progress, each with distinct color and label.

**Implementation pattern:** Standard RPG stat display. Each bar shows: attribute icon (emoji or SVG), label (STR/VIT/INT/KI), current level number, fill bar (XP toward next level as percentage), title text at milestones. Framer Motion for fill animation on data update. Colors: orange (STR), green (VIT), blue (INT), purple (KI). Read-only display -- no interaction needed.

### 3. Capsule Corp Loot Box Reveal

**Expected behavior:** Two-phase interaction -- capsule appears, user taps to reveal reward.

**Implementation pattern:**
- **Phase 1:** Capsule icon bounces in from bottom with scale spring animation `scale: [0, 1.1, 1]` + "pop" sound. Capsule pulses with `scale: [1, 1.05, 1]` loop to invite interaction.
- **Phase 2:** On tap, 3D card flip via Framer Motion `rotateY: 180` with `perspective: 1000px` parent container. Back face reveals reward card. Rarity glow: white shimmer (common), blue pulse (rare), purple burst with particles (epic). Reward title + rarity badge displayed. Dismiss on tap/swipe or auto-dismiss after 4s.

### 4. Dragon Ball Tracker (7 Slots)

**Expected behavior:** 7 slots always visible on dashboard, filled balls glow, empty are dim.

**Implementation pattern:** Row of 7 circles. Use actual star-count imagery (1-star through 7-star balls). Filled: orange fill + CSS `box-shadow: 0 0 20px #FF6B00, 0 0 40px #FF4500` with subtle pulse `scale: [1, 1.05, 1]` on 3s loop. Empty: dim outline, dark fill. When new ball earned: trajectory animation (fly from top of screen into correct slot). At 7/7: all balls pulse synchronously to signal Shenron availability.

### 5. Perfect Day Explosion (100% Complete)

**Expected behavior:** 2-3 second full-screen celebration. THE moment of the daily loop.

**Implementation pattern:** Choreographed sequence using `AnimatePresence` with staggered `delay` values:
- **0ms:** Full-screen overlay fades in (opacity 0 to 0.9, black)
- **100ms:** Screen shake on dashboard body `x: [-10, 10, -10, 10, 0]` over 400ms
- **200ms:** Energy particles burst from center via `canvas-confetti` with custom colors (gold, orange, white) and `startVelocity: 45, spread: 360, ticks: 60`
- **500ms:** "100% COMPLETE" text scales in with spring `scale: [0, 1.2, 1]`, DBZ title card style font
- **800ms:** XP counter count-up animation (0 to final XP over 500ms) with multiplier reveal
- **1200ms:** "DRAGON BALL EARNED" notification slides in from right if applicable
- **1800ms:** Goku celebration quote fades in at bottom
- **2500ms:** Everything fades out, overlay opacity to 0, return to dashboard

### 6. Saiyan Avatar with Visual Progression

**Expected behavior:** Character image with form-appropriate aura, changes with power level.

**Implementation pattern:** Layered composition (3 layers):
1. **Background aura:** CSS radial gradient + blur filter, color per form (golden for SSJ, red for SSG, blue for SSB, silver for UI). Framer Motion opacity/scale pulse on loop.
2. **Character image:** Centered, ~200px height. Swap `src` on transformation change. Use `AnimatePresence` with crossfade for smooth swap.
3. **Foreground effects:** Optional CSS-only particles (small divs with CSS animation for floating sparks).

Power level displayed "scouter style" (monospace font, slight 5-degree tilt). Transformation progress bar below showing percentage to next form.

### 7. Sound Effects System

**Expected behavior:** Immediate audio feedback on every interaction, global toggle.

**Implementation pattern:** `use-sound` hook at component level. `SoundProvider` React context wrapping app root provides `soundEnabled` boolean and `playSound(name)` method. Preload critical sounds on mount (habit check beep, tier change burst). Lazy-load rare sounds (Shenron thunder, transformation power-up). All clips under 3 seconds. Use `playbackRate` variation (random 0.9-1.1) for repeated sounds to prevent monotony.

**Browser constraint:** Autoplay policy requires user-initiated first interaction. First habit check of each session naturally satisfies this -- no special handling needed.

**Sound map:**
| Event | Sound | Duration |
|-------|-------|----------|
| Habit checked | Scouter beep (bzzt-vwoosh) | ~0.5s |
| Aura growing | Ki charging hum | ~1s |
| Tier change (50%/80%) | Power-up burst | ~1s |
| Capsule drop | Capsule Corp pop | ~0.5s |
| Capsule open | Item reveal chime | ~1s |
| Perfect Day (100%) | SSJ scream / explosion | ~2s |
| Dragon Ball earned | Dragon Ball radar ping | ~1s |
| Shenron summoned | Thunder + Shenron roar | ~2s |
| Transformation | Power-up sequence | ~2s |
| Streak milestone | Achievement fanfare | ~1s |

### 8. Character Quote System

**Expected behavior:** Contextual quotes appear after interactions, matching event type and character personality.

**Implementation pattern:** Fixed bottom bar or slide-up toast component. Shows: character avatar (small circular icon), quote text (italic serif or stylized font), character name + saga attribution in smaller text. Quote data comes embedded in `check_habit` response (backend already selects contextually). For standalone display: `GET /quotes/random?trigger_event=X`. Display timing: fade in over 300ms, hold 5s, fade out over 300ms. Vegeta roasts get differentiated visual: red-tinted background, bolder font weight, Vegeta portrait.

### 9. Calendar Heatmap

**Expected behavior:** Month/year grid where each day is a colored cell showing completion quality.

**Implementation pattern:** `@uiw/react-heat-map` with custom rect render for color control. Four-tier color system:
- **Gold (#FFD700)** + CSS glow: 100% Perfect Day
- **Blue (#1E90FF)**: 75-99%
- **Red (#FF4444)**: 50-74%
- **Gray (#333)**: <50%
- **Blue outline**: Off Day

Click cell to open popover (Framer Motion scale-in from click position) with: date, completion %, per-habit list (completed/missed), XP earned, capsule drops that day. Month navigation with left/right arrows. Data from `GET /habits/calendar/all`.

### 10. Analytics Charts (Attribute Progression)

**Expected behavior:** Line/area charts showing growth over time, summary stats at a glance.

**Implementation pattern:** Recharts with `ResponsiveContainer` (fills parent width). Two main visualizations:
1. **Attribute progression:** `AreaChart` with 4 `Area` components in attribute colors (STR orange, VIT green, INT blue, KI purple). `Tooltip` on hover showing exact values per attribute.
2. **Power level:** Single `LineChart` showing cumulative XP over days.

Period selector above charts (week/month/all) using `GET /analytics/summary?period=X`. Summary stat cards row: perfect days count, average %, total XP, longest streak -- each as a card with icon, number, and label. Capsule history and wish history as simple chronological lists below charts.

### 11. Settings with CRUD

**Expected behavior:** Organized settings page with sections for profile, preferences, and content management.

**Implementation pattern:** Sectioned layout (not tabbed -- single scrollable page is simpler):
1. **Warrior Profile:** Display name text input
2. **Preferences:** Sound toggle (switch), Theme selector (dark/light toggle)
3. **Categories:** List with color dot + name. Add/edit/delete buttons. Color picker for hex code, emoji picker for icon
4. **Capsule Rewards:** List grouped by rarity (common/rare/epic sections with color coding). Each item shows title + edit/delete icons. "Add Reward" button with rarity radio selector. Show distribution stats (60%/30%/10%)
5. **Shenron Wishes:** Simple list with title + active toggle + times_wished count. "Add Wish" button. Visual: golden border on active wishes
6. **Habit Management:** Full habit list with edit/archive actions (links to habit CRUD modal)

Optimistic UI updates for snappy feel. Toast notifications on save success/failure.

---

## Competitor Feature Analysis

| Feature | Habitica | Streaks (iOS) | Finch (pet care) | Our Approach |
|---------|----------|---------------|------------------|--------------|
| Progress visualization | HP/XP bars, generic RPG | Streak count number | Pet growth stages | Percentage aura + 4 RPG attribute bars -- most granular |
| Celebration effects | Basic level-up notification | Checkmark animation | Pet dances/celebrates | Full-screen DBZ explosion with screen shake -- 10x more dramatic |
| Variable rewards | Gold for gear/items | None | Random stones for cosmetics | Capsule Corp gacha with 3D reveal + user-defined real-life rewards |
| Sound design | Minimal notification sounds | Silent | Ambient/gentle | EVERY interaction has a DBZ sound -- core differentiator |
| Long-term goals | Social quests (party-based) | None | Monthly goals | Dragon Ball collection + Shenron wishes -- unique macro loop |
| Character system | Generic fantasy avatar with gear | None | Virtual pet | 10-form Saiyan transformation -- deep visual progression |
| Calendar view | Basic task completion grid | Streak count only | Timeline | Gold/blue/red/gray heatmap with click-to-detail popover |
| Streak forgiveness | Hard reset on miss | Full streak loss | Flexible commitment | Zenkai halve + 50% comeback bonus -- most ADHD-friendly |
| ADHD optimization | HP loss works AGAINST ADHD | Too minimal to engage | Gentle but passive | Engineered for ADHD: audio+visual every action, no punishment, variable loot |
| Reward personalization | Predefined game items | None | Predefined cosmetics | User configures both loot pool AND macro rewards -- unique |

### Key Competitive Differentiators

1. **Audio-first design** -- sound on every interaction (no competitor does this for habit tracking)
2. **Engineered for competitive ADHD** -- the 100% obsession target, XP cliff at 83%->100%, screen-shaking climax
3. **User-controlled reward economy** -- both capsule loot AND Shenron wishes are user-defined real-life rewards
4. **Forgiving streaks as a design pillar** -- Zenkai is the most ADHD-friendly streak system in the market
5. **Coherent IP theming** -- DBZ is not decoration; it defines every mechanic name, sound, and visual

---

## Sources

### Libraries (verified via documentation)
- [use-sound](https://github.com/joshwcomeau/use-sound) -- ~1kb gzip React hook wrapping Howler.js, supports playbackRate and volume (HIGH confidence)
- [@uiw/react-heat-map](https://github.com/uiwjs/react-heat-map) -- lightweight SVG calendar heatmap, customizable colors and cell render (HIGH confidence)
- [react-calendar-heatmap](https://github.com/kevinsqi/react-calendar-heatmap) -- alternative SVG heatmap, GitHub-style (HIGH confidence)
- [canvas-confetti](https://github.com/catdad/canvas-confetti) -- performant canvas particle effects, customizable colors/shapes/velocity (HIGH confidence)
- [tsParticles](https://particles.js.org/) -- heavier particle system with React integration, more config options (HIGH confidence)
- [Recharts](https://github.com/recharts/recharts) -- declarative React charting on SVG, responsive container, good for simple dashboards (HIGH confidence)

### Animation patterns
- [Framer Motion card flip (3D rotateY)](https://dev.to/graciesharma/how-to-create-a-flipping-card-animation-using-framer-motion-5djh) -- capsule reveal pattern (MEDIUM confidence)
- [Framer Motion docs](https://motion.dev/docs/react-animation) -- spring animations, AnimatePresence, layout animations (HIGH confidence)
- [React animation libraries 2025](https://dev.to/raajaryan/react-animation-libraries-in-2025-what-companies-are-actually-using-3lik) -- confirms Framer Motion as industry standard (MEDIUM confidence)

### Assets
- [Freesound.org](https://freesound.org/) -- CC0 sound effects for sourcing DBZ-style clips (HIGH confidence)

### Competitor analysis
- [Habitica](https://github.com/HabitRPG/habitica) -- open source, HP-based punishment model (HIGH confidence)
- [Streaks](https://streaksapp.com/) -- iOS-only, minimal gamification (HIGH confidence)
- [Finch](https://finchcare.com/) -- pet care framing, gentle/passive (HIGH confidence)

### ADHD/Gamification research
- [Gamification in habit tracking -- Cohorty](https://blog.cohorty.app/gamification-in-habit-tracking-does-it-work-research-real-user-data) -- real user data on dropout rates (MEDIUM confidence)
- [Variable rewards -- Nir Eyal](https://www.nirandfar.com/want-to-hook-your-users-drive-them-crazy/) -- variable reward schedule psychology (HIGH confidence)

---
*Feature research for: Saiyan Tracker v1.1 Frontend -- The Dopamine Edition*
*Researched: 2026-03-04*
