# Architecture Research: v1.3 QoL Feature Integration

**Domain:** QoL features for existing DBZ habit tracker (v1.3 -- responsive, habit detail, off-day analytics, shareable summary, enhanced data views)
**Researched:** 2026-03-08
**Confidence:** HIGH (based on direct codebase analysis of all touchpoints)

## Existing Architecture Snapshot

```
Frontend (React 19 + Zustand + Motion + Tailwind v4)
 +---------------------------------------------------------+
 |  Pages: Dashboard | Analytics | Settings                |
 |  +---------+  +-----------+  +-----------+              |
 |  |HeroSect.|  |CalHeatmap |  |RewardSect.|              |
 |  |MiniHero |  |AttrChart  |  |WishSect.  |              |
 |  |StatsPanl|  |PowerChart |  |CategoryS. |              |
 |  |HabitList|  |StatCards  |  |PrefsS.    |              |
 |  |HabitCard|  |CapsuleHist|  |ArchivedH. |              |
 |  |HabitDtl |  |WishHist   |  |OffDaySel. |              |
 |  |NudgeBnr |  |AchievGrid |  |                          |
 |  |RoastCard|  |DayPopover |  |                          |
 |  +---------+  +-----------+  +-----------+              |
 |                                                         |
 |  Stores: habitStore | powerStore | uiStore              |
 |          rewardStore | statusStore                      |
 |                                                         |
 |  AnimationPlayer (queue consumer, root-level)           |
 |   11 event types, 3-tier priority system                |
 |   Tier 1: transformation, shenron, power_milestone,     |
 |           zenkai_recovery                               |
 |   Tier 2: tier_change, perfect_day, capsule_drop,       |
 |           level_up, streak_milestone                    |
 |   Tier 3: xp_popup, dragon_ball (inline, bypass queue)  |
 +---------------------------------------------------------+
          |  ky HTTP client (services/api.ts)
          v
 Backend (FastAPI + SQLAlchemy 2.0 + SQLite)
 +---------------------------------------------------------+
 |  9 API Routers:                                         |
 |   habits | analytics | power | quotes | rewards         |
 |   wishes | off-days | categories | settings             |
 |   achievements | status                                 |
 |                                                         |
 |  Services Layer:                                        |
 |   check_habit() orchestrates 10 services                |
 |   achievement_service (streak/level/transform detect)   |
 |   off_day_service (mark/cancel with XP clawback)        |
 |                                                         |
 |  15 SQLAlchemy Models                                   |
 |  Tech debt: 2 orphaned endpoints (habit calendar/stats) |
 +---------------------------------------------------------+
          |
          v
 SQLite (saiyan_tracker.db)
```

## Integration Plan: v1.3 Features

### Feature 1: Responsive / Mobile Design

**What changes:** CSS only. No new components, no new state, no new API calls.

**Integration approach:** The app already uses mobile-first patterns (bottom tab bar at 64px, FAB button at bottom-right, fixed-position elements). The gap is that some layouts assume desktop widths and don't adapt gracefully.

**Components to modify:**

| Component | Current Issue | Fix |
|-----------|--------------|-----|
| `AppShell` | No max-width constraint | Add `max-w-lg mx-auto` or `max-w-xl mx-auto` for tablet/desktop centering |
| `HeroSection` | Wide layout, large avatar area | Stack vertically below `sm:`, scale SaiyanAvatar + AuraGauge down |
| `MiniHero` | Fixed sticky bar works but no safe-area | Add safe-area-inset-top padding |
| `StatsPanel` | Horizontal stat cards in a row | 2-column grid on mobile, 4-column on `md:` |
| `HabitCard` | Functional but cramped on <360px screens | Reduce gap/padding at base, increase at `sm:` |
| `AttributeGrid` | 4-column layout | 2-column at base, 4-column at `sm:` |
| `CalendarHeatmap` | Fixed cell sizes, overflows narrow screens | Horizontal scroll wrapper with `overflow-x-auto` |
| `ContributionGrid` | 90-day grid fixed width | `overflow-x-auto` with scroll snap |
| `BottomTabBar` | Already mobile-appropriate | Add `pb-safe` for notched phone safe area |
| `Analytics` page | All sections stack fine but some charts are wide | Wrap Recharts in responsive containers |
| `HabitDetailSheet` | `max-h-[70vh]` is fine, width is `left-0 right-0` (full) | Works on mobile already |
| `HabitFormSheet` | Bottom sheet, likely full-width | Verify it works on narrow screens |

