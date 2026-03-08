# Saiyan Tracker v3 — The Dopamine Edition

## What This Is

A Dragon Ball Z-themed daily habit tracker built exclusively for Sergio. It weaponizes ADHD dopamine-seeking behavior through percentage-based daily completion, sound effects on every interaction, randomized loot boxes, screen-shaking 100% explosions, and a Dragon Ball collection macro-reward loop. No tasks, no punishment — only habits and positive reinforcement. The full stack is complete: 15 database models with game logic, achievement/streak detection, and roast escalation; REST API with 12+ endpoints; React 19 frontend with dashboard, priority-tiered animation queue, 13 real audio sounds, drag-and-drop reordering, contribution graphs, and a full settings suite. Every PRD feature is implemented and verified.

## Core Value

Every habit check must feel like something happened — a sound, a visual pulse, a number going up. If the app is silent and still, it has failed.

## Requirements

### Validated

- ✓ SQLAlchemy models for all 15 tables with relationships, constraints, indexes — v1.0
- ✓ XP formula with Kaio-ken tiers, attribute leveling, streak bonuses — v1.0
- ✓ check_habit() atomic transaction (10 services in one commit) — v1.0
- ✓ Capsule RNG with rarity fallback, Dragon Ball collection, wish granting — v1.0
- ✓ Power level tracking with 10 transformation thresholds — v1.0
- ✓ Zenkai recovery (halve streaks, +50% comeback bonus) — v1.0
- ✓ Off-day system with XP/Dragon Ball clawback — v1.0
- ✓ 9 REST API routers with full Pydantic schemas (222 tests) — v1.0
- ✓ 118 seeded quotes across 6 characters and 7 trigger events — v1.0
- ✓ Percentage-based daily aura (all habits equal weight toward 100%) — v1.1
- ✓ Saiyan attributes (STR/VIT/INT/KI) with per-habit XP visualization — v1.1
- ✓ Capsule Corp loot boxes with visual drop/reveal animations — v1.1
- ✓ Dragon Ball tracker UI (7 slots with glow effects) — v1.1
- ✓ Full-screen 100% Perfect Day explosion with audio — v1.1
- ✓ Saiyan avatar with visual transformation (10 forms: Base through Beast) — v1.1
- ✓ Sound effects on every interaction (scouter beep, ki charge, explosions) — v1.1
- ✓ Character quote system with trigger routing — v1.1
- ✓ Calendar heatmap with gold/blue/red/gray color coding — v1.1
- ✓ Attribute progression charts and power level tracking — v1.1
- ✓ Settings: capsule reward CRUD, Shenron wish CRUD, sound toggle, theme — v1.1
- ✓ Priority-tiered animation queue with combo batching (prevents simultaneous event overload) — v1.2
- ✓ recharts react-is peer dependency resolved (explicit react-is@19, overrides removed) — v1.2
- ✓ Achievement service with streak milestones (3/7/21/30/60/90/365), attribute level-ups, transformation recording — v1.2
- ✓ Vegeta roast escalation with severity scaling + Goku welcome_back quotes — v1.2
- ✓ Per-habit calendar, stats, and reorder API endpoints — v1.2
- ✓ Capsule drop and wish grant history lists in Analytics — v1.2
- ✓ Per-habit contribution graph (GitHub-style 90-day grid) — v1.2
- ✓ Nudge banner (1-2 habits remaining) and daily summary toast (closure signal) — v1.2
- ✓ Power milestone celebrations at round numbers (1K, 5K, 10K, 50K) — v1.2
- ✓ Level-up, Zenkai recovery, and streak milestone animation overlays — v1.2
- ✓ Roast/welcome card and achievements grid UI — v1.2
- ✓ Drag-and-drop habit reordering with @dnd-kit — v1.2
- ✓ Calendar day-detail popover with per-habit breakdown — v1.2
- ✓ Archived habits view and restore functionality — v1.2
- ✓ Temporary habits with start/end date pickers — v1.2
- ✓ Circular day-of-week frequency selector — v1.2
- ✓ 13 real synthesized audio sounds (MP3 + WebM sprite) — v1.2
- ✓ All 11 AnimationEvent types wired to SoundIds in EVENT_SOUND_MAP — v1.2

### Active

#### Current Milestone: v1.3 The Polish Pass

**Goal:** Make the existing app feel great on every device, fill feedback gaps, and add the most-wanted views (habit detail, off-day analytics, shareable summary).

**Target features:**
- Habit detail view (full history, streaks, contribution graph, target time)
- Off-day analytics (impact on streaks, XP, power level)
- Shareable daily summary (copy-to-clipboard recap)
- Full responsive/mobile design (daily phone use)
- Dashboard decluttering and spacing/alignment polish
- Uncheck feedback, streak-break acknowledgment, milestone celebrations
- Weekly/monthly completion rates, streak leaderboard, best/worst day patterns

