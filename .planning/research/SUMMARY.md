# Project Research Summary

**Project:** Saiyan Tracker v1.2 -- PRD Complete
**Domain:** Gamified habit tracker feature expansion (18 features on existing DBZ-themed, ADHD-optimized app)
**Researched:** 2026-03-06
**Confidence:** HIGH

## Executive Summary

Saiyan Tracker v1.2 adds 18 features to an already-functional gamified habit tracker built on React 19, FastAPI, and SQLite. The existing codebase has substantial infrastructure already in place -- DB models, constants, API endpoints, and frontend stores -- that many v1.2 features simply need to wire up and surface to the user. The recommended approach is to treat this as a "complete the wiring" milestone rather than a greenfield build: most backend models exist, most API data flows exist, and most frontend patterns are established. The stack additions are minimal (3 dnd-kit packages, @floating-ui/react, and a react-is peer dep fix -- totaling ~30kb gzipped), with several features explicitly building custom components rather than adding dependencies.

The central architectural challenge is extending the `check_habit()` pipeline -- the 10-step atomic transaction that every habit tap flows through. Five new detection steps (streak milestones, attribute level-ups, power milestones, achievements, roast context) must be inserted into this pipeline, and five new animation event types must flow through the existing AnimationPlayer queue. The single highest-risk pitfall is animation queue overload: a single habit check can already trigger 6 animations, and v1.2 adds 5 more event types. Without a priority/batching system, the worst case produces 10+ sequential overlays taking 20+ seconds -- completely unacceptable for an ADHD-optimized app where instant feedback is the core value proposition.

Key risks beyond animation overload include: retroactive milestone spam on first deploy (seeding existing achievements is mandatory), temporary habit date boundary bugs corrupting completion percentages, drag-and-drop conflicting with tap-to-check on mobile, and Vegeta roasts creating negative emotional associations that drive app avoidance. All of these have clear prevention strategies documented in the research. The overall confidence is HIGH because every recommendation is grounded in direct codebase analysis of the existing architecture.

## Key Findings

### Recommended Stack

The existing stack (React 19, Vite 7, TypeScript, Zustand 5, Motion 12, Tailwind v4, Recharts, Howler.js, ky, react-hot-toast, vaul, lucide-react, react-router 7) remains unchanged. Only 5 new packages are needed.

**New dependencies:**
- **@dnd-kit/core + sortable + utilities (6.3.x):** Habit card reordering -- modular, accessible, touch-friendly, stable. Chosen over hello-pangea/dnd (heavier) and pragmatic-drag-and-drop (immature docs). The experimental @dnd-kit/react 0.3.x was explicitly rejected as pre-1.0.
- **@floating-ui/react (0.27.x):** Calendar day popover positioning -- lightweight (~8kb), handles viewport collision correctly. Chosen over Radix Popover (91kb, overkill for one component) and CSS-only (positioning is hard).
- **react-is (19.0.0):** Explicit install to satisfy recharts 3.7.x peer dependency, replacing the fragile `overrides` workaround in package.json.

**Explicitly rejected:** No library for contribution graphs (custom SVG, ~80 LOC), day-of-week picker (7 toggle buttons), date pickers (native `<input type="date">`), or additional toast/animation libraries (existing Motion + react-hot-toast cover all needs).

### Expected Features

**Must have (table stakes) -- fill gaps in shipped v1.1:**
- Achievement system + streak milestone badges (DB model exists, zero service/API/UI)
- Capsule drop and wish grant history views (API endpoints exist, zero UI)
- Calendar day popover with per-habit breakdown (PRD-specified interaction)
- Habit drag-and-drop reordering (sort_order field exists, no endpoint or UI)
- Archived habits view + restore (soft-delete exists, no way to see/restore)
- Per-habit calendar + stats API (contribution graph exists, monthly calendar does not)
- recharts react-is tech debt resolution

