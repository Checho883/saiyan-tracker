# Saiyan Tracker v3 — The Dopamine Edition

## What This Is

A Dragon Ball Z-themed daily habit tracker built exclusively for Sergio. It weaponizes ADHD dopamine-seeking behavior through percentage-based daily completion, sound effects on every interaction, randomized loot boxes, screen-shaking 100% explosions, and a Dragon Ball collection macro-reward loop. No tasks, no punishment — only habits and positive reinforcement.

## Core Value

Every habit check must feel like something happened — a sound, a visual pulse, a number going up. If the app is silent and still, it has failed.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Percentage-based daily aura (all habits equal weight toward 100%)
- [ ] Saiyan attributes (STR/VIT/INT/KI) with per-habit XP
- [ ] Kaio-ken tiered completion bonuses (50%/80%/100%)
- [ ] Capsule Corp loot boxes (25% drop chance, user-configured rewards)
- [ ] Dragon Ball collection (7 Perfect Days = Shenron wish)
- [ ] Full-screen 100% Perfect Day explosion with audio
- [ ] Saiyan avatar with visual transformation (10 forms: Base through Beast)
- [ ] Sound effects on every interaction (scouter beep, ki charge, explosions)
- [ ] Forgiving Zenkai streaks (halved, never reset, +50% comeback bonus)
- [ ] Character quote system (Goku, Vegeta, Piccolo, Whis, Beerus)
- [ ] Calendar heatmap with gold/blue/red/gray color coding
- [ ] Attribute progression charts and per-habit contribution graphs
- [ ] Settings: capsule reward CRUD, Shenron wish CRUD, sound toggle, theme

### Out of Scope

- Task management — habits only, no one-off tasks
- Multi-user / authentication — single tenant, Sergio only
- Mobile app — web-first (PWA later)
- Real-time sync — local SQLite, no cloud
- Social features — solo tracker, no leaderboards with others

## Context

- Sergio has ADHD and needs immediate, visceral feedback on every action
- Past habit trackers failed due to boredom — invisible points don't create dopamine
- Competitive personality means the 100% target becomes an obsession (by design)
- 4-6 daily habits is the realistic scope (each = 16-25% of daily aura)
- Building custom eliminates paying for apps that don't fit his brain
- PRD v3 (PRD.md) contains the complete detailed specification
- Dragon Ball Z theme is non-negotiable — real images, real quotes, real sounds

## Constraints

- **Tech stack**: React 19 + Vite 7 + TypeScript frontend, Python 3.14 + FastAPI backend, SQLite database, Zustand state, Framer Motion animations, Tailwind CSS
- **Quality**: Build it right the first time — solid architecture over speed
- **Depth**: Comprehensive coverage — the PRD is detailed and every mechanic matters
- **Solo user**: No auth system needed, single default user
- **Audio**: Every interaction must have a sound effect (use-sound or Howler.js)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Pure habits, no tasks | Tasks compete with habits and enable hyperfocus exploits | — Pending |
| Equal % weight per habit | Prevents gaming importance levels to skip habits | — Pending |
| Importance affects XP only | Still rewards harder habits without breaking the 100% loop | — Pending |
| Zenkai halve (not reset) streaks | Punishment kills ADHD motivation; forgiveness keeps you coming back | — Pending |
| 25% capsule drop rate | High enough to feel frequent, low enough to stay exciting | — Pending |
| 7 non-consecutive Perfect Days for Shenron | Achievable without requiring perfection streaks | — Pending |

---
*Last updated: 2026-03-03 after initialization*