**Key pattern:** Tailwind v4 default breakpoints: `sm:640px`, `md:768px`, `lg:1024px`. Do NOT add custom breakpoints. Base styles = mobile (phone), then progressively enhance.

**Safe area support to add to `index.css`:**
```css
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
  .pt-safe { padding-top: env(safe-area-inset-top); }
}
```

**Touch targets:** Verify all interactive elements are at least 44x44px (Apple HIG) or 48x48dp (Material). The existing `HabitCard` is tappable on the full card area (good), but the drag handle (`GripVertical` at `w-4 h-4`) and menu button need padding review.

**No new stores, no new API calls, no backend changes.** Pure presentational.

---

### Feature 2: Habit Detail View (Full Version)

**What exists:** `HabitDetailSheet` is a Motion-animated bottom sheet showing:
- Habit emoji + title + close button
- 3 stat cards: Current Streak, Best Streak, Completions (from contribution data)
- 90-day `ContributionGrid`
- Legend (completed/missed)

The sheet is opened from `HabitCard` via local `showDetail` state. Data is fetched with local `useState` + `useEffect` (not in Zustand).

**What v1.3 adds:** Target time display, attribute XP earned, completion rate, streak history timeline.

**Data sources -- what already exists vs what's new:**

| Data | Existing? | Source |
|------|-----------|--------|
| Contribution graph (90d) | YES | `GET /habits/{id}/contribution-graph` -- already used |
| Current/best streak | YES | `HabitTodayResponse.streak_current`, `streak_best` -- passed as props |
| Target time | YES | `HabitTodayResponse.target_time` -- available but not displayed |
| Per-habit calendar | YES (orphaned) | `GET /habits/{id}/calendar` -- endpoint exists, not wired to frontend |
| Per-habit stats | YES (orphaned) | `GET /habits/{id}/stats` -- endpoint exists, not wired to frontend |
| Total attribute XP for habit | PARTIAL | Need to aggregate from HabitLog or add to stats endpoint |
| Streak history timeline | NO | Need new backend query or derive from contribution data |

**Component changes:**

| Component | Change Type | Details |
|-----------|------------|---------|
| `HabitDetailSheet` | MODIFY | Add sections: target time badge, attribute XP total, lifetime completion rate, streak timeline. Accept `target_time` and `attribute` as new props from `HabitCard`. |
| `HabitCard` | MODIFY | Pass `habit.target_time` and `habit.attribute` to `HabitDetailSheet` |
| `StreakTimeline` | NEW | Small visual component showing streak periods as colored bars on a timeline. Derives from contribution graph data (consecutive completed days = streak segments). |

**State management:** Keep the existing pattern -- local `useState` + `useEffect` fetch inside `HabitDetailSheet`. This is read-only view data with no cross-component dependencies. Adding it to Zustand would be an anti-pattern (see Anti-Patterns section).

**API additions to `services/api.ts`:**
```typescript
// Wire the orphaned endpoints
habitStats: (id: string) => api.get(`habits/${id}/stats`).json<HabitStats>(),
habitCalendar: (id: string, month: string) =>
  api.get(`habits/${id}/calendar`, { searchParams: { month } }).json<HabitCalendarDay[]>(),
```

**New types needed:**
```typescript
interface HabitStats {
  total_completions: number;
  total_attribute_xp: number;
  completion_rate: number;        // 0.0-1.0, lifetime
  avg_weekly_completions: number;
  created_at: string;
}

interface HabitCalendarDay {
  date: string;
  completed: boolean;
  attribute_xp_awarded: number;
}
```

**Backend work:** Verify the orphaned `GET /habits/{id}/stats` endpoint returns the data needed. If it's missing `total_attribute_xp`, add a SUM query on `HabitLog.attribute_xp_awarded` filtered by habit_id. This is a small modification to an existing endpoint.

