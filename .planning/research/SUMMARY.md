# Project Research Summary

**Project:** Saiyan Tracker v1.3 -- The Polish Pass
**Domain:** QoL features for existing gamified DBZ habit tracker (responsive design, habit detail, analytics, sharing, feedback)
**Researched:** 2026-03-08
**Confidence:** HIGH

## Executive Summary

Saiyan Tracker v1.3 is a polish milestone for an already-complete habit tracker (v1.2 shipped 24/24 requirements, 456 tests). The goal is making the existing app feel great on every device, closing feedback gaps in the interaction model, and adding the most-wanted data views. This is NOT a new-feature milestone -- it is a refinement pass. The existing stack (React 19 + Vite + Zustand + Motion 12 + Tailwind v4 + Recharts + FastAPI + SQLite) handles everything v1.3 needs with zero new npm dependencies and zero additional bundle size.

The recommended approach is to treat responsive mobile design as the foundation -- it is the primary goal per PROJECT.md ("daily phone use") and every other feature must work on mobile. Backend analytics endpoints should be built second to unblock all frontend data views. The remaining features (habit detail expansion, analytics charts, shareable summary, feedback gaps) are independent of each other and can be built in any order once responsive and backend work are complete. The architecture is surgical: 6 new components, ~10 modified components, 4 new backend endpoints, and 1 small database migration. No new stores, no new routing patterns, no structural changes.

The key risks are: (1) responsive retrofit breaking the 11 animation overlays that assume desktop viewports, (2) "decluttering" the mobile dashboard by hiding dopamine feedback elements that are core to the product, (3) computing analytics aggregates client-side with wrong denominators instead of using backend snapshots, and (4) clipboard copy silently failing on mobile browsers outside secure contexts. All four risks have clear prevention strategies documented in the pitfalls research.

## Key Findings

### Recommended Stack

No new dependencies required. The existing stack at current versions handles every v1.3 feature through browser-native APIs and existing library capabilities. Tailwind v4 provides built-in container queries and responsive breakpoints. The Clipboard API (browser-native) handles sharing. Recharts 3.7 handles all new chart types. Motion 12 handles all new animation events. This is the correct outcome for a polish milestone.

**Core technologies (all existing):**
- **Tailwind CSS v4.2**: Responsive design -- built-in mobile-first breakpoints, native container queries, no plugins needed
- **Recharts 3.7**: Enhanced analytics views -- ResponsiveContainer for mobile charts, BarChart/LineChart for new views
- **Motion 12**: New animation events (uncheck, streak-break) -- extends existing priority-tiered queue
- **Browser Clipboard API**: Shareable summary -- `navigator.clipboard.writeText()`, no npm wrapper needed
- **React Router 7.13**: Habit detail routing (if needed) -- dynamic segments already supported
- **vaul 1.1**: Bottom sheets already mobile-friendly -- correct pattern for habit detail view

### Expected Features

**Must have (table stakes):**
- **Responsive mobile layout** -- PRIMARY goal; the app is used daily on phone; touches every page/component
- **Dashboard spacing/alignment polish** -- prerequisite for responsive; fix desktop first, then adapt breakpoints
- **Uncheck feedback** (sound + negative XP popup) -- closes obvious interaction symmetry gap; checking has feedback, unchecking is silent
- **Streak-break acknowledgment** -- surfaces the Zenkai recovery mechanic; currently invisible when streaks break
- **Habit detail view expansion** -- completion rate, target time, attribute XP; wires up orphaned backend endpoints

**Should have (competitive advantage):**
- **Weekly/monthly completion rate cards** -- period-filtered comparison; low effort, existing API
- **Streak leaderboard** (personal power rankings) -- pure frontend sort, thematic, fun
- **Shareable daily summary** (copy-to-clipboard) -- unique differentiator; text-only, one tap
- **Off-day analytics panel** -- no competitor shows off-day impact; strategic rest framing
- **Best/worst day highlights** -- derived from existing calendar data; zero backend changes

**Defer (v1.4+):**
- Day-of-week pattern analysis -- medium effort, needs new backend query
- Image-based shareable summary -- html2canvas complexity not justified
- CSV/PDF export -- scope creep for a polish pass
- Push/browser notifications -- explicitly hostile to ADHD users per PROJECT.md

### Architecture Approach

The architecture is additive: 6 new frontend components, 4 new backend endpoints, and modifications to ~10 existing components. No new Zustand stores (read-only view data stays in local component state). No new routing patterns (habit detail stays as bottom sheet, not a new route). The animation queue remains exclusively for positive/celebratory events; negative feedback (uncheck, streak-break) uses inline rendering paths. All analytics aggregates are computed server-side via SQL against snapshotted daily_log data.