**Should have (differentiators) -- deepen the "Dopamine Edition" identity:**
- Vegeta escalation roast system (severity field exists, no detection logic)
- Per-habit contribution graphs (API exists, no frontend component)
- Zenkai recovery animation (response flag exists, zero visual feedback)
- Attribute level-up animation + title unlock (backend calculates levels, no celebration)
- Power level milestone celebrations (primary progression number gets no fanfare between transformations)
- "You're close!" nudge banner (ADHD dopamine cliff prevention)
- Daily summary toast on last check (closure signal)
- Temporary habit support (model fields exist, form does not expose them)
- Custom frequency day picker polish (basic UI exists, needs UX upgrade)
- Real audio sprite files (replace placeholders)

**Defer (v2+):**
- Push/browser notifications (hostile UX, ADHD users experience as nagging)
- Undo streak break / manual streak editing (undermines Zenkai recovery mechanic)
- Batch "complete all" button (destroys the per-check dopamine loop)
- Complex per-habit trend charts (contribution grid + calendar is sufficient)
- Social/sharing features (solo tracker by design)

### Architecture Approach

All 18 features integrate into an existing three-layer architecture (React frontend with Zustand stores and AnimationPlayer queue, FastAPI service layer with the central `check_habit()` pipeline, SQLite via SQLAlchemy). The key integration pattern is: backend detection services produce new optional fields in `CheckHabitResponse`, the frontend `habitStore.checkHabit()` reads those fields and enqueues animation events, and the `AnimationPlayer` renders overlays sequentially. Six features need zero backend work (existing APIs or pure frontend state derivation). Seven features need new backend endpoints or service logic. Five features are purely animation/UI overlays consuming data that the enhanced `check_habit()` response provides.

**Major components:**
1. **check_habit() pipeline extension** -- Insert 4 new detection steps (streak milestone, attribute level-up, power milestone, achievement check) into the existing 10-step transaction
2. **AnimationPlayer queue system** -- Add 5 new event types with a priority/batching system to prevent queue overload
3. **New backend endpoints** -- PUT /habits/reorder, GET /habits/archived, PUT /habits/{id}/restore, GET /habits/{id}/calendar, GET /habits/{id}/stats, GET /habits/calendar/day-detail, GET /achievements
4. **New frontend components** -- ContributionGraph (custom SVG), CapsuleHistoryList, WishHistoryList, CalendarDayPopover, NudgeBanner, ArchivedHabitsSection, AchievementGrid, 5 animation overlays

### Critical Pitfalls

1. **Animation queue overload** -- A single habit check can trigger 10+ sequential overlays (20+ seconds of waiting). Implement priority tiers: exclusive overlays (perfect_day, transformation), banner/badge overlays (streak milestone, power milestone), inline non-blocking (xp_popup, daily summary). Cap queued overlays at 3; batch extras into a combo summary. This refactor must happen BEFORE any new event types are added.

2. **Retroactive milestone spam on deploy** -- If milestone detection checks "streak >= N" without dedup, existing streaks trigger past milestones on first app load. Run a one-time migration to seed the achievements table with already-passed milestones. Detection must happen ONLY inside check_habit(), never on app load.

3. **Temporary habit date boundaries corrupt completion %** -- Ambiguous end_date semantics (inclusive vs exclusive) cause denominator shifts in completion rate. Document and test that end_date is the last active day (inclusive). Never recalculate historical daily_log snapshots.

4. **Drag-and-drop vs tap-to-check conflict on mobile** -- The entire HabitCard is currently a tap target. Adding drag makes taps ambiguous. Use a dedicated drag handle (visible only in reorder mode) and never use delay-based activation constraints.

5. **Vegeta roasts create app avoidance** -- "Savage" roasts as the first thing a returning user sees creates shame-based punishment. Always show a welcome_back Goku quote first. Vegeta appears as secondary, never modal. Add a Settings toggle for roast intensity.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Animation Queue Refactor + Tech Debt
**Rationale:** The animation queue is the single highest-risk integration point. Every subsequent feature that adds animations depends on a healthy queue system. The recharts override should also be resolved early to stabilize charts before new analytics features.
**Delivers:** Priority-tiered animation system with batching/caps, recharts stability
**Addresses:** Animation overload pitfall (Critical Pitfall 1), recharts tech debt (feat 18)
**Avoids:** 15-25 second animation slideshows on combo events