**Streak timeline derivation:** Rather than a new backend endpoint, derive streak segments client-side from the contribution graph data. Walk the `ContributionDay[]` array and group consecutive `completed: true` days into segments. This avoids another API call and the data is already fetched.

---

### Feature 3: Off-Day Analytics

**What exists:**
- `OffDay` model: `id`, `user_id`, `off_date`, `reason` (sick/vacation/rest/injury/other), `notes`, `created_at`
- `mark_off_day()` service: reverses completed habits, claws back XP, revokes dragon balls. Returns `{ off_date, habits_reversed, xp_clawed_back }` but does NOT persist these impact numbers on the OffDay record
- Frontend: `offDaysApi.list(month?)` fetches off-days, `OffDaySelector` in Settings allows marking off-days
- Calendar heatmap already shows `is_off_day` on `CalendarDay` type

**What v1.3 adds:** Aggregate analytics about off-day usage (frequency, reason breakdown, impact on progress).

**Backend -- new endpoint:**

| Endpoint | Method | Response |
|----------|--------|----------|
| `GET /analytics/off-day-summary` | GET | `OffDayAnalytics` |

**Schema:**
```python
class OffDayAnalytics(BaseModel):
    total_off_days: int
    by_reason: dict[str, int]       # {"sick": 3, "rest": 5, "vacation": 2}
    by_month: list[MonthCount]      # [{month: "2026-01", count: 2}, ...]
    avg_days_between: float | None  # average gap between off-days
    longest_gap_without: int        # longest stretch without an off-day
```

**Critical pitfall -- XP clawback data not persisted:** The `mark_off_day()` service computes `habits_reversed` and `xp_clawed_back` but only returns them in the response -- they are NOT stored on the `OffDay` model. Two options:

- **(A) Add columns to OffDay (recommended):** Add `habits_reversed: int` and `xp_clawed_back: int` columns with default 0. Modify `mark_off_day()` to set them before flush. Small Alembic migration. Existing rows get default 0 (acceptable -- historical data loss is minimal).
- **(B) Skip XP impact in analytics:** Only show count/reason/frequency data, not XP impact. Simpler but less useful.

Recommend option A. The migration is trivial and the data is already computed.

**Frontend -- new component:**

| Component | Type | Location |
|-----------|------|----------|
| `OffDayAnalyticsCard` | NEW | Analytics page, after `StatCards` section |

**Rendering:** Reason breakdown as a simple horizontal stacked bar or pie chart (Recharts is already installed). Monthly frequency as small text stats. No complex charts needed -- this is supplementary data.

**Data fetching:** Add `offDaySummary()` to `analyticsApi`. Fetch in the Analytics page alongside existing data. Can be added to `useAnalyticsData` hook or fetched independently in the component.

---

### Feature 4: Shareable Daily Summary

**What exists:**
- `showDailySummary()` in `habitStore.ts` fires a toast when all habits are checked, showing completion rate, tier, and XP
- `habitStore.todayHabits` has all habit data (completed status, titles, emojis)
- `powerStore` has current power level and transformation name
- The daily summary toast uses `react-hot-toast` custom rendering

**What v1.3 adds:** Copy-to-clipboard text recap of the day.

**This is entirely frontend. No backend changes.**

**Data flow:**
```
User taps "Share" button
    |
    v
Read from stores (one-shot, no subscription needed):
  habitStore.getState().todayHabits -> completed/total
  powerStore.getState() -> powerLevel, transformation
    |
    v
formatDailySummary() -> text string
    |
    v
navigator.clipboard.writeText(text)
    |
    v
toast.success("Copied to clipboard!")
```

**Where to place the Share button:**

| Location | Trigger | Pros | Cons |
|----------|---------|------|------|
| `StatsPanel` | Manual button always visible | Available anytime, discoverable | Button clutter in stats area |
| Daily summary toast | Auto-appears when all habits checked | Natural timing, contextual | Only available at 100% or final check |
| Both | -- | Best of both | Slightly more implementation |

**Recommendation:** Add to `StatsPanel` as a small icon button (share/clipboard icon). Also add a "Copy" button to the daily summary toast. Two small touch points, no component bloat.