### Out of Scope

- Task management — habits only, no one-off tasks
- Multi-user / authentication — single tenant, Sergio only
- Mobile app — web-first (PWA later in v2)
- Real-time sync — local SQLite, no cloud
- Social features — solo tracker, no leaderboards with others
- Habit detail view / target time display — deferred to future milestone
- Off-day analytics rollup — deferred to future milestone
- Onboarding / first-run wizard — deferred to future milestone
- Shareable daily summary (copy-to-clipboard) — deferred to future milestone
- Push/browser notifications — hostile UX for ADHD users (nagging)
- Undo streak break / manual streak editing — undermines Zenkai recovery
- Batch "complete all" button — destroys per-check dopamine loop
- Roast intensity settings toggle — revisit if needed

## Context

Shipped v1.2 PRD Complete with ~325K LOC total (TypeScript + Python).
Tech stack: React 19 + Vite 7 + TypeScript + Zustand + Motion + Tailwind CSS v4 (frontend), Python 3.14 + FastAPI + SQLAlchemy 2.0 + SQLite (backend).
3 milestones shipped: v1.0 (backend, 7 plans), v1.1 (frontend, 16 plans), v1.2 (PRD completion, 18 plans).
24/24 v1.2 requirements verified complete, 456 tests passing (176 frontend + 280 backend).
All PRD features implemented: achievement system, streak milestones, roast escalation, contribution graphs, drag-and-drop, calendar popovers, archived/temporary habits, real audio sprites.
Known tech debt: 2 orphaned backend endpoints (GET /habits/{id}/calendar, GET /habits/{id}/stats — frontend uses different data paths).

## Constraints

- **Tech stack**: React 19 + Vite 7 + TypeScript frontend, Python 3.14 + FastAPI backend, SQLite database, Zustand state, Motion animations, Tailwind CSS v4
- **Quality**: Build it right the first time — solid architecture over speed
- **Depth**: Comprehensive coverage — the PRD is detailed and every mechanic matters
- **Solo user**: No auth system needed, single default user
- **Audio**: Every interaction must have a sound effect (Howler.js sprite sheet)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Pure habits, no tasks | Tasks compete with habits and enable hyperfocus exploits | ✓ Good |
| Equal % weight per habit | Prevents gaming importance levels to skip habits | ✓ Good |
| Importance affects XP only | Still rewards harder habits without breaking the 100% loop | ✓ Good |
| Zenkai halve (not reset) streaks | Punishment kills ADHD motivation; forgiveness keeps you coming back | ✓ Good |
| 25% capsule drop rate | High enough to feel frequent, low enough to stay exciting | ✓ Good |
| 7 non-consecutive Perfect Days for Shenron | Achievable without requiring perfection streaks | ✓ Good |
| Synchronous SQLAlchemy over async | Single-user SQLite has no async benefit | ✓ Good |
| check_habit() flushes but doesn't commit | API layer manages transaction boundaries | ✓ Good |
| Services don't add to session | Caller manages transaction boundaries for composability | ✓ Good |
| Pure functions for XP math | Composable, testable, no DB dependency | ✓ Good |
| 10-phase bottom-up build order | DB → Services → API → Scaffold → Dashboard → Audio → Animations → Analytics → Integration → Verification | ✓ Good |
| Tailwind v4 @theme with 28 color tokens | Consistent DBZ theming via CSS custom properties | ✓ Good |
| Zustand with useShallow selectors | Prevents re-renders from multi-value subscriptions | ✓ Good |
| Howler.js sprite sheet for audio | Single file load, 13 sounds, playbackRate variation for freshness | ✓ Good |
| AnimatePresence mode="wait" queue | Sequential animation playback prevents visual chaos | ✓ Good |
| Optimistic UI with rollback | Instant habit check feedback, revert on API error | ✓ Good |
| Recharts with react-is@19 explicit install | Resolved peer dep conflict cleanly (removed overrides hack) — v1.2 | ✓ Good |
| Priority-tiered animation queue | Tier 1 exclusive > Tier 2 banner > Tier 3 inline, combo batching for 3+ events — v1.2 | ✓ Good |
| Reuse existing SoundIds for new events | power_milestone→explosion, level_up→reveal_chime, zenkai→power_up, streak→reveal_chime — v1.2 | ✓ Good |
| ffmpeg-synthesized sounds | 13 sounds generated locally (no external downloads), MP3+WebM dual format — v1.2 | ✓ Good |
| @dnd-kit for drag-and-drop | Dedicated handle prevents accidental check trigger, restrictToVerticalAxis modifier — v1.2 | ✓ Good |

---
*Last updated: 2026-03-08 after v1.3 milestone started*