### Phase 2: Backend Detection Services + check_habit() Extension
**Rationale:** Seven frontend features are blocked by backend detection logic. Building all detections together allows a single, coordinated extension of CheckHabitResponse rather than multiple partial integrations.
**Delivers:** Achievement service + API, streak milestone detection, attribute level-up detection, power milestone detection, Vegeta roast service, PUT /habits/reorder, per-habit calendar/stats endpoints, archived habits endpoints, calendar day-detail endpoint
**Addresses:** Features 1-3, 7-10, 14 (backend portions)
**Avoids:** Retroactive milestone spam (seed migration), multiple partial response extensions

### Phase 3: Pure Frontend Features (No Backend Needed)
**Rationale:** Six features use existing API data or derive from local state. They can ship immediately after Phase 1's animation refactor, in parallel with or after Phase 2.
**Delivers:** Capsule history view, wish history view, contribution graphs, nudge banner, daily summary toast, power level milestone celebrations
**Addresses:** Features 4, 5a, 5b, 11, 12, 13
**Uses:** Custom SVG component, react-hot-toast, derived Zustand state

### Phase 4: Animation Overlays + Vegeta Roasts
**Rationale:** Animation overlays consume the detection data from Phase 2 and rely on the refactored queue from Phase 1. Vegeta roast frontend needs the backend roast service from Phase 2.
**Delivers:** Zenkai recovery animation, streak milestone overlay, attribute level-up overlay, achievement overlay, Vegeta escalation UI with Settings toggle
**Addresses:** Features 1-3, 6, 10 (frontend portions)
**Avoids:** Vegeta roast app-avoidance pitfall (welcome_back first, Settings toggle)

### Phase 5: Drag-and-Drop + Calendar Popover + Analytics Polish
**Rationale:** These are the highest-complexity frontend features requiring new library integration (@dnd-kit, @floating-ui/react). They depend on Phase 2 backend endpoints (reorder, day-detail). History views need pagination added.
**Delivers:** Habit reordering with dnd-kit, calendar day popover, achievement display grid, history pagination
**Addresses:** Features 7, 8 (frontend portions), analytics polish
**Uses:** @dnd-kit/core + sortable, @floating-ui/react
**Avoids:** Drag-tap conflict (dedicated handle), calendar popover mobile failure (vaul drawer on mobile), unbounded history data (pagination from start)

### Phase 6: Settings Enhancements + Form Features + Audio
**Rationale:** Lower-priority features that enhance existing forms and settings. Audio sprites must come last because all new sound IDs need to be defined first, then compiled once.
**Delivers:** Archived habits view + restore, temporary habit form support, custom frequency day picker polish, real audio sprite files
**Addresses:** Features 14-17 (frontend portions)
**Avoids:** sort_order collision on restore (MAX+1 strategy), temporary habit date bugs (boundary tests), day picker weekday mismatch (ISO weekday constants), audio sprite desync (automated manifest generation)

### Phase Ordering Rationale

- **Animation refactor first** because every subsequent phase adds animation events. Building on a broken queue compounds the problem.
- **Backend detections grouped** because they all modify `check_habit()` and `CheckHabitResponse`. Doing them in one phase avoids repeated schema migrations and partial integration states.
- **Pure frontend features early** because they are low-risk, high-visibility wins that can ship while backend work is in progress. They demonstrate progress and are independently testable.
- **DnD and popover together** because they are the two features requiring new library integration and have the highest frontend complexity.
- **Audio last** because the sprite must include all sound IDs (existing + new). Adding sounds for features that do not exist yet wastes effort if features change.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1 (Animation Queue Refactor):** The priority/batching system is a novel pattern for this codebase. Needs careful design of tier definitions and batching logic. Research the interaction between AnimatePresence mode="wait" and dynamically-typed overlays.
- **Phase 5 (DnD + Calendar Popover):** dnd-kit integration with existing Motion layoutId animations needs testing. Calendar popover mobile/desktop switching (popover vs vaul drawer) needs UX research.

