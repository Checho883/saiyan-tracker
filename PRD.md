# Saiyan Tracker — Product Requirements Document

**Version:** 2.0
**Author:** Bulma (Product & Architecture)
**Date:** February 28, 2026
**Status:** Implemented

---

## 1. Problem Statement

Sergio has ADHD and needs a daily habit tracker — not a task manager — that creates the dopamine feedback loop his brain requires. Traditional habit trackers are passive and boring. He needs visible progression, gamification, and accountability from fictional characters to maintain consistency.

**Core insight:** Consistency in small daily habits (meditation, skincare, exercise, reading) matters more than completing one-off tasks. The app rewards *showing up every day* with Dragon Ball Z transformations.

**Who is affected:** Sergio — solo user. Single-tenant, no auth required.

---

## 2. Goals

1. **Daily habit completion:** Sergio checks off recurring habits every day (measured by habit completion rate and streaks)
2. **Per-habit streaks:** Each habit tracks its own streak, creating micro-accountability
3. **Visible progression:** Cumulative power level and Dragon Ball transformations create permanent visible progress
4. **Consistency bonus:** Completing ALL daily habits earns a 1.5x point multiplier, incentivizing full completion
5. **Accountability:** Vegeta roasts (real quotes from the show) create pressure; Goku encourages on completions

---

## 3. Core Concept

**Habits are primary.** Users create recurring habits (daily/weekdays/custom schedule) that appear each day. Checking them off earns points, builds per-habit streaks, and progresses through Dragon Ball transformations.

**Tasks are secondary.** One-off tasks still exist for bigger items (fix a bug, ship a feature) but habits drive the daily loop.

**Dragon Ball theme throughout:** Real quotes from the anime, transformation names, scouter-style power display, ki-burst animations, dark space aesthetic.

---

## 4. Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 7, TypeScript |
| **State** | Zustand |
| **Animations** | Framer Motion |
| **Charts** | Recharts |
| **Styling** | Tailwind CSS (dark mode `class` strategy) + CSS variables |
| **Backend** | Python 3.14, FastAPI |
| **ORM** | SQLAlchemy 2.0 |
| **Database** | SQLite (local dev) |

---

## 5. Database Schema

### 5.1 Habits (Primary Entity)

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | FK → users.id |
| category_id | UUID | FK → task_categories.id |
| title | VARCHAR(255) | Required |
| description | TEXT | Optional |
| icon_emoji | VARCHAR(10) | Default: "⭐" |
| base_points | INTEGER | Default: 10. Range 3-25 for habits |
| frequency | VARCHAR(20) | `daily`, `weekdays`, `custom` |
| custom_days | JSON | e.g. `["mon","wed","fri"]` |
| target_time | VARCHAR(10) | e.g. "22:00" for bedtime habits |
| is_temporary | BOOLEAN | For habits with end dates |
| start_date | DATE | When habit begins |
| end_date | DATE | Nullable, for temporary habits |
| sort_order | INTEGER | User-defined ordering |
| is_active | BOOLEAN | Soft delete / archive |
| created_at | TIMESTAMP | Auto |

### 5.2 Habit Logs (One per habit per day)

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | FK → users.id |
| habit_id | UUID | FK → habits.id |
| log_date | DATE | Unique per habit per day |
| completed | BOOLEAN | Toggle on/off |
| completed_at | DATETIME | Nullable |
| points_awarded | INTEGER | Calculated at check time |
| notes | TEXT | Optional |

### 5.3 Habit Streaks (Per-habit tracking)

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | FK → users.id |
| habit_id | UUID | FK → habits.id |
| current_streak | INTEGER | Consecutive days completed |
| best_streak | INTEGER | Historical maximum |
| last_completed_date | DATE | Last date completed |

### 5.4 Other Models (unchanged from v1)

- **Users** — single default user (`"default-user"`)
- **Task Categories** — Side Business (1.5x), Work (1.0x), Personal (0.7x), Recreational (0.5x)
- **Tasks** — one-off tasks with category, energy level, base points
- **Task Completions** — per-completion records
- **Daily Logs** — denormalized daily summary (now includes `habits_due`, `habits_completed`, `habit_completion_rate`)
- **Streaks** — user-wide streak (daily minimum met)
- **Power Levels** — daily snapshot of cumulative points
- **Off Days** — sick/vacation/rest/injury/other
- **Achievements** — transformation unlocks
- **Quotes** — 55 real Dragon Ball quotes with `source_saga` field, `character` includes `gohan`

---

## 6. Point System

