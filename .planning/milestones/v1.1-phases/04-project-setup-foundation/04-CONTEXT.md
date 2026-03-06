# Phase 4: Project Setup & Foundation - Context

**Gathered:** 2026-03-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Scaffold a React 19 + Vite 7 SPA with TypeScript types matching all backend schemas, a typed API client using ky, four Zustand stores (habit, power, reward, ui), dark DBZ theme with CSS custom properties, and page routing between Dashboard, Analytics, and Settings. This is the foundation every subsequent phase builds on.

</domain>

<decisions>
## Implementation Decisions

### Dark Theme & Color Palette
- Deep space black background (#0a0a0f range) — high contrast, outer space feel
- Orange primary accent (Goku gi), blue secondary accent (SSGSS aura)
- Subtle glow effects on key interactive elements only (cards, buttons, progress bars) — not every element
- CSS custom properties via Tailwind v4 `@theme` config for all color tokens
- Dark theme only for Phase 4 — light mode deferred to Phase 8
- Build the custom property system so light theme CAN be added later without refactor

### Store Architecture
- Top-level hydration on app mount via useInitApp() hook — single loading state, single error boundary
- Optimistic UI for habit checks: toggle immediately in store, rollback on API error, show error toast
- Animations from real API response only (not from optimistic state)
- uiStore includes animation queue skeleton (types + enqueue/dequeue) even though Phase 7 uses it — prevents later refactor

### Claude's Discretion
- Check response flow pattern (how habitStore distributes API response to other stores)
- Exact color hex values within the deep-space-black + orange/blue palette
- Store slice boundaries and internal structure
- Animation queue skeleton shape

### Page Layout & Navigation
- Bottom tab bar navigation with 3 tabs: Dashboard, Analytics, Settings
- DBZ-themed tab icons: Scouter (Dashboard), Dragon Radar (Analytics), Capsule Corp logo (Settings)
- No persistent top header — maximize vertical content area
- Power level and transformation display live within Dashboard page content, not in a header
- Full-screen themed loading state on first mount (centered logo or energy ball spinner) while stores hydrate

### API Client Strategy
- ky as HTTP client (~3kb, modern fetch wrapper with retry and hooks)
- Direct Zustand store calls for data fetching — no TanStack Query, stores ARE the cache
- Toast notifications for API/network errors — non-blocking, auto-dismiss after 3-5s
- Manual TypeScript types in types/index.ts matching backend Pydantic schemas
- Backend base URL configurable (localhost:8000 default)

</decisions>

<specifics>
## Specific Ideas

- Tab icons should be recognizable DBZ references: Scouter for Dashboard (you're "scanning" your habits), Dragon Radar for Analytics (tracking progress), Capsule Corp logo for Settings (configuration)
- The initial loading screen should feel like powering up, not like waiting — a brief branded moment
- The app should feel like a game UI layered on top of a productivity tool, not the other way around

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- No existing frontend code — this is a greenfield scaffold
- Backend schemas define the type contract: HabitResponse, HabitTodayResponse, CheckHabitResponse (with nested DailyLogSummary, StreakInfo, TransformChange, DragonBallInfo, CapsuleDropDetail, QuoteDetail)

### Established Patterns
- Backend uses UUID strings for all IDs
- Dates returned as ISO strings (YYYY-MM-DD)
- Literals for enums: attribute ("str"/"vit"/"int"/"ki"), importance ("normal"/"important"/"critical"), frequency ("daily"/"weekdays"/"custom")
- CheckHabitResponse is the richest endpoint — returns habit state, daily log, streaks, power, transformation, dragon balls, capsule drops, and quotes all in one response

### Integration Points
- 9 backend API endpoints under /api/v1/: habits, power, quotes, analytics, rewards, wishes, categories, settings, off-days
- Backend runs on localhost:8000, CORS configured
- Single-user app — no auth tokens needed, just a default user

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-project-setup-foundation*
*Context gathered: 2026-03-05*
