# Saiyan Tracker — Product Requirements Document

**Version:** 1.0
**Author:** Bulma (Product & Architecture)
**Date:** February 27, 2026
**Status:** Ready for Implementation

---

## 1. Problem Statement

Sergio has ADHD and a competitive swimmer background. Traditional task managers and habit trackers fail him because they're passive — they don't create the dopamine feedback loop his brain needs. Without visible progress, competition against himself, and consequences for slacking, he loses interest within days.

He needs a system that turns daily productivity into a game he can't stop playing. Something that tracks tasks across work and personal life, rewards consistency with visible progression, and punishes slacking with enough social pressure (from fictional characters) to snap him back on track.

**Who is affected:** Sergio — solo user (Phase 1). The system is designed for one person, not multi-tenant.

**Impact of not solving it:** Tasks pile up, side business stagnates, daily habits erode, and the ADHD cycle of starting-then-abandoning continues.

---

## 2. Goals

1. **Daily engagement:** Sergio opens the app and completes tasks every single day (measured by streak length and daily login rate)
2. **Visible progression:** Total power level and transformation milestones create a permanent, visible record of accumulated effort
3. **Balanced productivity:** Points system weighted by category ensures side business tasks aren't neglected in favor of easy wins
4. **Energy-aware scheduling:** Task suggestions adapt to Sergio's self-reported energy level, reducing friction on low-energy days
5. **Accountability:** Vegeta escalation system creates social-pressure consequences for consecutive missed days

---

## 3. Non-Goals (Phase 1)

- **Multi-user / auth system:** Single user, no login required. A default user is seeded on first run.
- **Mobile app / PWA:** Phase 2. Phase 1 is desktop web only (though responsive enough for tablet).
- **Notion / Todoist integration:** Phase 2. Phase 1 uses manual task creation only.
- **VPS hosting / deployment:** Phase 2. Phase 1 runs locally (`localhost`).
- **Activity logging of everything:** Phase 2. Phase 1 logs completions and daily summaries, not granular time tracking.
- **AI-powered task prioritization ("main task" detection):** Deferred. May belong in a separate project manager tool.
- **Work vs. side business division in the UI:** Removed per Sergio's note. Categories handle the distinction instead.

---

## 4. User Stories

### Daily Workflow

- **As Sergio,** I want to open the app and immediately see my current power level, streak, and today's progress so I know where I stand without thinking.
- **As Sergio,** I want to select my energy level (low / medium / high) when I open the app so that it highlights tasks that match how I'm feeling right now.
- **As Sergio,** I want to complete a task with one click and see the points animate upward so I get instant dopamine feedback.
- **As Sergio,** I want to see Vegeta roast me when I've missed my daily minimum for 2+ consecutive days so I feel accountable even when no one is watching.
- **As Sergio,** I want Goku to cheer me on when I complete a task or hit a streak milestone so the positive reinforcement keeps me going.

### Task Management

- **As Sergio,** I want to create tasks with a category (Side Business, Work, Personal, Recreational), base points, and energy level so the system knows how to weight and suggest them.
- **As Sergio,** I want each category to have a point multiplier (Side Business = 1.5×, Work = 1.0×, Personal = 0.7×, Recreational = 0.5×) so high-priority work is always worth more.
- **As Sergio,** I want to mark a day as an off-day (sick, vacation, rest, injury) with a reason so my streak doesn't break for legitimate rest.

### Gamification

- **As Sergio,** I want a cumulative "power level" (not just daily points) that grows over time and never resets so I feel permanent progression.
- **As Sergio,** I want to unlock character transformations (Base → SSJ → SSJ2 → SSJ3 → SSG → SSB → UI) at specific power thresholds so I have clear goals to chase.
- **As Sergio,** I want an epic animation when I unlock a new transformation so the moment feels meaningful and memorable.
- **As Sergio,** I want a daily minimum point threshold that I must hit to keep my streak alive so I have a clear daily target.
- **As Sergio,** I want streak bonuses that multiply my points at milestones (7 days, 14 days, 30 days, etc.) so long streaks are disproportionately rewarded.

### Analytics

- **As Sergio,** I want to see weekly, monthly, and yearly views of my power level progression so I can visualize my consistency over time.
- **As Sergio,** I want a category breakdown chart so I can see if I'm overweighting one area and neglecting another.
- **As Sergio,** I want my power level graphed over time so I can see the trend line of my growth.

---

