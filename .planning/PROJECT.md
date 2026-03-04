# Saiyan Tracker v3 — The Dopamine Edition

## What This Is

A Dragon Ball Z-themed daily habit tracker built exclusively for Sergio. It weaponizes ADHD dopamine-seeking behavior through percentage-based daily completion, sound effects on every interaction, randomized loot boxes, screen-shaking 100% explosions, and a Dragon Ball collection macro-reward loop. No tasks, no punishment — only habits and positive reinforcement. The backend is fully built with 15 database models, complete game logic (XP, tiers, streaks, capsules, Dragon Balls, transformations), and 9 REST API endpoints — all testable via Swagger.

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

### Active

- [ ] Percentage-based daily aura (all habits equal weight toward 100%)
- [ ] Saiyan attributes (STR/VIT/INT/KI) with per-habit XP visualization
- [ ] Capsule Corp loot boxes with visual drop/reveal animations
- [ ] Dragon Ball tracker UI (7 slots with glow effects)
- [ ] Full-screen 100% Perfect Day explosion with audio
- [ ] Saiyan avatar with visual transformation (10 forms: Base through Beast)
- [ ] Sound effects on every interaction (scouter beep, ki charge, explosions)
- [ ] Character quote system with trigger routing and Vegeta escalation
- [ ] Calendar heatmap with gold/blue/red/gray color coding
- [ ] Attribute progression charts and per-habit contribution graphs
- [ ] Settings: capsule reward CRUD, Shenron wish CRUD, sound toggle, theme

### Out of Scope

- Task management — habits only, no one-off tasks
- Multi-user / authentication — single tenant, Sergio only
- Mobile app — web-first (PWA later in v2)
- Real-time sync — local SQLite, no cloud
- Social features — solo tracker, no leaderboards with others

## Current Milestone: v1.1 The Dopamine Layer

**Goal:** Build the complete frontend experience — every habit check triggers sound, visual feedback, and dopamine-rewarding animations on top of the v1.0 backend.

**Target features:**
- Percentage-based daily aura (all habits equal weight toward 100%)
- Saiyan attributes (STR/VIT/INT/KI) with per-habit XP visualization
- Capsule Corp loot boxes with visual drop/reveal animations
- Dragon Ball tracker UI (7 slots with glow effects)
- Full-screen 100% Perfect Day explosion with audio
- Saiyan avatar with visual transformation (10 forms: Base through Beast)
- Sound effects on every interaction (scouter beep, ki charge, explosions)
- Character quote system with trigger routing and Vegeta escalation
- Calendar heatmap with gold/blue/red/gray color coding
- Attribute progression charts and per-habit contribution graphs
- Settings: capsule reward CRUD, Shenron wish CRUD, sound toggle, theme

## Context

Shipped v1.0 Backend Foundation with 5,967 LOC Python (3,292 app + 2,675 tests).
Tech stack: Python 3.14 + FastAPI + SQLAlchemy 2.0 + SQLite.
222 tests passing across 3 phases. All game mechanics verified via TDD.
Frontend stack ready: React 19 + Vite 7 + TypeScript + Zustand + Framer Motion + Tailwind CSS v4.
Next milestone covers Phases 4-8: frontend state, dashboard UI, audio/animations, analytics/settings, quote polish.

## Constraints

- **Tech stack**: React 19 + Vite 7 + TypeScript frontend, Python 3.14 + FastAPI backend, SQLite database, Zustand state, Framer Motion animations, Tailwind CSS
- **Quality**: Build it right the first time — solid architecture over speed
- **Depth**: Comprehensive coverage — the PRD is detailed and every mechanic matters
- **Solo user**: No auth system needed, single default user
- **Audio**: Every interaction must have a sound effect (use-sound or Howler.js)

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
| 8-phase bottom-up build order | DB → Services → API → Frontend → UI → Audio → Analytics → Polish | ✓ Good |

---
*Last updated: 2026-03-04 after v1.1 milestone start*