### 6.1 Habit Points
```
base_points = habit.base_points (3-25, typically 10)
effective = floor(base_points × category.point_multiplier)
streak_bonus = effective × min(habit_streak × 0.02, 0.30)  // +2%/day, cap 30%
total = effective + floor(streak_bonus)
```

### 6.2 Consistency Bonus
When ALL habits due today are completed: **1.5x multiplier** on that day's habit points.

### 6.3 One-off Task Points
Same as v1: `floor(base_points × category_multiplier) + streak_bonus`

### 6.4 Transformation Thresholds (unchanged)

| Level | Name | Threshold |
|-------|------|-----------|
| base | Base Form | 0 |
| ssj | Super Saiyan | 500 |
| ssj2 | Super Saiyan 2 | 1,500 |
| ssj3 | Super Saiyan 3 | 3,500 |
| ssg | Super Saiyan God | 7,000 |
| ssb | Super Saiyan Blue | 12,000 |
| ui | Ultra Instinct | 20,000 |

---

## 7. API Endpoints

**Base URL:** `http://localhost:8000/api/v1`

### 7.1 Habits

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/habits/` | List all active habits (sorted by sort_order) |
| POST | `/habits/` | Create habit |
| GET | `/habits/today/list` | Today's habits with completion status, streaks |
| PUT | `/habits/reorder` | Batch update sort_order |
| GET | `/habits/{id}` | Get single habit |
| PUT | `/habits/{id}` | Update habit |
| DELETE | `/habits/{id}` | Archive habit (is_active=false) |
| POST | `/habits/{id}/check` | Toggle today's completion |
| GET | `/habits/{id}/calendar` | Monthly calendar for one habit |
| GET | `/habits/calendar/all` | Monthly heatmap for all habits |
| GET | `/habits/{id}/stats` | Streak, completion rates |

### 7.2 Tasks, Categories, Completions, Power, Quotes, Off Days, Analytics, Settings
Unchanged from v1. See v1 PRD for full specification.

---

## 8. Frontend

### 8.1 Theme — Dark/Light Mode

CSS variable-based theming with `class="dark"` strategy on `<html>`. Defaults to system preference, persisted in localStorage.

**Dark mode** (primary):
- Background: `#050510` (deep space black)
- Cards: `#0D0D1A` with gradient borders
- Orange accent: `#FF6B00` (Goku gi)
- Blue accent: `#1E90FF` (Vegeta/SSB)

**Light mode**: Clean white with orange/blue accents, subtle card shadows.

**Custom CSS classes:** `card-base`, `scouter-display`, `gradient-border`, `habit-check`, `ki-burst-ring`, `category-stripe`

### 8.2 Pages

| Path | Page | Description |
|------|------|-------------|
| `/` | Dashboard | Power level scouter, today's habits (primary), one-off tasks (secondary), streaks, transformations |
| `/analytics` | Analytics | Calendar heatmap with month navigation, weekly bar chart, category pie, power history |
| `/settings` | Settings | Theme toggle, warrior profile, daily minimum slider, categories, transformation thresholds |

### 8.3 Dashboard Layout

```
┌──────────────────────────────────────────────────┐
│  ⚡ SAIYAN TRACKER    Dashboard Analytics Settings 🌙│
├──────────────────────────────────────────────────┤
│  SATURDAY, FEBRUARY 28          [Off Day] [+ Add Habit]│
│                                                  │
│  ┌─ POWER LEVEL (scouter) ──────────────────┐  ┌──┐│
│  │  ⚡ 1,247 PL        Base Form             │  │🔥││
│  │  ████████████░░░  2.0%  490 to SSJ        │  │14││
│  │  Today's Power: 20/100                    │  │  ││
│  └───────────────────────────────────────────┘  └──┘│
│                                                  │
│  TODAY'S HABITS (1/2)              TRANSFORMATION│
│  ┌──────────────────────────────┐  ┌────────────┐│
│  │ [✓] 🧘 Meditate 5 min +10PL 🔥1│  │ ✓ Base    ││
│  │ [ ] 🏃 Morning Run     7 PL    │  │ 🔒 SSJ    ││
│  └──────────────────────────────┘  │ 🔒 SSJ2   ││
│                                    │ ...        ││
│  ✅ All habits completed! 1.5x!    └────────────┘│
│                                    TODAY'S SUMMARY│
│  ONE-OFF TASKS (optional)          Habits: 1/2  │
│                                    Points: 20   │
├──────────────────────────────────────────────────┤
│  Goku: "Wow, a perfect day!" — Namek Saga       │
│  Vegeta: "Keep your pride!" — Saiyan Saga       │
└──────────────────────────────────────────────────┘
```