## 5. Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | React 18 + Vite + TypeScript | Fast dev server, component-based, excellent animation ecosystem |
| **State Management** | Zustand | Minimal boilerplate, perfect for medium-complexity single-user app |
| **Animations** | Framer Motion | Declarative, performant, handles transformation sequences well |
| **Charts** | Recharts | React-native charting, responsive, minimal config |
| **Styling** | Tailwind CSS | Utility-first, rapid UI development, easy theming |
| **Backend** | Python FastAPI | Async, fast, auto-docs, great Notion/Todoist integration path for Phase 2 |
| **ORM** | SQLAlchemy 2.0 | Flexible, database-agnostic (SQLite dev → PostgreSQL prod) |
| **Database (Dev)** | SQLite | Zero setup, good for single-user local dev |
| **Database (Prod)** | PostgreSQL | Phase 2 target. SQLAlchemy abstraction makes the switch trivial — change the connection string only |
| **Migrations** | Alembic | SQLAlchemy's migration tool. Not strictly needed for Phase 1 (tables created on startup) but set up the structure |

---

## 6. System Architecture

```
┌─────────────────────┐         ┌──────────────────────┐
│   React Frontend    │  HTTP   │   FastAPI Backend     │
│   (Vite dev server) │ ──────→ │   (Uvicorn)          │
│   localhost:5173    │  /api/  │   localhost:8000      │
└─────────────────────┘         └──────────┬───────────┘
                                           │
                                           │ SQLAlchemy
                                           │
                                    ┌──────▼───────┐
                                    │   SQLite     │
                                    │  (dev)       │
                                    │  PostgreSQL  │
                                    │  (prod)      │
                                    └──────────────┘
```

**Proxy setup:** Vite dev server proxies `/api/*` requests to `http://localhost:8000` so the frontend makes same-origin API calls. In production, both are served from the same host behind a reverse proxy (Phase 2).

**CORS:** Backend allows origins `http://localhost:5173`, `http://localhost:3000`, and `*` (dev only). Lock down for production.

---

## 7. Database Schema

### 7.1 Users

Single user for Phase 1. Seeded automatically on first startup.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (string) | Primary key. Default user ID: `"default-user"` |
| username | VARCHAR(255) | Unique. Default: `"Sergio"` |
| email | VARCHAR(255) | Unique |
| daily_point_minimum | INTEGER | Default: `100`. Configurable via settings |
| created_at | TIMESTAMP | Auto |
| updated_at | TIMESTAMP | Auto |

### 7.2 Task Categories

Pre-seeded with 4 default categories. User can modify multipliers and add new ones.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | FK → users.id |
| name | VARCHAR(100) | e.g., "Side Business", "Work", "Personal", "Recreational" |
| point_multiplier | FLOAT | Default: `1.0`. Side Business = `1.5`, Work = `1.0`, Personal = `0.7`, Recreational = `0.5` |
| color_code | VARCHAR(7) | Hex. Used in UI badges and charts |
| icon | VARCHAR(50) | Lucide icon name (e.g., "rocket", "briefcase", "user", "gamepad") |
| created_at | TIMESTAMP | Auto |

**Default seed data:**

| Name | Multiplier | Color | Icon |
|------|-----------|-------|------|
| Side Business | 1.5× | #FF6B00 (orange) | rocket |
| Work | 1.0× | #3B82F6 (blue) | briefcase |
| Personal | 0.7× | #10B981 (green) | user |
| Recreational | 0.5× | #8B5CF6 (purple) | gamepad |

### 7.3 Tasks

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | FK → users.id |
| category_id | UUID | FK → task_categories.id |
| title | VARCHAR(255) | Required |
| description | TEXT | Optional |
| base_points | INTEGER | Required. Default: `10`. This is the raw value before multiplier |
| energy_level | VARCHAR(50) | `"low"`, `"medium"`, or `"high"`. The energy required to do this task |
| estimated_minutes | INTEGER | Optional. Shown in UI for context |
| recurring | BOOLEAN | Default: `false`. Phase 2 feature |
| recurrence_pattern | VARCHAR(50) | `"daily"`, `"weekly"`, `"monthly"`. Phase 2 |
| is_active | BOOLEAN | Default: `true`. Soft delete — set to `false` instead of removing |
| created_at | TIMESTAMP | Auto |
| updated_at | TIMESTAMP | Auto |

### 7.4 Task Completions

One record per task completion. A task can be completed multiple times (recurring or not — logging each instance separately).

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | FK → users.id |
| task_id | UUID | FK → tasks.id |
| completed_at | TIMESTAMP | Default: now. Used for daily grouping |
| points_awarded | INTEGER | Calculated at completion time: `floor(base_points × category_multiplier) + streak_bonus` |
| energy_at_completion | VARCHAR(50) | The user's selected energy level at the time they completed this task |
| notes | TEXT | Optional freeform note |

### 7.5 Daily Logs

Denormalized summary per day. Created/updated whenever a task is completed or an off-day is marked. This powers the analytics views without expensive joins.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | FK → users.id |
| log_date | DATE | Unique per user per day |
| total_points_earned | INTEGER | Sum of all task_completions.points_awarded for this day |
| daily_minimum_met | BOOLEAN | `total_points_earned >= user.daily_point_minimum` |
| is_off_day | BOOLEAN | Marked via off-day form |
| off_day_reason | VARCHAR(100) | `"sick"`, `"vacation"`, `"rest"`, `"injury"`, `"other"` |
| tasks_completed | INTEGER | Count of completions for the day |
| login_bonus_earned | BOOLEAN | True if user opened the app today (first daily interaction) |
| created_at | TIMESTAMP | Auto |
| updated_at | TIMESTAMP | Auto |

