# Feature Research

**Domain:** Habit tracker QoL polish (v1.3) -- detail views, analytics, responsive, shareable
**Researched:** 2026-03-08
**Confidence:** HIGH

## Feature Landscape

This analysis covers v1.3 "The Polish Pass" features for an already-complete app (v1.2 shipped with 24/24 requirements, 456 tests). The goal is not new game mechanics but making what exists feel great on every device, filling feedback gaps, and adding the most-wanted views. The existing codebase has a full animation queue, 13 audio sounds, Recharts analytics, Zustand stores, and Tailwind CSS v4 theming.

### Table Stakes (Users Expect These)

Features that Sergio will expect to work correctly in v1.3. Missing any of these makes the app feel broken on mobile or leaves obvious interaction gaps.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Responsive mobile layout** | Sergio uses this daily on his phone. Desktop-only layout is unusable on mobile. Every modern web app is mobile-first. This is the PRIMARY goal of v1.3 per PROJECT.md ("daily phone use"). | HIGH | Touches every page and component. Must adapt HeroSection, HabitList, StatsPanel, Analytics charts, Settings forms. Tailwind breakpoints (sm/md/lg) plus container queries for card grids. Bottom tab bar for mobile nav. Touch targets minimum 44px. Recharts needs explicit ResponsiveContainer widths. |
| **Habit detail view (expanded)** | Existing `HabitDetailSheet` shows streak + 90-day contribution grid but no completion rate, no target time, no attribute XP total, no history list. Users expect to drill into any habit and see everything about it. | MEDIUM | Bottom sheet pattern already exists and works. Extend with: weekly/monthly completion rates, total attribute XP earned, target time display, creation date, category badge, importance/attribute tags. Backend has orphaned `/habits/{id}/stats` and `/habits/{id}/calendar` endpoints -- wire these up instead of building new ones. |
| **Uncheck feedback** | Checking a habit gives sound + XP popup + aura change. Unchecking is completely silent -- feels broken. Symmetrical feedback is a baseline interaction expectation. | LOW | Play a "power down" sound (reuse existing deflate-style sound or add one), show negative XP popup ("-15 STR XP"), animate aura shrinking. Wire into existing AnimationQueue. The check_habit API already handles unchecking and returns the delta. |
| **Streak-break acknowledgment** | When a streak breaks, nothing happens. The user discovers it silently next time they check. Habit trackers like Streaks and Habitify show explicit "streak broken" notices. The Zenkai recovery mechanic exists but is invisible if the user does not notice the halved number. | LOW | Show a toast or card on first dashboard load after a break: "Streak broke at X days. Zenkai halved to Y. Come back stronger." Ties into existing Vegeta roast system and StatusResponse (roast/welcome_back). May already partially work via RoastWelcomeCard but needs explicit streak-break callout. |
| **Dashboard spacing/alignment polish** | Current layout has inconsistent spacing between sections, cards don't visually align, and the hero section dominates too much screen real estate on smaller viewports. Standard QoL expectation for a "polish pass." | MEDIUM | Audit all gap/padding/margin values across dashboard components. Standardize card widths and border radii. Ensure MiniHero collapse via IntersectionObserver works smoothly on mobile. This work is prerequisite to responsive -- fix desktop first, then adapt breakpoints. |

### Differentiators (Competitive Advantage)