**Major components:**
1. **Responsive layout layer** -- CSS-only changes across ~10 components + safe area utilities; no functional changes
2. **Backend analytics endpoints** (4 new) -- completion-trend, streak-leaderboard, day-patterns, off-day-summary; all query existing models
3. **Habit detail expansion** -- extends existing HabitDetailSheet with stats, target time, streak timeline; wires orphaned endpoints
4. **Analytics page additions** (4 new components) -- OffDayAnalyticsCard, CompletionTrendChart, StreakLeaderboard, DayPatternChart
5. **Shareable summary** -- ShareButton + formatDailySummary utility; reads from existing stores, copies to clipboard
6. **Feedback gap closures** -- inline uncheck feedback + streak-break toast; does NOT use animation queue

### Critical Pitfalls

1. **Responsive retrofit breaks animation overlays** -- All 11 overlay components assume desktop viewport. Must audit overlays during responsive pass, not after. Ensure dismiss buttons sit above BottomTabBar, no horizontal scroll on 375px.
2. **Dashboard decluttering removes dopamine touchpoints** -- Mobile design instinct says "reduce noise," but the aura gauge, avatar, and dragon ball tracker ARE the core feedback loop. Scale down, never hide. If it changes when a habit is checked, it must stay visible.
3. **Analytics computed client-side with wrong denominators** -- Historical completion rates must use snapshotted `daily_log.habits_due`, not current habit count. All aggregates must be backend-computed SQL queries.
4. **Clipboard copy silently fails on mobile** -- Pre-compute summary from Zustand stores (no async fetch at copy time). Add textarea fallback for non-secure contexts. Show explicit success/failure toast.
5. **Negative events corrupt animation queue** -- Uncheck and streak-break feedback must NOT enter the positive-only animation queue. Keep negative feedback inline: sound + visual pulse + toast. No full-screen overlays for negative events.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Dashboard Polish + Responsive Design
**Rationale:** Responsive mobile layout is the PRIMARY v1.3 goal and foundation for all other features. Dashboard spacing must be fixed before breakpoints are applied. These are coupled -- do them together.
**Delivers:** App works well on mobile (375px-1024px); all pages responsive; overlays mobile-safe; safe area support
**Addresses:** Responsive mobile layout, dashboard spacing/alignment polish (P1 features)
**Avoids:** Pitfalls 1 (overlay breakage), 2 (hidden dopamine elements), 7 (responsive scope creep)

### Phase 2: Backend Analytics Endpoints
**Rationale:** All frontend data views in Phases 3-4 depend on backend endpoints. Building backend first eliminates blocking. Only 1 small migration (2 columns on OffDay model).
**Delivers:** 4 new analytics endpoints + verified orphaned habit endpoints + OffDay model migration
**Addresses:** Backend prerequisites for off-day analytics, completion trends, streak leaderboard, day patterns
**Avoids:** Pitfalls 6 (off-day partial data), 8 (wrong analytics denominators)

### Phase 3: Habit Detail View Expansion
**Rationale:** Self-contained change touching only HabitDetailSheet and HabitCard. Depends on Phase 2 (stats endpoint). Provides immediate visible value as a drill-down from the now-responsive dashboard.
**Delivers:** Expanded bottom sheet with completion rate, target time, attribute XP, streak timeline
**Addresses:** Habit detail view (P1 feature)
**Avoids:** Pitfall 3 (over-fetching); keep bottom sheet pattern, do not create new route

### Phase 4: Enhanced Analytics Views
**Rationale:** 4 independent chart/list components on Analytics page. All depend on Phase 2 endpoints. Can be built as parallel sub-tasks. All follow the same pattern: fetch + render.
**Delivers:** CompletionTrendChart, StreakLeaderboard, DayPatternChart, OffDayAnalyticsCard
**Addresses:** Weekly/monthly rates, streak leaderboard, off-day analytics, best/worst day highlights (P2 features)
**Avoids:** Pitfall 8 (client-side computation); all data pre-aggregated by backend

### Phase 5: Shareable Summary + Feedback Gaps + Final Polish
**Rationale:** Smallest scope, lowest risk, no blocking dependencies. Polish layer on top of everything else. Groups three small independent features.
**Delivers:** Copy-to-clipboard summary, uncheck feedback, streak-break acknowledgment, final spacing
**Addresses:** Shareable summary, uncheck feedback, streak-break acknowledgment (P1/P2 features)
**Avoids:** Pitfalls 4 (clipboard failure), 5 (missing sound mappings), 9 (negative events in queue), 10 (bad share text)

