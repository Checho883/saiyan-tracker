# Phase 14: Animation Overlays + Roast UI - Research

**Researched:** 2026-03-06
**Status:** Complete

## Phase Scope

Phase 14 bridges backend detection services (Phase 12) to visible UI celebrations. The backend already emits `events[]` in CheckHabitResponse with `level_up`, `streak_milestone`, and `transformation` event dicts. The frontend currently ignores `events[]` -- it only reacts to top-level fields like `transform_change`, `capsule`, `is_perfect_day`. This phase must:

1. Map `events[].type === 'level_up'` to a new `LevelUpOverlay` component
2. Map `zenkai_activated` + `is_perfect_day` to a new `ZenkaiRecoveryOverlay`
3. Map `events[].type === 'streak_milestone'` to a new `StreakMilestoneOverlay`
4. Create an achievements grid section on the Analytics page (requires new API endpoint)
5. Create a roast/welcome inline card on the Dashboard (consumes StatusResponse)

## Architecture Findings

### Animation System (Phase 11)

- **AnimationPlayer** mounts at AppShell root, consumes priority-sorted queue from uiStore
- **Priority tiers:** Tier 1 (exclusive, full-screen: transformation, shenron, power_milestone), Tier 2 (banner, combo-batchable: tier_change, perfect_day, capsule_drop), Tier 3 (inline, bypasses queue: xp_popup, dragon_ball)
- **AnimationEvent union** in uiStore.ts needs new variants: `level_up`, `zenkai_recovery`, `streak_milestone`
- **PRIORITY_TIERS** map needs entries for new types
- **renderOverlay()** switch in AnimationPlayer.tsx needs new cases
- **Pattern:** All overlays receive `onComplete` callback, use motion/react, support useSkippable tap-to-skip

### Backend Event Data (Phase 12)

CheckHabitResponse.events[] already contains:
- `{type: "level_up", attribute: str, old_level: int, new_level: int, title: str|null}`
- `{type: "streak_milestone", tier: int, streak: int, scope: "overall"|"habit", badge_name: str}`
- `{type: "transformation", key: str, name: str, threshold: int}`

Top-level fields also available:
- `zenkai_activated: bool` -- true when first Perfect Day after streak break
- `quote: QuoteDetail | null` -- character quote with avatar_path

### Status/Roast System (Phase 12)

- GET /api/v1/status/?local_date=YYYY-MM-DD returns `StatusResponse { welcome_back: StatusQuote|null, roast: RoastInfo|null }`
- `RoastInfo { quote: StatusQuote|null, severity: str, gap_days: int }`
- `StatusQuote { character, quote_text, source_saga, avatar_path }`
- Frontend has NO status fetch call currently -- `useInitApp` fetches habits, power, rewards, settings but NOT status

### Achievement Model

- `Achievement { id, user_id, achievement_type, achievement_key, milestone_type, unlocked_at, metadata_json }`
- Types used: "streak" (milestone_type), "transformation", attribute level-ups (e.g. "str_5")
- NO API endpoint exists to list achievements -- must create one
- NO frontend types for Achievement -- must add

### Available Animation Primitives

- `ScreenShake`: wrapper component, trigger-based shake effect -- good for savage roasts
- `ParticleBurst`: radial particle explosion from origin point -- good for level-ups/zenkai
- `SPRINGS`: bouncy/gentle/snappy/wobbly spring configs
- `useSkippable(ms, onComplete)`: tap-to-skip guard hook
- `SaiyanAvatar`: renders character avatar by transformation form

## Integration Points

### habitStore.checkHabit() Event Mapping

Currently maps: transform_change, capsule, is_perfect_day, attribute_xp, dragon_ball, tier_change, power_milestone.
Must add: events[] parsing for level_up, streak_milestone, zenkai detection.

### useInitApp Hook

Must add: status fetch on app load for roast/welcome data. Store result for Dashboard consumption.

### Analytics Page

Currently has: PeriodSelector, StatCards, CalendarHeatmap, AttributeChart, PowerLevelChart, CapsuleHistoryList, WishHistoryList.
Must add: AchievementsGrid section.

### API Layer

Must add: `GET /api/v1/achievements/` endpoint + frontend api.ts method + TypeScript types.

## Tier Assignment Decisions

Based on existing pattern analysis and CONTEXT.md decisions:

| Overlay | Tier | Rationale |
|---------|------|-----------|
| LevelUpOverlay | 2 (Banner) | Frequent event, should batch with other banners |
| ZenkaiRecoveryOverlay | 1 (Exclusive) | Dramatic, rare, CONTEXT specifies "full-screen exclusive" |
| StreakMilestoneOverlay | 2 (Banner) | Similar frequency to tier_change |
| Roast/Welcome Card | 3-equivalent (inline) | Not an overlay -- inline card, no queue needed |

## Narrative Sequence Decision

When zenkai + perfect_day fire together: Zenkai plays FIRST (Tier 1 exclusive), then perfect_day (Tier 2 banner). The queue's priority sorting handles this naturally since Tier 1 < Tier 2.

## Validation Architecture

### Dimension Coverage

| Dimension | Strategy |
|-----------|----------|
| D1: Unit correctness | Tests for new AnimationEvent types, PRIORITY_TIERS mapping, event parsing logic |
| D2: Integration | habitStore event dispatch -> uiStore queue -> AnimationPlayer render chain |
| D3: UI/Visual | Overlay components render with correct data-testid attributes |
| D4: Data flow | Backend events[] -> frontend AnimationEvent mapping |
| D5: State | uiStore queue ordering with new event types mixed in |
| D6: Error | Missing/malformed event data gracefully handled |
| D7: Performance | Overlay auto-complete timers, no memory leaks from unmounted overlays |
| D8: Goal-backward | Each success criterion maps to testable behavior |

---

## RESEARCH COMPLETE