Features that go beyond what typical habit trackers offer. These leverage the existing DBZ theme and game systems to create unique value.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Off-day analytics panel** | No habit tracker shows the *impact* of off-days on streaks, XP, and power level. Most just mark them as skipped. Showing "You took 3 off-days this month, preserving a 14-day streak and costing ~600 XP" turns rest into a conscious strategic decision rather than a guilt-laden gap. Research shows users who frame breaks as strategic maintain continuity 3.7x longer. | MEDIUM | New analytics section. Query OffDay table + correlate with DailyLog gaps. Metrics: total off-days per period, off-days by reason (pie/donut chart), estimated XP missed (avg daily XP * off-day count), streak-saves (off-days that fell mid-streak), off-day frequency trend. Needs new backend endpoint `/analytics/off-day-impact` or extend `/analytics/summary`. |
| **Shareable daily summary (copy-to-clipboard)** | No mainstream habit tracker offers a one-tap "share my day" as a styled text block. For ADHD users, external accountability (posting to Discord, texting a friend) is a proven retention lever. The DBZ theme makes the summary fun to share -- not clinical. | LOW | Generate text template with date, completion %, habits done, XP earned, streak, transformation form, Dragon Balls collected. Copy via `navigator.clipboard.writeText()`. Button on dashboard visible when >= 1 habit checked. Text-only (no image generation). See format template below. |
| **Weekly/monthly completion rate cards** | Existing StatCards show all-time aggregate stats only. Period-filtered rates ("This week: 85% vs Last week: 72%") let Sergio spot trends and feel week-over-week progress. Habitify's line graph and Streaks' percentage display both offer this -- it is becoming a standard analytics view. | LOW | Backend `/analytics/summary` already accepts `period=week|month|all`. Frontend needs to call it with multiple periods and display comparison cards: "This Week: 85% | Last Week: 72% | +13%". Could also show a simple sparkline. Minimal new code -- mostly layout work in StatCards component. |
| **Streak leaderboard (personal power rankings)** | Rank habits by current streak length. Gamifies which habits are "strongest" vs "weakest." No external competition (solo user), just internal ranking. The DBZ framing ("Power Rankings" or "Warrior Ranking") makes it thematic. The Streaks app deliberately avoids social leaderboards but personal ranking of one's own habits is a different, positive pattern. | LOW | Sort `todayHabits` by `streak_current` descending. Display as a ranked list with position numbers, flame icons scaled by streak length, and habit emoji/title. Pure frontend -- data already available in `HabitTodayResponse.streak_current`. Could be a new section in Analytics or a tab in the dashboard. |
| **Day-of-week pattern analysis** | Show which days Sergio is most/least consistent. "You complete 95% on Mondays but only 60% on Saturdays." Actionable insight that Habitify puts behind premium tiers. Helps ADHD users identify their natural rhythm rather than fighting it. | MEDIUM | Query DailyLog grouped by day-of-week (extract weekday from log_date), compute avg completion_rate per day. New backend endpoint or compute frontend-side from calendar data (calendar/all returns daily rates for the visible month -- could aggregate multiple months client-side). Visualize as a bar chart or radar chart using Recharts. |
| **Best/worst day highlights** | Call out the single best and worst days in a period. "Best: March 2 (100%, 340 XP). Worst: March 5 (33%, 34 XP)." Creates narrative around the data. | LOW | Derive from existing calendar data on frontend. Find max/min completion_rate from CalendarDay array. Display as highlight cards above or below the heatmap in Analytics. Zero backend changes. |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Image/screenshot shareable summary** | "Share a pretty image of my day" | Canvas/image generation (html2canvas or server-side rendering) adds significant complexity. Maintenance burden for a solo-user app. Images get stale, text is more versatile across platforms (Discord, iMessage, WhatsApp). | Text-only clipboard copy. Clean formatting with emoji and Unicode box-drawing characters makes it visually appealing in any chat app. |
| **Social leaderboard / friend comparison** | "Compare my habits with friends" | PROJECT.md explicitly scopes this out. Solo tracker. Adding social creates auth requirements, privacy concerns, and competitive pressure that harms ADHD motivation. Research shows the Streaks app deliberately avoids social features to maintain focus on personal progress. | Personal streak leaderboard (rank your own habits against each other). |
| **Push/browser notifications** | "Remind me to do habits" | PROJECT.md explicitly lists this as hostile UX for ADHD users. Nagging notifications create anxiety and are ignored after a week. ACSM research shows 31% of users skip healthy rest days to avoid "breaking their streak" -- notifications amplify this pathology. | The existing nudge banner (1-2 habits remaining) is the right level of prompting -- visible when you open the app, not interrupting your day. |
| **Detailed time-of-day tracking** | "Track when I complete each habit throughout the day" | Over-instrumentation. `completed_at` timestamp exists in HabitLog but surfacing hourly patterns adds complexity without clear value for a binary check tracker. Leads to self-surveillance anxiety. | Show `target_time` on habit detail view (already in schema). Let the user set intent, don't analyze actual times. |
| **Exportable CSV/PDF reports** | "Export my data for analysis" | Scope creep for a v1.3 polish pass. Useful but not aligned with "feel great on every device" goal. Requires file generation, download UX, format decisions. | Defer to v2. The shareable summary covers the "show someone my progress" use case. The existing analytics page covers the "analyze my data" use case. |
| **Undo streak break / manual streak editing** | "Let me fix my streak when I forgot to check" | PROJECT.md explicitly forbids this. Undermines the Zenkai recovery mechanic which is core to the game design. Two forgiveness mechanisms exist (off-days for planned, Zenkai for unplanned). | Zenkai recovery (halve, don't reset) + streak-break acknowledgment toast provide the psychological cushion. |
| **Complex per-habit trend line charts** | "Show me a line graph for each habit over time" | Scope creep into an analytics platform. The contribution grid (90-day binary grid) and per-habit calendar already cover the "how consistent am I" question. Line charts for binary data are misleading -- you need a rolling average, which adds math complexity and is hard to interpret. | Contribution grid + completion rate numbers in the expanded habit detail sheet. Clear, honest, no interpretation needed. |

## Feature Dependencies

```
[Dashboard spacing/alignment polish]
    |
    +-- required-by --> [Responsive mobile layout]
    |                   (fix desktop first, then adapt breakpoints)
    |
    +-- required-by --> [All other v1.3 features]
        (everything must look right on the polished layout)

[Responsive mobile layout]
    |
    +-- required-by --> [Shareable daily summary]
    |                   (share button must be accessible on mobile)
    |
    +-- required-by --> [Habit detail view]
    |                   (bottom sheet must work on mobile viewports)
    |
    +-- required-by --> [Off-day analytics panel]
    |                   (charts must be readable on mobile)
    |
    +-- required-by --> [Day-of-week patterns]
        (bar/radar chart must work on narrow screens)

[Habit detail view (expanded)]
    +-- depends-on --> [Existing HabitDetailSheet + ContributionGrid]
    +-- depends-on --> [Backend /habits/{id}/stats endpoint] (orphaned, needs frontend wiring)
    +-- enhanced-by --> [Day-of-week patterns] (could show per-habit day patterns later)

[Off-day analytics]
    +-- depends-on --> [Existing OffDay model + off-days API]
    +-- depends-on --> [New backend endpoint for off-day impact calculation]
    +-- enhanced-by --> [Weekly/monthly rate cards] (rates should account for off-days)

[Weekly/monthly completion rates]
    +-- depends-on --> [Existing /analytics/summary?period= backend endpoint]
    +-- no new backend needed, just multiple frontend calls

[Streak leaderboard]
    +-- depends-on --> [Existing HabitTodayResponse.streak_current]
    +-- no backend changes needed

[Uncheck feedback]
    +-- depends-on --> [Existing animation queue + sound system]
    +-- no backend changes needed (check_habit handles unchecking)

[Streak-break acknowledgment]
    +-- depends-on --> [Existing StatusResponse with roast/welcome_back]
    +-- enhanced-by --> [Existing Vegeta roast system + RoastWelcomeCard]

[Best/worst day highlights]
    +-- depends-on --> [Existing CalendarDay data from calendar/all API]
    +-- no backend changes needed

[Day-of-week patterns]
    +-- depends-on --> [New backend endpoint OR heavy frontend aggregation]
    +-- enhanced-by --> [Weekly/monthly rates] (both are analytics additions)
```

### Dependency Notes

- **Dashboard polish BEFORE responsive:** Fix spacing/alignment on desktop first, then adapt breakpoints. Polishing after responsive creates double work (adjust values, then re-adjust for each breakpoint).
- **Responsive is the foundation for everything else:** Every v1.3 feature must work on mobile. Responsive work should happen early or in parallel with feature development.
- **Off-day analytics is the only feature requiring a new backend endpoint:** Everything else either uses existing APIs, derives from existing data, or wires up orphaned endpoints.
- **Habit detail view can reuse orphaned endpoints:** `GET /habits/{id}/calendar` and `GET /habits/{id}/stats` exist in the backend but the frontend uses different data paths. Wire these up rather than creating new APIs.
- **6 features need zero backend changes:** Streak leaderboard, uncheck feedback, best/worst day highlights, weekly/monthly rates (existing API), streak-break acknowledgment (existing StatusResponse), and shareable summary are all pure frontend work.

## MVP Definition

### Must Ship (v1.3 Core)

These features define the milestone. Without them, v1.3 has not achieved its goal.

- [ ] **Responsive mobile layout** -- the primary goal ("daily phone use")
- [ ] **Dashboard spacing/alignment polish** -- prerequisite for responsive
- [ ] **Uncheck feedback** (sound + negative XP popup) -- closes obvious interaction symmetry gap
- [ ] **Streak-break acknowledgment** -- closes feedback gap, surfaces Zenkai mechanic
- [ ] **Habit detail view** with completion rates, target time, attribute XP -- most-wanted view per PROJECT.md

### Should Ship (v1.3 Enhanced)

High-value, low-to-medium effort features that round out the polish pass.

- [ ] **Weekly/monthly completion rate cards** -- low effort, high insight value, existing API
- [ ] **Streak leaderboard** (personal power rankings) -- pure frontend, thematic, fun
- [ ] **Shareable daily summary** (copy-to-clipboard) -- low effort, unique differentiator
- [ ] **Off-day analytics panel** -- medium effort, unique differentiator, strategic value
- [ ] **Best/worst day highlights** -- low effort, derived from existing calendar data

### Defer (v1.4+)

- [ ] **Day-of-week pattern analysis** -- medium effort, needs new backend query or heavy frontend compute. Good candidate for next milestone.
- [ ] **Image-based shareable summary** -- high effort, low relative value vs text
- [ ] **CSV/PDF export** -- scope creep for a polish pass
- [ ] **Time-of-day completion patterns** -- over-instrumentation

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Responsive mobile layout | HIGH | HIGH | P1 |
| Dashboard spacing/alignment polish | HIGH | MEDIUM | P1 |
| Uncheck feedback | HIGH | LOW | P1 |
| Streak-break acknowledgment | MEDIUM | LOW | P1 |
| Habit detail view (expanded) | HIGH | MEDIUM | P1 |
| Weekly/monthly completion rates | MEDIUM | LOW | P2 |
| Streak leaderboard | MEDIUM | LOW | P2 |
| Shareable daily summary | MEDIUM | LOW | P2 |
| Off-day analytics panel | MEDIUM | MEDIUM | P2 |
| Best/worst day highlights | LOW | LOW | P2 |
| Day-of-week pattern analysis | MEDIUM | MEDIUM | P3 |

**Priority key:**
- P1: Must have -- closes gaps, enables daily phone use, defines the milestone
- P2: Should have -- adds insight and delight, low-to-medium effort
- P3: Nice to have -- defer if time is tight

## Competitor Feature Analysis

| Feature | Habitify | Streaks (iOS) | Loop Habit Tracker | Our Approach |
|---------|----------|---------------|-------------------|--------------|
| Habit detail view | Full stats page with charts, completion rate, best streak, trend line | Minimal -- just streak count and calendar ring | Detailed stats: frequency histograms, calendar, streaks, score | Bottom sheet (exists) expanded with completion rates, contribution grid (exists), target time, attribute XP total. Faster access than a full page -- one tap from dashboard. |
| Off-day handling | Skip day, no analytics about impact | Freeze streak, no analytics | No explicit off-day concept | Off-day with reason tagging (exists). ADD: impact analytics showing XP cost, streak saves, and reason breakdown. Unique in the market. |
| Shareable summary | No built-in share | No share feature | Export to CSV only | Copy-to-clipboard DBZ-themed text summary. No competitor does themed text sharing. |
| Mobile responsive | Native iOS/Android apps | Native iOS only | Native Android | Web app with Tailwind responsive breakpoints. Must match native feel -- bottom tab bar, 44px touch targets, swipe gestures for bottom sheets. |
| Completion rate trends | Avg completion rate line graph (weekly/monthly/yearly) behind premium | Basic percentage per habit | Detailed frequency charts and histograms | Period-filtered stat cards with week-over-week comparison. Simple, clear, no premium gate. |
| Streak ranking | No habit-vs-habit ranking | No ranking (all habits equal) | Habits sortable by various metrics | "Power Rankings" -- habits sorted by streak with DBZ theming (flame icons, position numbers). Personal, not social. |
| Day-of-week analysis | Mentioned in blog, appears behind premium | No | Yes -- bar chart showing day-of-week patterns | Bar or radar chart in analytics. Available to all (no premium tier in a solo app). |

## Implementation Notes

### Responsive Mobile Layout Strategy

The existing app uses Tailwind CSS v4 with `@theme` tokens (28 color tokens). Key responsive challenges:

1. **Navigation:** Current top nav bar should become a fixed bottom tab bar on mobile (< 768px). Icons for Dashboard, Analytics, Settings. Standard mobile pattern used by Instagram, YouTube, etc.
2. **HeroSection/MiniHero:** Already uses IntersectionObserver for collapse. On mobile, start with MiniHero (compact) as the default. Hero takes too much viewport on < 640px.
3. **HabitCard:** Drag handle + checkbox + title + attribute + streak + importance all need to fit in ~375px width. Stack attribute/streak below title on mobile. Ensure drag handle and checkbox are 44px minimum.
4. **Analytics charts:** All Recharts components wrapped in `<ResponsiveContainer width="100%" height={...}>`. On mobile, charts go full-width with larger touch-friendly tooltips. Reduce chart height on mobile to avoid excessive scrolling.
5. **Bottom sheets:** `HabitDetailSheet` and `HabitFormSheet` already use bottom sheet pattern -- good for mobile. Ensure max-height respects mobile viewport (use `dvh` units).
6. **Settings forms:** Stack form fields vertically on mobile. Ensure all inputs have adequate spacing for thumb interaction.

### Shareable Daily Summary Format

```
SAIYAN TRACKER | March 8, 2026
================================
Power Level: 3,247 (Super Saiyan 2)
Today: 5/6 habits (83%) -- Kaio-ken x10
Streak: 14 days (+70% XP bonus)
Dragon Balls: 5/7

Completed:
  Workout (STR) | Read 20 pages (INT)
  Drink Water (VIT) | Meditate (KI)
  Family time (KI)

XP Earned: 125
================================
```

Copy via `navigator.clipboard.writeText()`. Button appears on dashboard when >= 1 habit is checked. Show a brief toast confirmation ("Copied to clipboard!") after tap.

### Off-Day Analytics Data Model

| Metric | Data Source | Computation |
|--------|------------|-------------|
| Total off-days (period) | OffDay table | COUNT where off_date in period range |
| Off-days by reason | OffDay table | GROUP BY reason, COUNT each |
| Estimated XP missed | DailyLog + OffDay | avg(xp_earned from DailyLog) * off-day count in period |
| Streaks preserved | OffDay + Streak history | Count off-days where the day before and after both had >= 80% completion (streak continued through the off-day) |
| Off-day frequency | OffDay + DailyLog | off-day count / total days in period |

Backend option: new endpoint `GET /analytics/off-day-impact?period=week|month|all` returning these metrics. Alternatively, extend the existing `/analytics/summary` response to include off-day fields.

### Habit Detail View Expansion

Current `HabitDetailSheet` shows: emoji, title, current streak, best streak, total completions (90 days), contribution grid (90-day binary SVG).

Expand with:
- **Completion rate** (all-time, this week, this month) -- wire up orphaned `/habits/{id}/stats` endpoint
- **Total attribute XP earned** -- sum from HabitLog.attribute_xp_awarded for this habit
- **Target time display** -- from `habit.target_time` (already in schema, never surfaced in UI)
- **Created date** -- from `habit.created_at` (already in HabitResponse)
- **Category badge** -- resolve category name/color from `habit.category_id`
- **Importance and attribute tags** -- already in HabitTodayResponse, just not rendered in the detail sheet

### Streak Leaderboard Layout

Simple ranked list, no new data needed:
1. Sort `todayHabits` by `streak_current` descending
2. Display as numbered list: `#1 Workout (14 days) | #2 Drink Water (12 days) | ...`
3. Flame icon size scales with streak length (small < 7, medium 7-30, large 30+)
4. Habits with 0 streak shown dimmed at bottom
5. Placement: new section in Analytics page OR a collapsible panel on Dashboard

## Sources

- [Habitify -- Let Data Tell Your Story (Analytics Features)](https://habitify.me/blog/let-data-tell-your-story) -- analytics views, completion rate trends, progress dimensions
- [RapidNative -- Habit Tracker Calendar UX Best Practices](https://www.rapidnative.com/blogs/habit-tracker-calendar) -- calendar grid design, state indicators, streak counters
- [Trophy -- Streaks Gamification Case Study 2025](https://trophy.so/blog/streaks-gamification-case-study) -- streak psychology, loss aversion, personal vs social leaderboards
- [Plotline -- Streaks for Gamification in Mobile Apps](https://www.plotline.so/blog/streaks-for-gamification-in-mobile-apps) -- streak milestone design, gamification patterns
- [Writing Analytics -- Habit Tracker and Streaks](https://support.writinganalytics.co/guides/habit-tracker-and-streaks) -- off-day handling, streak freeze patterns
- [James Clear -- The Ultimate Habit Tracker Guide](https://jamesclear.com/habit-tracker) -- fundamental habit tracking principles
- [Reclaim AI -- Best Habit Tracker Apps 2026](https://reclaim.ai/blog/habit-tracker-apps) -- market feature expectations
- [GetNerdify -- 10 Mobile App Design Best Practices 2025](https://getnerdify.com/blog/mobile-app-design-best-practices/) -- responsive design, bottom navigation, touch targets
- [Chop Dawg -- UI/UX Design Trends 2025](https://www.chopdawg.com/ui-ux-design-trends-in-mobile-apps-for-2025/) -- mobile-first design patterns

---
*Feature research for: Saiyan Tracker v1.3 QoL Polish*
*Researched: 2026-03-08*