**New utility file:**
```typescript
// utils/shareSummary.ts
export function formatDailySummary(
  habits: HabitTodayResponse[],
  powerLevel: number,
  transformation: string,
): string {
  const completed = habits.filter(h => h.completed).length;
  const total = habits.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const streakEmoji = pct === 100 ? ' | Perfect Day' : '';
  return [
    `Saiyan Tracker | ${pct}% (${completed}/${total})${streakEmoji}`,
    `Power Level: ${powerLevel.toLocaleString()} | ${transformation}`,
  ].join('\n');
}
```

---

### Feature 5: Enhanced Data Views

**What exists:**
- `AnalyticsSummary`: flat numbers -- `avg_completion`, `perfect_days`, `longest_streak`, `total_xp`, `days_tracked` with period filter (week/month/all)
- `StatCards` renders the summary
- `CalendarHeatmap` shows daily tiers by month
- `AttributeChart` and `PowerLevelChart` exist (Recharts)
- Recharts is installed and working (react-is@19 peer dep resolved in v1.2)

**What v1.3 adds:**
1. Weekly/monthly completion rate trend (time series)
2. Streak leaderboard (per-habit streak ranking)
3. Best/worst day-of-week patterns

**Backend -- 3 new endpoints:**

| Endpoint | Returns | Query Logic |
|----------|---------|-------------|
| `GET /analytics/completion-trend?period=week\|month&range=12` | `CompletionTrendPoint[]` | Group DailyLog by ISO week or month, avg completion_rate per group |
| `GET /analytics/streak-leaderboard` | `StreakLeaderboardEntry[]` | Join Habit + per-habit streak data, order by current_streak desc |
| `GET /analytics/day-patterns` | `DayPattern[]` | Group DailyLog by day-of-week (Python `date.weekday()`), avg completion |

**Schemas:**
```python
class CompletionTrendPoint(BaseModel):
    period_label: str        # "W10" or "Mar" or "2026-03"
    completion_rate: float
    xp_earned: int
    days_tracked: int

class StreakLeaderboardEntry(BaseModel):
    habit_id: str
    habit_title: str
    habit_emoji: str
    attribute: str
    current_streak: int
    best_streak: int

class DayPattern(BaseModel):
    day_of_week: int         # 0=Monday ... 6=Sunday (Python weekday())
    day_name: str            # "Monday", "Tuesday", ...
    avg_completion_rate: float
    total_days: int
```

**Frontend -- 3 new components:**

| Component | Type | Chart Library | Location |
|-----------|------|---------------|----------|
| `CompletionTrendChart` | NEW | Recharts `LineChart` | Analytics page |
| `StreakLeaderboard` | NEW | Plain list (no chart needed) | Analytics page |
| `DayPatternChart` | NEW | Recharts `BarChart` | Analytics page |

**State/fetching:** Extend `useAnalyticsData` hook to fetch these three endpoints alongside existing data. They all share the same lifecycle (fetch on mount + period change).

**API additions:**
```typescript
// Add to analyticsApi in services/api.ts
completionTrend: (period: 'week' | 'month', range?: number) =>
  api.get('analytics/completion-trend', { searchParams: { period, ...(range ? { range } : {}) } })
    .json<CompletionTrendPoint[]>(),
streakLeaderboard: () =>
  api.get('analytics/streak-leaderboard').json<StreakLeaderboardEntry[]>(),
dayPatterns: () =>
  api.get('analytics/day-patterns').json<DayPattern[]>(),
```

---

### Feature 6: Dashboard Decluttering + Feedback Gaps

**Uncheck feedback:** Currently unchecking plays `undo` sound but has no visual indicator. Add a brief "Unchecked" text flash on the HabitCard (similar to XpPopup but for undo). Modify `HabitCard.handleTap()` to show a brief label when `result.is_checking === false`.

**Streak-break acknowledgment:** When `habitStore.fetchToday()` returns habits with lower `streak_current` than the previous render, show a brief toast acknowledging the break. Compare previous vs new streak values in the store update. This is subtle -- not an animation overlay, just a small toast.

**Dashboard spacing/alignment:** CSS-only adjustments to padding, gaps, and alignment across dashboard components. Part of the responsive work in Feature 1.

**No new stores, no new API calls for these.**

---

## Component Boundaries Summary

### New Components

