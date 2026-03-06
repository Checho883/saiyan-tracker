# Saiyan Tracker v3 — The Dopamine Edition

## What This Is

A Dragon Ball Z-themed daily habit tracker built exclusively for Sergio. It weaponizes ADHD dopamine-seeking behavior through percentage-based daily completion, sound effects on every interaction, randomized loot boxes, screen-shaking 100% explosions, and a Dragon Ball collection macro-reward loop. No tasks, no punishment — only habits and positive reinforcement. The full stack is now live: 15 database models with complete game logic, 9 REST API endpoints, and a React 19 frontend with dashboard, audio, animations, analytics, and settings — all delivering dopamine on every habit check.

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

### Active

#### Current Milestone: v1.2 PRD Complete

**Goal:** Close every remaining gap between the PRD and the shipped product, plus dopamine and UX polish additions beyond the original spec.

**Target features (PRD gaps):**
- Vegeta escalation roast system (missed day detection + severity scaling)
- Streak milestone detection, badges, and notifications (3/7/21/30/60/90/365 days)
- Achievement system (transformation unlocks, streak milestones, recorded + displayed)
- Per-habit contribution graphs (GitHub-style grid, 90 days)
- Capsule drop history view in Analytics
- Wish grant history view in Analytics
- Zenkai recovery animation + visual feedback
- Habit drag-and-drop reordering (frontend + PUT /habits/reorder)
- Calendar day popover with per-habit breakdown
- Per-habit calendar + stats API endpoints
- Real audio sprite files (replace placeholders)
- recharts react-is tech debt resolution

**Target features (beyond PRD):**
- Attribute level-up animation + title unlock notifications
- Power level milestone celebrations (1K, 5K, 10K, 50K round numbers)
- "You're close!" nudge banner (1-2 habits remaining for 100%)
- Daily summary toast on last check (closure even on imperfect days)
- Archived habits view + restore functionality
- Temporary habit support (start/end date UI in habit form)
- Custom frequency day picker (tappable day-of-week selector)

### Out of Scope

- Task management — habits only, no one-off tasks
- Multi-user / authentication — single tenant, Sergio only
- Mobile app — web-first (PWA later in v2)
- Real-time sync — local SQLite, no cloud
- Social features — solo tracker, no leaderboards with others
- Habit detail view / target time display — deferred post-v1.2
- Off-day analytics rollup — deferred post-v1.2
- Onboarding / first-run wizard — deferred post-v1.2
- Shareable daily summary (copy-to-clipboard) — deferred post-v1.2

## Context

Shipped v1.1 The Dopamine Layer with 7,783 LOC TypeScript frontend on top of 5,967 LOC Python backend.
Tech stack: React 19 + Vite 7 + TypeScript + Zustand + Motion + Tailwind CSS v4 (frontend), Python 3.14 + FastAPI + SQLAlchemy 2.0 + SQLite (backend).
49/49 v1.1 requirements verified complete across 7 phases (16 plans, 88 commits).
All game mechanics have full visual representation: aura gauge, scouter HUD, attribute bars, Dragon Ball tracker, 5 animation overlays, 13 sound effects.
Known tech debt: recharts@3.7.x react-is override in package.json, placeholder audio sprite (needs real sound files).
Achievement model exists in DB but has no service logic or API endpoints.
STREAK_MILESTONES constant defined but not consumed by any service.
Quote severity field (mild/medium/savage) exists but no Vegeta escalation logic.
Habit sort_order field exists but no reorder API endpoint.
Temporary habit fields (is_temporary, start_date, end_date) exist in schema but not exposed in frontend form.

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
| Recharts with react-is override | Best React charting lib despite peer dep conflict | ⚠️ Revisit |

---
*Last updated: 2026-03-06 after v1.2 milestone start*