### Phase Ordering Rationale

- **Responsive first** because it is the milestone's primary goal and every subsequent feature must work on mobile. Doing responsive later means reworking features twice.
- **Backend second** because it has zero frontend dependencies and unblocks all data-dependent frontend phases. Building it early prevents blocking.
- **Habit detail before analytics** because it is a P1 feature with higher user value and touches fewer components (lower risk to validate the responsive work).
- **Analytics fourth** because it is the largest batch of new components but all are independent read-only displays -- low integration risk.
- **Polish last** because feedback gaps and sharing are small, self-contained additions that benefit from all prior work being stable.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1 (Responsive):** Needs investigation of each animation overlay's current layout to determine specific responsive fixes. The 11 overlays are the highest-risk area.
- **Phase 2 (Backend):** Needs verification of orphaned `/habits/{id}/stats` and `/habits/{id}/calendar` endpoints -- they exist but may not return the exact data needed.

Phases with standard patterns (skip research-phase):
- **Phase 3 (Habit Detail):** Extends an existing component with existing data. Well-understood pattern.
- **Phase 4 (Analytics Views):** Standard Recharts chart components. Existing codebase has 3 chart components to reference.
- **Phase 5 (Polish):** Clipboard API is well-documented. Animation event pattern is established with 11 existing types.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Zero new dependencies; all existing packages verified at current versions; official docs consulted |
| Features | HIGH | Feature landscape based on competitor analysis (Habitify, Streaks, Loop) + direct PRD requirements; clear P1/P2/P3 prioritization |
| Architecture | HIGH | Based on direct codebase analysis of all touchpoints; component boundaries, data flows, and file lists are specific and verified |
| Pitfalls | HIGH | Based on direct codebase analysis of AnimationPlayer, uiStore, HabitDetailSheet, and existing responsive patterns; specific line numbers referenced |

**Overall confidence:** HIGH

### Gaps to Address

- **Off-day `is_off_day` snapshot on daily_log:** Need to verify whether this field exists or needs migration. If it does not exist, historical backfill is approximate only.
- **Orphaned endpoint data shape:** The `/habits/{id}/stats` and `/habits/{id}/calendar` endpoints exist but their exact response schemas need verification before frontend types are finalized.
- **Animation overlay audit specifics:** Each of the 11 overlays needs individual inspection during Phase 1 planning to determine which ones actually break on mobile vs. which already use responsive patterns.
- **Off-day analytics XP impact accuracy:** If the OffDay model migration (adding `habits_reversed`, `xp_clawed_back` columns) is applied, existing rows get default 0. Historical XP impact data is lost. This is acceptable but should be documented.

## Sources

### Primary (HIGH confidence)
- [Tailwind CSS v4 responsive design docs](https://tailwindcss.com/docs/responsive-design) -- breakpoints, mobile-first, container queries
- [Clipboard API: writeText (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText) -- browser support, secure context
- [Clipboard API (Can I Use)](https://caniuse.com/mdn-api_clipboard_writetext) -- Baseline Newly Available March 2025
- [Recharts ResponsiveContainer docs](https://recharts.github.io/en-US/api/ResponsiveContainer/) -- chart responsiveness
- [Motion for React docs](https://motion.dev/docs/react) -- animation capabilities
- Direct codebase analysis of all source files (AppShell, Dashboard, HabitCard, HabitDetailSheet, AnimationPlayer, uiStore, habitStore, index.css, BottomTabBar, Analytics, MiniHero)

### Secondary (MEDIUM confidence)
- [Tailwind CSS v4 container queries (SitePoint)](https://www.sitepoint.com/tailwind-css-v4-container-queries-modern-layouts/) -- native container query support
- [Recharts v3 ResponsiveContainer issue #6716](https://github.com/recharts/recharts/issues/6716) -- console warning, non-blocking
- [Habitify analytics features](https://habitify.me/blog/let-data-tell-your-story) -- competitor analysis
- [Trophy streaks gamification case study](https://trophy.so/blog/streaks-gamification-case-study) -- streak psychology
- [RapidNative habit tracker calendar UX](https://www.rapidnative.com/blogs/habit-tracker-calendar) -- calendar grid patterns

### Tertiary (LOW confidence)
- Day-of-week pattern analysis complexity estimate -- based on similar SQLAlchemy GROUP BY patterns, not verified against this schema

---
*Research completed: 2026-03-08*
*Ready for roadmap: yes*