| Component | Responsibility | Data Source | Location |
|-----------|---------------|-------------|----------|
| `StreakTimeline` | Visual streak segments for a habit | Derived from ContributionDay[] | Inside HabitDetailSheet |
| `OffDayAnalyticsCard` | Off-day frequency and reason breakdown | `analyticsApi.offDaySummary()` | Analytics page |
| `CompletionTrendChart` | Line chart of weekly/monthly completion rates | `analyticsApi.completionTrend()` | Analytics page |
| `StreakLeaderboard` | Ranked list of habits by streak | `analyticsApi.streakLeaderboard()` | Analytics page |
| `DayPatternChart` | Bar chart of avg completion by day-of-week | `analyticsApi.dayPatterns()` | Analytics page |
| `ShareButton` | Copy daily summary to clipboard | Reads habitStore + powerStore | StatsPanel |

### Modified Components

| Component | What Changes | Why |
|-----------|-------------|-----|
| `HabitDetailSheet` | Add target time, attribute XP, completion rate sections, embed StreakTimeline | Expand from minimal to full detail view |
| `HabitCard` | Pass additional props to HabitDetailSheet, add uncheck feedback flash | Support expanded detail + feedback gap |
| `StatsPanel` | Add ShareButton | Shareable summary trigger |
| `Analytics` page | Add 4 new sections (off-day, trend, leaderboard, patterns) | Enhanced data views |
| `useAnalyticsData` hook | Fetch 4 new endpoints | Data for new analytics components |
| ~10 components | Responsive Tailwind class adjustments | Mobile design |
| `index.css` | Safe area utility classes | Phone notch support |
| `services/api.ts` | Wire orphaned endpoints + add new analytics endpoints | Backend connectivity |
| `types/index.ts` | Add new response types | Type safety |

## Data Flow: New Features

### Habit Detail (expanded)

```
User taps chart icon on HabitCard
    |
    v
HabitCard sets showDetail=true (local state)
    |
    v
HabitDetailSheet mounts, fires parallel fetches:
  habitsApi.contributionGraph(id, 90)  -- existing, already works
  habitsApi.habitStats(id)             -- wire orphaned endpoint
    |
    v
Renders: target time (from props), streak stats, attribute XP,
         completion rate, contribution grid, streak timeline (derived)
```

### Off-Day Analytics

```
Analytics page mounts
    |
    v
useAnalyticsData fires all fetches including:
  analyticsApi.offDaySummary()  -- new endpoint
    |
    v
OffDayAnalyticsCard renders: reason breakdown bar, count, frequency
```

### Shareable Summary

```
User taps Share button in StatsPanel
    |
    v
Read one-shot from stores (no subscription):
  habitStore.getState().todayHabits
  powerStore.getState().powerLevel + transformation
    |
    v
formatDailySummary() -> clipboard text
    |
    v
navigator.clipboard.writeText(text)
    |
    v
toast.success("Copied!")
```

### Enhanced Analytics

```
Analytics page, period selector changes
    |
    v
useAnalyticsData refetches:
  analyticsApi.summary(period)            -- existing
  analyticsApi.completionTrend('week', 12) -- new
  analyticsApi.streakLeaderboard()         -- new
  analyticsApi.dayPatterns()               -- new
  analyticsApi.offDaySummary()             -- new
    |
    v
Each chart component renders independently
```

## Recommended Build Order

The ordering is driven by dependency chains, risk profile, and daily-use impact.

### Phase 1: Responsive Design

**Scope:** CSS-only changes across ~10 existing components + safe area utilities.
**Dependencies:** None.
**Risk:** Zero functional risk -- purely presentational.
**Why first:** Highest daily-use impact. Sergio uses this on his phone. Pure CSS means no integration risk. Can be verified by resizing browser / device preview. Unblocks comfortable phone use for all subsequent features.

### Phase 2: Backend Endpoints

**Scope:** 4 new analytics endpoints + 1 OffDay model migration + verify/fix 2 orphaned habit endpoints.
**Dependencies:** None (backend-only).
**Risk:** Low -- all queries against existing models. Migration is additive (2 nullable columns).
**Why second:** All frontend features in Phases 3-5 depend on backend data. Building backend first means frontend phases proceed without blocks.