Phases with standard patterns (skip research-phase):
- **Phase 2 (Backend Services):** All backend additions follow the existing service-layer pattern. check_habit() extension is well-documented in ARCHITECTURE.md.
- **Phase 3 (Pure Frontend):** Data display components using existing APIs. Straightforward React patterns.
- **Phase 6 (Settings + Forms):** Standard form enhancements. The only risk (day picker weekday mismatch) is well-documented with a clear fix.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Only 5 new packages, all verified for React 19 compatibility. Explicit rejection rationale for every considered-but-rejected library. |
| Features | HIGH | All 18 features analyzed with existing infrastructure mapped. Clear dependency graph. Competitor analysis validates feature choices. |
| Architecture | HIGH | Based on direct codebase analysis of every integration touchpoint. check_habit() pipeline, AnimationPlayer queue, and store patterns are thoroughly documented. |
| Pitfalls | HIGH | 11 pitfalls identified with specific code references (file names, line numbers). Each has prevention strategy, warning signs, and phase mapping. |

**Overall confidence:** HIGH

### Gaps to Address

- **Animation priority tier definitions:** Research identified the need for priority tiers but the exact tier assignments need validation during Phase 1 planning. Which events are truly "exclusive overlay" vs "banner" vs "inline" requires UX testing.
- **Audio sourcing quality:** Royalty-free sound-alikes recommended, but actual sound quality and DBZ-feel cannot be evaluated until files are sourced. May need iteration.
- **Custom day picker existing state:** The ARCHITECTURE.md notes a potential bug where frontend 0-indexed days may not match backend ISO weekdays (1-7). This must be verified against actual stored data before building the day picker enhancement.
- **Capsule/wish history data volume:** Pagination recommended, but actual data volumes after months of use are unknown. The 50-item default page size is a reasonable guess but may need adjustment.
- **Calendar popover information density:** Research recommends minimal content (date, %, habit names, XP) but optimal layout needs UX validation on actual mobile viewports.

## Sources

### Primary (HIGH confidence)
- Direct codebase analysis of all integration touchpoints (habit_service.py, habitStore.ts, uiStore.ts, AnimationPlayer.tsx, constants.py, package.json)
- [dnd-kit official docs](https://docs.dndkit.com/) -- sortable preset, useSortable hook
- [Floating UI React docs](https://floating-ui.com/docs/react) -- useFloating + useClick pattern
- [recharts react-is discussion #5701](https://github.com/recharts/recharts/discussions/5701) -- peer dependency migration
- [recharts React 19 issue #4558](https://github.com/recharts/recharts/issues/4558) -- compatibility status

### Secondary (MEDIUM confidence)
- [Puck: Top 5 DnD Libraries for React 2026](https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react) -- dnd-kit vs alternatives comparison
- [Reclaim: 10 Best Habit Tracker Apps 2026](https://reclaim.ai/blog/habit-tracker-apps) -- feature expectations
- [Trophy: 20 Productivity App Gamification Examples 2025](https://trophy.so/blog/productivity-gamification-examples) -- gamification patterns
- [Pixabay Sound Effects](https://pixabay.com/sound-effects/) -- royalty-free audio sourcing

### Tertiary (LOW confidence)
- [@uiw/react-heat-map](https://github.com/uiwjs/react-heat-map) -- React 19 compatibility unverified (rejected for custom build)
- [The Sounds Resource](https://sounds.spriters-resource.com/) -- game audio rips (copyrighted, personal use only)

---
*Research completed: 2026-03-06*
*Ready for roadmap: yes*