### 7.6 Streaks

One record per user. Updated on every task completion.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | FK → users.id. Unique constraint |
| current_streak | INTEGER | Consecutive days of hitting daily minimum (off-days don't break it) |
| best_streak | INTEGER | Historical maximum |
| streak_start_date | DATE | When the current streak began |
| last_completion_date | DATE | Last date the daily minimum was met |
| created_at | TIMESTAMP | Auto |
| updated_at | TIMESTAMP | Auto |

**Streak rules:**
- Streak +1 if `daily_minimum_met = true`
- Streak +1 if `is_off_day = true` (off days preserve streaks)
- Streak resets to 0 if `daily_minimum_met = false AND is_off_day = false`
- If there's a gap of multiple days, check if all gap days were off-days. If yes, streak continues. If any gap day is neither off-day nor met, streak resets.

### 7.7 Power Levels (History)

One record per user per day. Snapshot of cumulative total for charting.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | FK → users.id |
| power_level_date | DATE | Unique per user per day |
| total_power_points | INTEGER | Cumulative sum of all points ever earned, as of this date |
| transformation_level | VARCHAR(50) | The transformation level at this total (e.g., `"ssj2"`) |
| created_at | TIMESTAMP | Auto |

### 7.8 Off Days

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | FK → users.id |
| off_day_date | DATE | Unique per user per day |
| reason | VARCHAR(100) | Required: `"sick"`, `"vacation"`, `"rest"`, `"injury"`, `"other"` |
| notes | TEXT | Optional freeform |
| created_at | TIMESTAMP | Auto |

### 7.9 Achievements

Tracks permanent unlocks: transformations, streak milestones, etc.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | FK → users.id |
| achievement_type | VARCHAR(100) | `"transformation"`, `"streak"`, `"milestone"` |
| transformation_level | VARCHAR(50) | Nullable. Only for type `"transformation"` |
| description | TEXT | Human-readable (e.g., "Achieved Super Saiyan!") |
| achieved_at | TIMESTAMP | When unlocked |
| power_points_at_achievement | INTEGER | Total points at the time |

### 7.10 Quotes

Vegeta roasts and Goku motivational quotes. Seeded on first startup.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| character | VARCHAR(50) | `"vegeta"` or `"goku"` |
| quote_text | TEXT | The actual quote |
| context | VARCHAR(100) | When to show: `"slacking"`, `"motivation"`, `"task_complete"`, `"streak"`, `"transformation"` |
| severity | INTEGER | For Vegeta only: `1` = mild, `2` = medium, `3` = savage. Goku is always `0`. |
| created_at | TIMESTAMP | Auto |

---

## 8. Gamification System

### 8.1 Points Calculation

When a task is completed:

```
effective_points = floor(task.base_points × category.point_multiplier)
streak_bonus = effective_points × streak_bonus_percentage
total_awarded = effective_points + floor(streak_bonus)
```

**Example:**
- Task: "Ship landing page" — base_points = 50, category = Side Business (1.5×)
- Streak: 15 days (8% bonus)
- Effective = floor(50 × 1.5) = 75
- Streak bonus = floor(75 × 0.08) = 6
- Total awarded = 81 points

### 8.2 Streak Bonuses

| Streak Days | Bonus Multiplier |
|-------------|-----------------|
| 1–6 | 0% |
| 7–13 | +5% |
| 14–29 | +8% |
| 30–59 | +10% |
| 60–89 | +15% |
| 90+ | +20% |

Applied per-task at completion time. The highest applicable tier is used (not cumulative).

### 8.3 Daily Minimum

- Default: 100 points per day (configurable in settings, range 25–500, step 25)
- Meeting the minimum: `total_points_earned_today >= daily_point_minimum`
- Off-days don't need to meet the minimum
- Login bonus: +10 points for opening the app (first interaction of the day)

### 8.4 Transformation Thresholds

Total power points are cumulative and never reset. The transformation level is determined by the user's lifetime total.

| Level | Name | Threshold (cumulative) | Aura Color |
|-------|------|----------------------|------------|
| `base` | Base Form | 0 | #888899 (gray) |
| `ssj` | Super Saiyan | 500 | #FFD700 (gold) |
| `ssj2` | Super Saiyan 2 | 1,500 | #FFD700 (gold) |
| `ssj3` | Super Saiyan 3 | 3,500 | #FFD700 (gold) |
| `ssg` | Super Saiyan God | 7,000 | #FF4444 (red) |
| `ssb` | Super Saiyan Blue | 12,000 | #1E90FF (blue) |
| `ui` | Ultra Instinct | 20,000 | #C0C0FF (silver) |

**Transformation progress** between levels is shown as a percentage: `(current_points - current_threshold) / (next_threshold - current_threshold) × 100`

**When a new transformation is unlocked:**
1. An achievement record is created
2. The frontend triggers the TransformationAnimation component
3. A Goku "transformation" quote is shown after the animation

### 8.5 Vegeta Roast System

Triggered when Sergio has consecutive days where daily minimum is NOT met and the day is NOT an off-day.

| Consecutive Missed Days | Severity | Vegeta's Tone |
|------------------------|----------|---------------|
| 1 | No roast | Grace period |
| 2 | 1 (mild) | Disappointed, condescending |
| 3–5 | 2 (medium) | Angry, insulting |
| 6+ | 3 (savage) | Full rage, personal attacks |

**Display behavior:**
- Shown as a dialog box on the bottom-right of the dashboard
- Slides in from the right with a spring animation
- Character avatar (crown emoji for Vegeta), name, mood label, and the quote
- Dismissed with a click — button text: "Dismiss (if you dare)"
- A new random quote from the appropriate severity pool is fetched each time

### 8.6 Goku Motivation System

Triggered on positive events.

| Trigger | Quote Context |
|---------|--------------|
| Task completed | `"task_complete"` |
| Daily minimum met | `"motivation"` |
| Streak milestone (7, 14, 30, 60, 90 days) | `"streak"` |
| New transformation unlocked | `"transformation"` |

**Display behavior:**
- Shown as a dialog box on the bottom-left of the dashboard
- Slides up with a spring animation
- Character avatar (fist emoji for Goku), name, mood label, and the quote
- Auto-dismisses after 5 seconds or on click — button text: "Thanks, Goku!"

### 8.7 Seed Quotes

Minimum 20 Vegeta roasts (roughly 7 per severity level) and 15 Goku quotes (across contexts). Here's the required content:

**Vegeta — Severity 1 (Mild/Disappointed):**
- "Is that all you've got? Even Yamcha puts in more effort!"
- "You call that training? My warm-up is more intense than your entire day!"
- "Hmph. At this rate, you'll never surpass your limits."
- "A true Saiyan warrior doesn't rest when there's work to be done!"
- "You're slacking off? How disappointing."
- "I've seen Saibamen with more dedication than you."
- "Your power level is... embarrassing."

**Vegeta — Severity 2 (Angry):**
- "PATHETIC! You're weaker than Krillin on his worst day!"
- "This is a disgrace to the Saiyan race! Get off your ass!"
- "You think sitting around will make you stronger?! FOOL!"
- "Kakarot would NEVER slack this much. Are you even trying?!"
- "Every second you waste, your enemies grow stronger!"
- "I didn't endure 150x gravity to watch YOU be lazy!"

**Vegeta — Severity 3 (Savage):**
- "YOU ABSOLUTE WASTE OF SAIYAN POTENTIAL! I should have left you on Earth to rot!"
- "WHAT IS THIS PATHETIC DISPLAY?! You're an embarrassment to every warrior who ever lived!"
- "I'VE HAD ENOUGH! Either get up and fight or admit you're NOTHING!"
- "You disgust me! Even Frieza showed more dedication, and he's a TYRANT!"
- "UNACCEPTABLE! Your power level is dropping! You're going BACKWARDS!"
- "At this rate, you couldn't beat a FARMER WITH A SHOTGUN!"

**Goku — Motivation:**
- "Hey! Every bit of training counts! You're doing awesome!"
- "I always look forward to a challenge! You should too!"
- "The more you push yourself, the stronger you get! That's the fun part!"
- "You're getting stronger! I can feel it!"
- "There's always room to grow! Let's keep going!"
- "Power comes in response to a need. And right now, you need to crush those tasks!"
- "I've learned that the more you train, the more surprises you find! Keep at it!"
- "Giving up isn't in our vocabulary! Let's do this!"

**Goku — Task Complete:**
- "AMAZING! You just powered up! That felt great, right?!"
- "Woah! Your power level just jumped! Keep it up!"
- "That's the spirit! Every task makes you stronger!"
- "You're on fire today! This is SO exciting!"

**Goku — Streak:**
- "Your streak is incredible! You're training like a TRUE warrior!"
- "Look at that consistency! Even I'm impressed!"
- "You haven't missed a day! That's the kind of discipline that creates legends!"
- "This streak proves it — you've got the heart of a Saiyan!"

**Goku — Transformation:**
- "INCREDIBLE! You've broken through your limits! A new transformation!"
- "I felt that from across the universe! You just reached a WHOLE NEW LEVEL!"
- "This power... it's amazing! You've ascended beyond what I thought possible!"

---

## 9. API Specification

**Base URL:** `http://localhost:8000/api/v1`

All endpoints assume `user_id = "default-user"` (Phase 1, no auth).

### 9.1 Tasks

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|-------------|
| GET | `/tasks/` | List all active tasks | `energy_level` (optional), `category_id` (optional) |
| GET | `/tasks/{task_id}` | Get single task | — |
| POST | `/tasks/` | Create task | — |
| PUT | `/tasks/{task_id}` | Update task | — |
| DELETE | `/tasks/{task_id}` | Soft-delete task (sets `is_active = false`) | — |

**POST /tasks/ request body:**
```json
{
  "category_id": "uuid",
  "title": "string (required)",
  "description": "string (optional)",
  "base_points": 10,
  "energy_level": "medium",
  "estimated_minutes": 30
}
```

**GET /tasks/ response enrichment:** Each task in the response includes computed fields: `category_name`, `category_color`, `category_multiplier`, and `effective_points` (= floor(base_points × multiplier)).

### 9.2 Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories/` | List all categories |
| POST | `/categories/` | Create category |
| PUT | `/categories/{id}` | Update category |

### 9.3 Completions

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/completions/` | Complete a task. Triggers points calculation, daily log update, streak update, transformation check |
| GET | `/completions/today` | Get all completions for today |
| DELETE | `/completions/{id}` | Undo a completion (recalculates daily log) |

**POST /completions/ request body:**
```json
{
  "task_id": "uuid (required)",
  "energy_at_completion": "medium (optional)",
  "notes": "string (optional)"
}
```

**POST /completions/ response:**
```json
{
  "completion_id": "uuid",
  "points_awarded": 81,
  "base_points": 75,
  "bonus_points": 6,
  "streak_bonus_pct": 0.08,
  "new_total_power": 1581,
  "daily_points": 156,
  "daily_minimum_met": true,
  "new_transformation": {
    "new_level": "ssj2",
    "new_name": "Super Saiyan 2",
    "total_points": 1581
  }
}
```

The `new_transformation` field is `null` unless a new transformation was unlocked by this completion. The frontend uses this to trigger the transformation animation.

### 9.4 Power

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|-------------|
| GET | `/power/current` | Current power level, transformation, streak, daily progress | — |
| GET | `/power/transformations` | All transformation tiers with unlock status | — |
| GET | `/power/history` | Historical power level data for charting | `days` (default 30) |

**GET /power/current response:**
```json
{
  "total_power_points": 1581,
  "transformation_level": "ssj2",
  "transformation_name": "Super Saiyan 2",
  "next_transformation": "ssj3",
  "next_transformation_name": "Super Saiyan 3",
  "points_to_next": 1919,
  "progress_percentage": 4.1,
  "daily_points_today": 156,
  "current_streak": 15,
  "daily_minimum": 100,
  "daily_minimum_met": true
}
```

### 9.5 Quotes

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|-------------|
| GET | `/quotes/vegeta/roast` | Random Vegeta roast | `missed_days` (determines severity) |
| GET | `/quotes/goku/motivation` | Random Goku quote | `context` (motivation, task_complete, streak, transformation) |
| GET | `/quotes/contextual` | Auto-selects the right character and context based on current state | — |

### 9.6 Off Days

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/off-days/` | List all off days (sorted newest first) |
| POST | `/off-days/` | Mark a day as off-day. Also updates the daily_log |
| DELETE | `/off-days/{id}` | Remove off-day designation |

### 9.7 Analytics

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|-------------|
| GET | `/analytics/weekly` | Last 7 days of daily stats | — |
| GET | `/analytics/category-breakdown` | Points by category | `days` (default 30) |

### 9.8 Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/settings/` | Get user settings (daily_minimum, username, email) |
| PUT | `/settings/` | Update settings |

---

## 10. Frontend Specification

### 10.1 Theme

**Design principle:** Clean dashboard for daily use. Epic animations reserved for milestone moments.

**Color palette:**

| Token | Hex | Usage |
|-------|-----|-------|
| `saiyan-orange` | #FF6B00 | Primary accent — buttons, active states, Goku's color |
| `saiyan-blue` | #1E90FF | Secondary accent — off-day elements, links |
| `saiyan-gold` | #FFD700 | SSJ aura, streak highlights |
| `saiyan-dark` | #0A0A0F | Page background |
| `saiyan-darker` | #050508 | Header/footer background |
| `saiyan-card` | #12121A | Card backgrounds |
| `saiyan-border` | #1E1E2E | Borders, dividers |
| `saiyan-text` | #E0E0E0 | Primary text |
| `saiyan-muted` | #888899 | Secondary text, labels |

**Fonts:**
- Body: `Rajdhani` (Google Fonts) — clean, slightly techy, readable
- Numbers/Power levels: `Orbitron` (Google Fonts) — futuristic, monospace-feeling, perfect for "power level" displays
- Fallback: `sans-serif`

**Aura effects (CSS):** Each transformation level gets a glow effect class applied to the character display and power bar:
- `base`: none
- `ssj/ssj2/ssj3`: gold glow (`0 0 20-30px rgba(255, 215, 0, 0.4-0.8)`)
- `ssg`: red glow (`0 0 30px rgba(255, 50, 50, 0.6)`)
- `ssb`: blue glow (`0 0 30px rgba(30, 144, 255, 0.6)`)
- `ui`: silver glow (`0 0 40px rgba(192, 192, 255, 0.7)`)

### 10.2 Pages & Routing

| Path | Page | Description |
|------|------|-------------|
| `/` | Dashboard | Main view — power level, tasks, energy selector, streaks, transformations |
| `/analytics` | Analytics | Charts — weekly bar, category pie, power history line |
| `/settings` | Settings | Daily minimum slider, category list, transformation thresholds reference |

**Navigation:** Bottom nav on mobile, top nav on desktop. Three icons: Dashboard, Analytics, Settings. Active state uses a sliding highlight with `framer-motion` `layoutId`.

### 10.3 Dashboard Layout

```
┌──────────────────────────────────────────────────────┐
│  SAIYAN TRACKER              [Off Day] [+ New Task]  │  ← Header
├──────────────────────────────┬───────────────────────┤
│                              │                       │
│  ┌─ Power Level Bar ───────┐ │  ┌─ Streak Display ─┐ │
│  │ PL: 1,581  ██████░░ SSJ2│ │  │  🔥 15 Day Streak│ │
│  │ Today: 156/100 ✓ MET    │ │  │  Best: 22 days   │ │
│  └──────────────────────────┘ │  └──────────────────┘ │
│                              │                       │
│  ┌─ Energy Selector ───────┐ │  ┌─ Transformation ─┐ │
│  │ 🔋 Low  ⚡ Med  🔥 High │ │  │  ✓ Base           │ │
│  └──────────────────────────┘ │  │  ✓ SSJ            │ │
│                              │  │  ● SSJ2 ██░ 4%    │ │
│  ┌─ Training Tasks (5) ────┐ │  │  🔒 SSJ3          │ │
│  │ ○ Ship landing page     │ │  │  🔒 SSG           │ │
│  │   Side Biz  ⚡75  🔥High │ │  │  🔒 SSB           │ │
│  │ ○ Review PR             │ │  │  🔒 UI            │ │
│  │   Work  ⚡30  ⚡Medium   │ │  └──────────────────┘ │
│  │ ○ Clean kitchen         │ │                       │
│  │   Personal  ⚡14  🔋Low  │ │  ┌─ Today Summary ──┐ │
│  └──────────────────────────┘ │  │  Tasks: 2         │ │
│                              │  │  Points: 105      │ │
│  ┌─ Completed Today (2) ───┐ │  │  Min: MET ✓       │ │
│  │ ✓ Task A  ✓ Task B      │ │  └──────────────────┘ │
│  └──────────────────────────┘ │                       │
├──────────────────────────────┴───────────────────────┤
│  [Dashboard]     [Analytics]      [Settings]         │  ← Nav
└──────────────────────────────────────────────────────┘
```

**Left column (2/3 width):** PowerLevelBar → EnergySelector → Active TaskCards → Completed TaskCards
**Right column (1/3 width):** StreakDisplay → TransformationMeter → Today's Summary

### 10.4 Component Specification

#### PowerLevelBar
- Shows total cumulative power level (Orbitron font, transformation color)
- Shows transformation name and distance to next
- Transformation progress bar (animated fill with Framer Motion)
- Daily progress sub-bar: `today_points / daily_minimum` with green if met, orange if not
- Power level number animates (scale bounce) on update

#### TaskCard
- Left: circular complete button (checkbox). Click = complete task. Filled green with check when done.
- Center: title (bold), description (truncated), category badge (colored pill), energy indicator (emoji + label), optional duration
- Right: effective points in Orbitron font with Zap icon
- Stagger animation: each card slides in from left with 50ms delay
- Completed tasks get reduced opacity and strikethrough title

#### StreakDisplay
- Large streak number (Orbitron) with flame icon
- Icon animates (wiggle + scale) when streak >= 7
- Card border pulses with saiyan-orange glow when streak >= 30
- Shows best streak underneath

#### EnergySelector
- Three buttons: Low (🔋 green), Medium (⚡ yellow), High (🔥 red)
- Selected state: colored border + tinted background
- Clicking the same button deselects (shows all tasks)
- When selected, tasks in the list are sorted: matching energy first, then adjacent, then opposite

#### TransformationMeter
- Vertical list of all 7 transformation tiers
- Each tier shows: colored dot, name, threshold
- Current tier: dot glows, name is colored, shows progress bar to next
- Unlocked tiers: green checkmark
- Locked tiers: lock icon, reduced opacity

#### TransformationAnimation (overlay)
- Full-screen overlay, z-index 50
- Background flashes: transparent → color → white → color → dark
- Center: glowing circle (transformation color) with aura pulse animation
- Inside circle: emoji character representation
- Text: "NEW FORM UNLOCKED" (tracking-wider, faded color, pulsing opacity)
- Name: large Orbitron text, letter-spacing animation (wide → normal)
- 12 particle dots explode outward from center in a circle pattern
- Dismissed by clicking anywhere
- Duration: ~3 seconds before dismiss prompt appears

#### PointsPopup
- Appears at center-top of viewport on task completion
- "+{points}" in large Orbitron orange text with Zap icon
- Floats upward and fades out over 1.8 seconds
- Text shadow for glow effect

#### VegetaDialog
- Fixed position: bottom-right
- Slides in from right (spring animation)
- Card with colored border based on severity (yellow/orange/red)
- Avatar: 👑 emoji in blue circle
- Header: "Vegeta" (blue) + mood label
- Body: quote in italics
- Dismiss button: "Dismiss (if you dare)"

#### GokuQuote
- Fixed position: bottom-left
- Slides up (spring animation)
- Card with orange border
- Avatar: ✊ emoji in orange circle
- Header: "Goku" (orange) + context label
- Body: quote text
- Dismiss button: "Thanks, Goku!"
- Auto-dismisses after 5 seconds

#### TaskFormModal
- Modal overlay (dark bg, centered card)
- Fields: title (text input), description (textarea), category (button group), base points (number), duration (number), energy level (button group Low/Med/High)
- Category buttons show name and multiplier, colored when selected
- Submit button: "Add Task" in orange

#### OffDayModal
- Modal overlay
- Reason selector: 5 options as emoji cards (🤒 Sick, 🏖️ Vacation, 😴 Rest, 🩹 Injury, 📝 Other)
- Notes textarea (optional)
- Subtitle: "Even Saiyans need rest. This won't break your streak."

### 10.5 Analytics Page

- Top row: 4 stat cards — Weekly Points, Daily Average, Days Min Met (n/7), Success Rate (%)
- Time range selector: 7d / 30d / 90d buttons
- Chart grid (2 columns on desktop):
  - WeeklyChart: Bar chart (Recharts). Bars colored orange if min met, gray if not, blue if off-day. Reference line at daily minimum.
  - CategoryBreakdown: Donut/pie chart. Each slice = category color. Legend below. Center shows total.
  - PowerHistoryChart (full width): Area chart. Line color = current transformation color. Gradient fill. X-axis = dates, Y-axis = cumulative power.

### 10.6 Settings Page

- Warrior Profile: read-only name and email
- Daily Power Minimum: range slider (25–500, step 25) with live number display in Orbitron
- Task Categories: list with color dot, name, and multiplier. Read-only in Phase 1.
- Transformation Thresholds: reference table showing all levels and required PL

### 10.7 State Management (Zustand Stores)

| Store | State | Key Actions |
|-------|-------|-------------|
| `taskStore` | tasks, categories, todayCompletions, selectedEnergy, loading, error | fetchTasks, fetchCategories, createTask, completeTask, undoCompletion, setSelectedEnergy |
| `powerStore` | power (PowerLevel), transformations, newTransformation | fetchPower, fetchTransformations, updateFromCompletion, setNewTransformation |
| `uiStore` | activeQuote, showTaskForm, showOffDayForm, pointsPopup | setActiveQuote, setShowTaskForm, setShowOffDayForm, triggerPointsPopup |

### 10.8 Task Completion Flow (Critical Path)

This is the most important interaction. Here's the exact sequence:

1. User clicks the circle button on a TaskCard
2. Frontend calls `POST /completions/` with `task_id` and current `energy_at_completion`
3. Backend calculates: `base × multiplier + streak bonus` → creates completion record → updates daily_log → updates streak → checks for new transformation → updates power_level history → returns CompletionResult
4. Frontend receives response and:
   a. Updates power store with new totals (optimistic)
   b. Shows PointsPopup animation (+X floating up)
   c. If `new_transformation` is not null → triggers TransformationAnimation after 500ms delay
   d. If no transformation → fetches a Goku "task_complete" quote → shows GokuQuote dialog (auto-dismiss 5s)
   e. Refreshes today's completions (task moves to "Completed Today" section)
   f. Refreshes power data (full refresh to sync all numbers)

---

## 11. Project Structure

```
saiyan-tracker/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI entry point, startup seeding, CORS
│   │   ├── api/
│   │   │   ├── router.py               # Mount all v1 routers
│   │   │   └── v1/
│   │   │       ├── tasks.py            # Task CRUD
│   │   │       ├── categories.py       # Category CRUD
│   │   │       ├── completions.py      # Task completion + gamification trigger
│   │   │       ├── power.py            # Power level queries
│   │   │       ├── quotes.py           # Vegeta/Goku quote endpoints
│   │   │       ├── off_days.py         # Off day management
│   │   │       ├── analytics.py        # Charts data
│   │   │       └── settings.py         # User settings
│   │   ├── models/                     # SQLAlchemy ORM models (1 file per table)
│   │   ├── schemas/                    # Pydantic request/response schemas
│   │   ├── services/
│   │   │   ├── power_service.py        # Points calculation, transformation logic, streak updates
│   │   │   ├── quote_service.py        # Quote selection logic
│   │   │   ├── energy_service.py       # Energy-based task filtering/sorting
│   │   │   └── analytics_service.py    # Weekly/monthly/category stats
│   │   ├── database/
│   │   │   ├── base.py                 # SQLAlchemy DeclarativeBase
│   │   │   └── session.py              # Engine + session factory
│   │   └── core/
│   │       ├── config.py               # DATABASE_URL, API_PREFIX
│   │       └── constants.py            # Multipliers, thresholds, bonuses, energy levels
│   ├── requirements.txt
│   └── tests/
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx                    # React entry point
│   │   ├── App.tsx                     # BrowserRouter + NavBar + Routes
│   │   ├── index.css                   # Tailwind directives + global styles + aura classes
│   │   ├── types/index.ts             # All TypeScript interfaces and constants
│   │   ├── services/api.ts            # Axios wrapper for all API calls
│   │   ├── store/                     # Zustand stores (taskStore, powerStore, uiStore)
│   │   ├── pages/                     # Dashboard, Analytics, Settings
│   │   └── components/
│   │       ├── dashboard/             # PowerLevelBar, TaskCard, StreakDisplay, EnergySelector, TransformationMeter
│   │       ├── analytics/             # WeeklyChart, CategoryBreakdownChart, PowerHistoryChart
│   │       ├── animations/            # TransformationAnimation, PointsPopup
│   │       └── common/                # VegetaDialog, GokuQuote, TaskFormModal, OffDayModal
│   ├── index.html                     # Google Fonts (Rajdhani, Orbitron)
│   ├── vite.config.ts                 # Proxy /api → localhost:8000, path alias @/
│   ├── tailwind.config.js             # Custom saiyan colors, animations (power-pulse, glow, float)
│   ├── tsconfig.json                  # Path aliases, strict mode
│   └── package.json
│
└── PRD.md                             # This document
```

---

## 12. Dependencies

### Backend (requirements.txt)
```
fastapi==0.115.0
uvicorn[standard]==0.30.0
sqlalchemy==2.0.35
alembic==1.13.2
pydantic==2.9.0
python-dotenv==1.0.1
aiosqlite==0.20.0
httpx==0.27.0
```

### Frontend (npm)
```
react, react-dom, react-router-dom@6
zustand@5
framer-motion@11
recharts@2
axios@1
lucide-react@0.400
tailwindcss@3, postcss, autoprefixer
typescript, @types/node
```

---

## 13. Success Metrics

### Leading Indicators (change quickly)
- **Daily login rate:** Target 90%+ of non-off days within 2 weeks
- **Tasks completed per day:** Target 3+ tasks/day average
- **Daily minimum hit rate:** Target 80%+ of active days

### Lagging Indicators (change over time)
- **Streak length:** Target 14+ day streaks within first month
- **Transformation progression:** Target SSJ2 (1,500 PL) within 3 weeks of daily use
- **Category balance:** No single category > 60% of total points (measured monthly)

---

## 14. Open Questions

| Question | Owner | Status |
|----------|-------|--------|
| Should transformation thresholds auto-scale after Ultra Instinct (e.g., UI Sign, Mastered UI) to keep the game going indefinitely? | Sergio | Open |
| Should tasks be completable multiple times in one day, or once per day? Current design allows multiple. | Sergio | Open |
| Should there be a "de-transformation" mechanic if power level decays from extreme inactivity? | Sergio | Open |
| What time zone does the "daily reset" use? Local browser time or a configured time zone? | Engineering | Open |

---

## 15. Phase 2 Roadmap (Out of Scope for Phase 1)

1. **Notion integration:** Pull tasks from Notion databases via Notion API. Map Notion statuses to task categories.
2. **Todoist integration:** Pull tasks from Todoist via REST API. Sync completions bidirectionally.
3. **Mobile PWA:** Add service worker, manifest.json, offline caching. Test on iOS Safari and Android Chrome.
4. **VPS deployment:** Dockerize backend + frontend. PostgreSQL on VPS. Nginx reverse proxy. SSL via Let's Encrypt.
5. **Full activity logging:** Log every interaction (app open, task view, energy change) with timestamps for Phase 3 analytics.
6. **"Main task" detection:** Algorithm to surface the highest-impact task based on category, deadline, and energy match.
7. **Animated character sprites:** Replace emoji placeholders with actual Dragon Ball character art (CSS sprites or SVG).

---

*This PRD contains everything needed for Claude Code to build Saiyan Tracker Phase 1 from scratch. Every table, endpoint, component, animation, quote, and interaction is specified. Build it.*