| Endpoint | Feature It Unblocks |
|----------|---------------------|
| Verify `GET /habits/{id}/stats` | Habit detail (Phase 3) |
| `GET /analytics/off-day-summary` | Off-day analytics (Phase 4) |
| `GET /analytics/completion-trend` | Trend chart (Phase 4) |
| `GET /analytics/streak-leaderboard` | Streak ranking (Phase 4) |
| `GET /analytics/day-patterns` | Day pattern chart (Phase 4) |
| OffDay model migration (add `habits_reversed`, `xp_clawed_back`) | Off-day analytics accuracy |

### Phase 3: Habit Detail View

**Scope:** Expand `HabitDetailSheet`, add `StreakTimeline` sub-component, wire to backend stats endpoint.
**Dependencies:** Phase 2 (backend stats endpoint).
**Risk:** Low -- modifying one existing component + one new small component.
**Why third:** Self-contained change touching only `HabitDetailSheet` and `HabitCard`. Provides immediate visible value.

### Phase 4: Off-Day Analytics + Enhanced Data Views

**Scope:** 4 new analytics components on the Analytics page.
**Dependencies:** Phase 2 (all analytics endpoints).
**Risk:** Low -- independent read-only display components. Recharts is proven in the codebase.
**Why fourth:** All components are independent of each other; can be built as parallel sub-tasks. Largest batch of new components but all follow the same pattern (fetch + render chart).

### Phase 5: Shareable Summary + Feedback Gaps + Polish

**Scope:** Copy-to-clipboard utility, ShareButton, uncheck feedback flash, streak-break acknowledgment toast, dashboard spacing.
**Dependencies:** None (frontend-only, uses existing data).
**Risk:** Minimal -- small additions, no structural changes.
**Why last:** Smallest scope, lowest risk, no blocking dependencies. Polish layer on top of everything else.

## Anti-Patterns to Avoid

### Anti-Pattern 1: New Zustand Stores for Read-Only View Data

**What people do:** Create `habitDetailStore` or `analyticsDetailStore` for the new analytics data.
**Why it's wrong:** This data is fetched once on component mount, displayed, and discarded when the component unmounts. Stores add subscription overhead, stale-data risks, and complexity for zero benefit.
**Do this instead:** Local `useState` + `useEffect` in the component, matching the existing `HabitDetailSheet` pattern. The `useAnalyticsData` hook is the right abstraction for analytics fetches -- extend it rather than creating new stores.

### Anti-Pattern 2: Creating a New Route for Habit Detail

**What people do:** Add `/habits/:id` as a separate page.
**Why it's wrong:** On mobile, navigating away from the dashboard loses scroll position, feels slow, and breaks the "tap to peek" interaction. The bottom sheet pattern is already implemented and correct.
**Do this instead:** Keep `HabitDetailSheet` as a bottom sheet over the dashboard. Expand its content, not its navigation pattern.

### Anti-Pattern 3: Client-Side Analytics Computation

**What people do:** Fetch all DailyLogs and compute trends/patterns in JavaScript.
**Why it's wrong:** As data grows (months of usage), shipping all raw records to the client wastes bandwidth and makes the browser do SQL's job. Also duplicates aggregation logic.
**Do this instead:** Backend computes aggregates via SQL queries. Frontend receives pre-computed data and renders charts.

### Anti-Pattern 4: Adding Loading Spinners to Primary Interactions

**What people do:** Add loading states to the share button or uncheck feedback that block interaction.
**Why it's wrong:** The app's core value is instant feedback. Clipboard copy via `navigator.clipboard.writeText()` is synchronous in practice. Uncheck feedback should fire optimistically.
**Do this instead:** Clipboard write -> immediate toast. Uncheck visual -> immediate flash alongside the existing optimistic toggle.

### Anti-Pattern 5: Over-Engineering Responsive Breakpoints

**What people do:** Add custom breakpoints, create separate mobile/desktop component variants, or use CSS container queries everywhere.
**Why it's wrong:** The app is mobile-first for a single user. One layout that scales up is sufficient. Maintaining two component trees doubles the code for no user benefit.
**Do this instead:** Base styles = mobile. Use `sm:` and `md:` for minor enhancements on wider screens. The `max-w-lg mx-auto` on AppShell keeps it phone-shaped even on desktop.