### 8.4 Key Components

- **PowerLevelBar** — Scouter-style with scan-line animation, aura effects per transformation
- **HabitCard** — Category color stripe, circular checkbox with ki-burst animation, emoji, title, points badge, per-habit streak flame counter. Context menu (⋮) with Edit, Move Up/Down, Archive, Delete
- **HabitFormModal** — Create and edit modes. Emoji picker (16 options), category selector, frequency (daily/weekdays/custom), custom day picker, target time, temporary toggle, points slider (3-25)
- **CalendarHeatmap** — Monthly grid with month navigation arrows, completion rate coloring (empty → light orange → bright orange → gold), today highlighted
- **GokuQuote** — Top-center banner with orange glow, real quotes with source saga
- **VegetaDialog** — Bottom-right popup with severity-based border colors, real quotes with source saga
- **TransformationAnimation** — Full-screen overlay with particle effects on transformation unlock
- **PointsPopup** — Floating "+X" animation on completion

### 8.5 State Management (Zustand)

| Store | Purpose |
|-------|---------|
| `habitStore` | habits, todayHabits, calendar; fetch/create/update/delete/check/reorder |
| `taskStore` | tasks, categories, completions; CRUD + complete |
| `powerStore` | power level, transformations; fetch + update from completion |
| `uiStore` | modal visibility, quotes |

### 8.6 Habit Check Flow (Critical Path)

1. User taps circular checkbox on HabitCard
2. Ki-burst animation fires
3. `POST /habits/{id}/check` → backend calculates points with streak bonus + consistency bonus
4. Response includes: points_awarded, habit_streak, all_habits_completed, new_transformation
5. PointsPopup shows "+X" floating up
6. If all_habits_completed → Goku "all_complete" quote + consistency bonus message
7. If new_transformation → TransformationAnimation overlay
8. Power level bar updates, per-habit streak increments

---

## 9. Quotes

55 real Dragon Ball quotes seeded on startup:
- **Vegeta roasts** (mild/medium/savage) — triggered on missed days
- **Vegeta pride** — triggered when close to goals
- **Goku motivation** — task_complete, streak milestones, all_complete
- **Transformation quotes** — SSJ through UI, character-specific
- Each quote has `source_saga` (e.g., "Namek Saga", "Cell Saga", "DBS Tournament of Power")

---

## 10. Project Structure

```
saiyan-tracker/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/v1/
│   │   │   ├── habits.py          # Habit CRUD + check + calendar + reorder
│   │   │   ├── tasks.py, categories.py, completions.py
│   │   │   ├── power.py, quotes.py, off_days.py
│   │   │   ├── analytics.py, settings.py
│   │   │   └── router.py
│   │   ├── models/                # habit.py, habit_log.py, habit_streak.py + v1 models
│   │   ├── schemas/               # habit.py + v1 schemas
│   │   ├── services/              # habit_service.py, power_service.py, quote_service.py
│   │   ├── database/              # base.py, session.py
│   │   └── core/                  # config.py, constants.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── main.tsx, App.tsx, index.css
│   │   ├── types/index.ts
│   │   ├── services/api.ts
│   │   ├── context/ThemeContext.tsx
│   │   ├── store/                 # habitStore.ts, taskStore.ts, powerStore.ts, uiStore.ts
│   │   ├── pages/                 # Dashboard.tsx, Analytics.tsx, Settings.tsx
│   │   └── components/
│   │       ├── dashboard/         # PowerLevelBar, HabitCard, TaskCard, StreakDisplay, TransformationMeter
│   │       ├── analytics/         # WeeklyChart, CategoryBreakdownChart, PowerHistoryChart
│   │       ├── animations/        # TransformationAnimation, PointsPopup
│   │       └── common/            # HabitFormModal, TaskFormModal, OffDayModal, GokuQuote, VegetaDialog
│   ├── tailwind.config.js         # Dark mode class strategy, saiyan colors, animations
│   ├── vite.config.ts, tsconfig.json, package.json
│   └── index.html
└── PRD.md
```

---

## 11. Future Considerations

- Mobile PWA with offline support
- Drag-and-drop habit reordering
- Habit archival/history view
- Dragon Ball character art (replace emoji placeholders)
- Additional transformations beyond Ultra Instinct
- Notion/Todoist integration for one-off tasks
- VPS deployment with PostgreSQL

---

*This PRD reflects Saiyan Tracker v2 — a habit-first daily tracker with Dragon Ball Z theming, per-habit streaks, consistency bonuses, real anime quotes, dark/light mode, and calendar heatmap analytics.*