### Anti-Pattern 6: Fetching Streak History as a Separate Endpoint

**What people do:** Create `GET /habits/{id}/streak-history` returning start/end/length of each streak.
**Why it's wrong:** This data can be derived from the contribution graph data already being fetched. Adding another round-trip for derivable data adds latency.
**Do this instead:** Walk the `ContributionDay[]` array client-side. Group consecutive `completed: true` days into streak segments. This is O(n) where n=90 and runs once on mount.

## Integration Points

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `HabitDetailSheet` <-> `habitsApi` | Direct fetch (local state) | Existing pattern. Keep it. |
| `Analytics` page <-> `useAnalyticsData` | Hook manages all analytics fetches | Extend hook with new endpoints. Single loading/error state for all analytics data. |
| `ShareButton` <-> stores | One-shot `getState()` read | No subscriptions. Read current values at click time. |
| New analytics endpoints <-> existing models | SQL queries on DailyLog, OffDay, HabitLog, Streak | All models exist. No new tables. Only OffDay gets 2 new columns. |

### Backend Model Change

The only schema change is adding 2 columns to `OffDay`:

```python
habits_reversed: Mapped[int] = mapped_column(default=0)
xp_clawed_back: Mapped[int] = mapped_column(default=0)
```

These values are already computed by `mark_off_day()` -- the service just needs to set them on the OffDay record before returning. Backward-compatible (default 0 for existing rows).

### Files Touched Summary

**Backend (modify):**

| File | Change |
|------|--------|
| `backend/app/models/off_day.py` | Add 2 columns |
| `backend/app/services/off_day_service.py` | Persist impact values on OffDay |
| `backend/app/api/v1/analytics.py` | Add 4 new endpoints |
| `backend/app/schemas/analytics.py` | Add 4 new response schemas |
| `backend/app/api/v1/habits.py` | Verify orphaned stats/calendar endpoints return needed data |

**Frontend (modify):**

| File | Change |
|------|--------|
| `frontend/src/services/api.ts` | Wire orphaned endpoints + add new analytics API functions |
| `frontend/src/types/index.ts` | Add 6 new response types |
| `frontend/src/hooks/useAnalyticsData.ts` | Fetch new analytics endpoints |
| `frontend/src/pages/Analytics.tsx` | Render 4 new section components |
| `frontend/src/components/dashboard/HabitDetailSheet.tsx` | Expand with stats, target time, streak timeline |
| `frontend/src/components/dashboard/HabitCard.tsx` | Pass new props, add uncheck feedback |
| `frontend/src/components/dashboard/StatsPanel.tsx` | Add ShareButton |
| `frontend/src/index.css` | Safe area utility classes |
| ~10 components | Tailwind responsive class additions |

**Frontend (new):**

| File | Purpose |
|------|---------|
| `frontend/src/components/dashboard/StreakTimeline.tsx` | Visual streak segments |
| `frontend/src/components/analytics/OffDayAnalyticsCard.tsx` | Off-day breakdown |
| `frontend/src/components/analytics/CompletionTrendChart.tsx` | Weekly/monthly trend line |
| `frontend/src/components/analytics/StreakLeaderboard.tsx` | Per-habit streak ranking |
| `frontend/src/components/analytics/DayPatternChart.tsx` | Day-of-week completion bars |
| `frontend/src/components/common/ShareButton.tsx` | Copy summary to clipboard |
| `frontend/src/utils/shareSummary.ts` | Format summary text |

## Sources

- Direct codebase analysis of all source files listed in integration points
- Existing patterns: habitStore (optimistic UI), HabitDetailSheet (local fetch), useAnalyticsData (hook-based fetching), uiStore (animation queue)
- Tailwind CSS v4 `@theme` configuration in `index.css` (28 custom color tokens, default breakpoints)
- Backend models: DailyLog, OffDay, HabitLog, Streak (all 15 models already exist)
- Tech debt note from PROJECT.md: 2 orphaned endpoints (habit calendar/stats)

---
*Architecture research for: Saiyan Tracker v1.3 QoL feature integration*
*Researched: 2026-03-08*
