# Feature Research

**Domain:** Gamified habit tracker (RPG progression, ADHD-optimized, single-user)
**Researched:** 2026-03-03
**Confidence:** MEDIUM-HIGH (web sources verified against multiple studies and competitor analysis)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features every habit tracker user assumes exist. Missing these = product feels broken or incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Habit CRUD (create/edit/delete) | Core product function | LOW | Frequency, custom days, archival |
| Daily habit checklist | Primary daily interaction | LOW | Toggle on/off per day |
| Streak tracking | Every habit tracker has this | MEDIUM | Per-habit and overall streaks |
| Progress visualization | Users need to see movement | LOW | Progress bar, percentage, or similar |
| Calendar/history view | "How am I doing over time?" | MEDIUM | Heatmap or month grid |
| Off-day / pause mechanic | Life happens; must not punish | LOW | Sick day, vacation, rest day |
| Sound toggle on/off | Noise complaints, public use | LOW | Single boolean setting |
| Dark mode | Power users and devs expect it | LOW | CSS variables, class toggle |
| Settings page | Sound, theme, habit management | LOW | Standard CRUD management UI |
| XP / points for completion | Table stakes in gamified apps | LOW | Any numeric progression signal |
| Visual feedback on action | Minimum: button state change | LOW | CSS transition, animation |

### Differentiators (Competitive Advantage)

Features that set this product apart from Habitica, LifeUp, Streaks, Finch, etc.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Visceral audio on every habit check | ADHD dopamine hit without waiting for a milestone | MEDIUM | use-sound or Howler.js; scouter beep, ki charge, explosion |
| Percentage-based daily aura (equal weight) | Prevents gaming importance levels; every habit matters | LOW-MEDIUM | 100% / N habits per check; clean psychology |
| Full-screen Perfect Day climax animation | Variable-interval peak reward; screen shake + scream at 100% | HIGH | Framer Motion; full SSJ overlay; most memorable moment in the UX |
| Kaio-ken tiered completion bonuses | XP cliff from 83%→100% creates the obsession target | LOW | 4 tiers (Base/x3/x10/x20); no competitor does exact tiers |
| RPG attribute system (STR/VIT/INT/KI) | Habits feel meaningfully categorized by life domain | MEDIUM | 4 attributes with independent leveling; XP weighting only (not % weight) |
| 10-tier transformation progression | Long-term visual identity investment; avatar actually changes | HIGH | Real DBZ art per form; Base → Beast over 600 days |
| Capsule Corp loot box (25% drop, user-configured rewards) | Variable reward schedule drives slot-machine dopamine loop | MEDIUM | User sets own real-life rewards; 3 rarity tiers; no competitor does user-defined loot |
| Dragon Ball collection macro-loop | 7 Perfect Days → Shenron wish; user sets dream rewards | MEDIUM | Non-consecutive; resets and repeats; self-reinforcing long cycle |
| Zenkai streak recovery (halve not reset) | ADHD-friendly; removes punishment for one bad day | LOW | Zenkai = comeback bonus; no streak anxiety spiral |
| Vegeta escalating roast system | Entertaining negative feedback that avoids shame | MEDIUM | 5-character roster; escalation tiers; Beerus as threat after 3+ misses |
| Shenron wish-granting ceremony | Full-screen animation event for macro-reward claiming | HIGH | Thunder + Shenron animation; sky darkens; user selects wish |
| Per-habit attribute tag + importance badge | Habit cards communicate more than just name | LOW | STR/VIT/INT/KI badge; Normal/Important/Critical label |
| Transformation unlock animation per form | Each of 10 forms has its own unique power-up event | HIGH | Requires 10 unique animation sequences + audio |
| Character quote system with trigger routing | Right character says the right thing at the right moment | MEDIUM | 100+ quotes; 7 trigger event types; 5 characters with personality |
| Streak milestone badges with character-specific quotes | Milestones feel earned, not just counted | LOW | 7 milestones; Piccolo for discipline, Whis for long streaks |
| Contribution graph per habit (GitHub-style) | "I want to see how consistent I was on reading" | MEDIUM | 90-day grid; per-habit drill-down in analytics |
| Attribute progression charts over time | Long-term RPG stat evolution visible | MEDIUM | Recharts line graph; STR/VIT/INT/KI over days |
| Capsule and wish history | Closure on rewards earned/claimed | LOW | Table with dates and rarities; analytics page |
| Calendar day drill-down (click → per-habit detail) | Retroactive accountability without punishment | MEDIUM | Popover on calendar cell; shows each habit hit/miss + XP |

### Anti-Features (Commonly Requested, Often Problematic)

Features to explicitly NOT build for this product.

| Anti-Feature | Why Requested | Why Problematic | Alternative |
|--------------|---------------|-----------------|-------------|
| Task / to-do list | "I want everything in one app" | Competes with habits; enables hyperfocus exploit (complete 10 easy tasks, skip hard habits); dilutes the daily aura model | Pure habit tracker only; one-off items are not tracked here |
| HP loss / punishment mechanics | Feels authentic to RPG theme | Research shows loss aversion mechanics paradoxically increase abandonment through anxiety spirals; ADHD users quit rather than recover | Vegeta verbal roasts (entertainment, not punishment); Zenkai recovery (halve, not reset) |
| Leaderboards with others | Social competition appeal | Habitica deliberately avoids public leaderboards for good reason; external comparison triggers shame for ADHD users | Tournament mode against past self (future v2); internal streak/XP records |
| Multi-user / auth system | "My partner wants to use it too" | Single-tenant by design; auth adds significant surface area with zero value for Sergio | Single default user; no login friction |
| Cloud sync / multi-device | Feels like a given in 2026 | VPS + PostgreSQL + sync adds 2-3 phases of complexity; local SQLite is instant, zero config, and sufficient for solo use | Local SQLite; export/backup in v2 |
| Habit importance affecting completion % | "Important habits should count more" | Opens the door to gaming the system (mark everything critical, skip 'normal' habits without feeling bad) | Importance affects XP only; all habits equal toward 100% |
| Social sharing / screenshots | Gamification milestone sharing | Social features need separate UX budget; content moderation; most users don't want public accountability | Internal milestones displayed on dashboard |
| Punitive streak resets | "That's how real streaks work" | Stanford research + Cohorty data: loss aversion mechanics are the #1 cause of gamified app abandonment; 67% dropout by week 4 | Zenkai halving; no zero; comeback bonus |
| Real-money IAP / premium tiers | Monetization via cosmetics | This is a solo personal tool, not a product; IAP adds regulatory complexity for no benefit | Free, self-hosted; all features included |
| AI habit suggestions | Trend feature, feels smart | Not needed for someone who knows their habits; adds backend complexity; risk of analysis paralysis (cognitive load) | User-defined habits; manual control |
| Complex onboarding tutorial | "New users won't know what to do" | Solo tool for Sergio; tutorials add initial friction; he designed the product | Simple first launch with default categories and example quotes |

---

## Feature Dependencies

```
[Habit CRUD]
    └──requires──> [Daily Habit Checklist]
                       └──requires──> [Habit Log DB]
                                          └──requires──> [Daily Log (aggregate)]

[Daily Aura % Bar]
    └──requires──> [Daily Habit Checklist] (needs due/completed counts)

[XP + Kaio-ken Tiers]
    └──requires──> [Daily Aura %] (tier derived from completion rate)
    └──requires──> [Streak System] (streak_bonus multiplier)

[Streak System]
    └──requires──> [Daily Log] (completion_rate per day)
    └──enhances──> [XP Formula] (streak_bonus)

[Zenkai Recovery]
    └──requires──> [Streak System] (halving logic)
    └──enhances──> [Perfect Day Animation] (Zenkai bonus plays on comeback Perfect Day)

[Capsule Drop]
    └──requires──> [Habit Check endpoint] (25% RNG evaluated on check)
    └──requires──> [Rewards table] (what to award)

[Dragon Ball Collection]
    └──requires──> [Perfect Day detection] (in Daily Log)
    └──requires──> [Wishes table] (what Shenron grants)

[Shenron Animation]
    └──requires──> [Dragon Ball Collection] (7 collected trigger)
    └──requires──> [Wishes CRUD] (user must have configured wishes)

[RPG Attributes (STR/VIT/INT/KI)]
    └──requires──> [Habit creation with attribute assignment]
    └──requires──> [Habit Log] (attribute_xp_awarded per check)

[Transformation System]
    └──requires──> [Power Level] (cumulative XP thresholds)
    └──requires──> [RPG Attributes] (power level = sum of all attribute XP)

[Perfect Day Animation]
    └──requires──> [Daily Aura %] (100% trigger)
    └──requires──> [Dragon Ball Collection] (ball earned on perfect day)
    └──requires──> [Kaio-ken Tiers] (tier multiplier display in climax)
    └──requires──> [Character Quote System] (perfect_day trigger)

[Calendar Heatmap]
    └──requires──> [Daily Log history]
    └──enhances──> [Analytics Page]

[Contribution Graph per Habit]
    └──requires──> [Habit Log history]
    └──enhances──> [Analytics Page]

[Character Quote System]
    └──requires──> [Quotes DB] (seeded 100+ quotes)
    └──enhances──> [Habit Check response] (quote in payload)
    └──enhances──> [Perfect Day Animation]
    └──enhances──> [Streak Milestones]

[Attribute Progression Charts]
    └──requires──> [RPG Attributes] (XP over time)
    └──requires──> [Daily Log or Power Level history snapshots]

[Vegeta Roast Escalation]
    └──requires──> [Character Quote System] (severity field)
    └──requires──> [Streak System] (consecutive_missed_days derived from streak breaks)

[Off Days]
    └──enhances──> [Streak System] (pause, not break)
    └──enhances──> [Calendar Heatmap] (blue marker)

[Sound System]
    └──enhances──> [Habit Check] (beep on check)
    └──enhances──> [Perfect Day Animation] (scream/explosion)
    └──enhances──> [Capsule Drop] (pop + reveal chime)
    └──enhances──> [Shenron Animation] (thunder + roar)
    └──enhances──> [Transformation Animation] (power-up sequence)
    └──requires──> [Settings: sound toggle]
```

### Dependency Notes

- **Habit CRUD requires Habit Log DB:** You cannot implement the daily checklist or any gamification before the data model is correct and validated.
- **XP Formula requires both Daily Aura % and Streak:** The streak_bonus feeds the daily XP multiplier; both must exist before XP is meaningful.
- **Perfect Day Animation requires 5 upstream features:** It is the most dependent feature in the system — do not build it until its dependencies are stable.
- **Shenron Animation requires Wishes CRUD:** If wishes table is empty when 7 Dragon Balls are collected, the ceremony breaks. Must enforce minimum 1 active wish.
- **Sound System enhances nearly everything:** Audio is a cross-cutting concern. Build SoundProvider early as a passive enhancer; it adds no blocking dependencies.
- **Transformation System requires Power Level:** Power level is cumulative XP; transformations are pure threshold checks. No separate storage needed beyond current_transformation on user.

---

## MVP Definition

### Launch With (v1)

Minimum viable product: the core dopamine loop must close.

- [ ] **Habit CRUD with attribute + importance + frequency** — without this, there is nothing to track
- [ ] **Daily habit checklist with toggle** — the primary daily interaction
- [ ] **Daily aura % bar with visual growth** — the progress centerpiece
- [ ] **XP formula (Kaio-ken tiers + streak bonus)** — numbers going up is non-negotiable
- [ ] **Streak system (overall + per-habit) with Zenkai recovery** — forgiving streak is a design pillar
- [ ] **Off days** — needed before any real use begins to prevent day-1 false streak breaks
- [ ] **RPG attributes (STR/VIT/INT/KI) with independent leveling** — habits feel categorized, not generic
- [ ] **Transformation system (10 forms, thresholds, avatar visual)** — long-term hook; first SSJ at ~4 days
- [ ] **Perfect Day 100% explosion (screen shake + audio + XP reveal)** — the climax of the daily loop
- [ ] **Capsule Corp loot drop (25% RNG, user rewards CRUD)** — variable reward loop
- [ ] **Dragon Ball collection (7 perfect days → wish)** — macro reward cycle
- [ ] **Shenron ceremony animation + wish grant** — requires Dragon Balls and wishes CRUD
- [ ] **Character quote system (100+ quotes, 7 trigger events)** — personality layer on every action
- [ ] **Sound effects on every interaction with toggle** — non-negotiable per PRD
- [ ] **Calendar heatmap (Gold/Blue/Red/Gray)** — retroactive progress visibility
- [ ] **Settings: sound, theme, categories, rewards CRUD, wishes CRUD** — user control over the reward loops
- [ ] **Analytics page (summary stats, attribute charts, capsule/wish history)** — long-term motivation

### Add After Validation (v1.x)

- [ ] **Contribution graph per habit (GitHub-style 90-day grid)** — add when user asks "how am I doing on X specifically"
- [ ] **Vegeta escalating roast system** — add when basic quote system is verified working; roasts are enhancement on top of quotes
- [ ] **Streak milestone badges** — add when streak system has been running for 3+ real days
- [ ] **Calendar day drill-down popover** — add when calendar heatmap is in use and the "why was this day red?" question arises
- [ ] **Drag-and-drop habit reordering** — add when habit list count grows past manageable manual order

### Future Consideration (v2+)

- [ ] **Tournament mode against past self** — "beat last week's XP" loop; defer until data exists to compare against
- [ ] **Training Arc challenges** — multi-week themed habit sets; requires weeks of daily use before it's meaningful
- [ ] **Mobile PWA** — defer until web version is fully stable; Framer Motion animations need desktop performance baseline first
- [ ] **VPS deployment with PostgreSQL** — defer; local SQLite is sufficient for solo use
- [ ] **Habit archival/history view** — defer; soft delete (is_active=false) covers the immediate need

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Habit CRUD | HIGH | LOW | P1 |
| Daily checklist + toggle | HIGH | LOW | P1 |
| Daily aura % bar | HIGH | LOW | P1 |
| XP formula + Kaio-ken tiers | HIGH | LOW | P1 |
| Streak system (Zenkai recovery) | HIGH | MEDIUM | P1 |
| RPG attributes (STR/VIT/INT/KI) | HIGH | MEDIUM | P1 |
| Perfect Day 100% explosion | HIGH | HIGH | P1 |
| Capsule loot drop | HIGH | MEDIUM | P1 |
| Dragon Ball collection | HIGH | MEDIUM | P1 |
| Character quote system | HIGH | MEDIUM | P1 |
| Sound effects (every interaction) | HIGH | MEDIUM | P1 |
| Transformation system (10 forms) | HIGH | HIGH | P1 |
| Off days | MEDIUM | LOW | P1 |
| Calendar heatmap | MEDIUM | MEDIUM | P1 |
| Shenron ceremony | HIGH | HIGH | P1 |
| Settings (rewards CRUD, wishes CRUD) | HIGH | MEDIUM | P1 |
| Analytics summary stats | MEDIUM | LOW | P1 |
| Attribute progression charts | MEDIUM | MEDIUM | P2 |
| Vegeta roast escalation | MEDIUM | MEDIUM | P2 |
| Streak milestone badges | MEDIUM | LOW | P2 |
| Calendar day drill-down | MEDIUM | MEDIUM | P2 |
| Contribution graph per habit | MEDIUM | MEDIUM | P2 |
| Drag-and-drop habit reorder | LOW | MEDIUM | P3 |
| Tournament mode (vs past self) | MEDIUM | HIGH | P3 |
| Training Arc challenges | LOW | HIGH | P3 |
| Mobile PWA | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

| Feature | Habitica | LifeUp | Finch | Streaks | Our Approach |
|---------|----------|--------|-------|---------|--------------|
| Core task type | Habits + Dailies + To-Dos | Tasks + Habits | Goals/habits | Habits only | Habits only (by design) |
| RPG progression | Avatar, XP, level, class, gear | Custom user-defined skills | Pet grows via energy | None | 10 DBZ transformations (STR/VIT/INT/KI) |
| Punishment mechanics | HP loss, character death | None | None | None | None (Zenkai halve only) |
| Variable rewards | Gold for real or in-game rewards | User-configured shop + loot boxes | Rainbow stones for cosmetics | None | Capsule Corp (25% RNG, user-configured, 3 rarities) |
| Macro reward loop | Party quests | Crafting | Monthly adventure | None | Dragon Ball → Shenron wish (user-configured) |
| Streak forgiveness | None (hard reset) | Not researched | 2/5/7/14-day optional commitment, no punishment for miss | Full streak loss | Zenkai: halve + 50% comeback bonus |
| Sound effects | Minimal | Not researched | Ambient/light | None | Every single interaction (scouter, ki charge, explosion) |
| Full-screen celebration | None | None | Bird adventure | None | Screen-shaking SSJ aura explosion at 100% |
| ADHD design | Not optimized (HP loss works against ADHD) | Highly customizable but complex | Gentle/low-pressure; pet care framing | Minimal/clean | Engineered for ADHD dopamine: audio+visual on every action, no punishment, variable loot |
| Social features | Parties, quests, guilds | World module | Friend check-ins | iCloud sync only | None (solo by design) |
| Off days | Not found | Not found | Flexible commitment | Not found | Full off-day pause (sick/vacation/rest/injury) |
| Theme customization | Avatar gear/cosmetics | 78+ color themes | Pet accessories | 78 color themes, 600+ icons | Dark/light with DBZ-specific dark palette |
| Analytics | Basic | Statistics module | Mood trends | None | Heatmap + contribution graphs + attribute charts + capsule/wish history |

### Key Differentiator Summary

This product does not compete with Habitica on social features, or Streaks on Apple Watch integration, or Finch on gentle mental health framing. The differentiation is:

1. **Audio-first design** — sound on every single action (no competitor does this for habit trackers)
2. **Engineered for competitive ADHD** — the 100% obsession target, XP cliff, screen-shaking climax
3. **User-controlled reward economy** — both loot box contents and wish contents are user-defined (no competitor does this)
4. **Forgiving streaks as a design pillar** — Zenkai is the most ADHD-friendly streak system in the space
5. **Coherent IP theme** — DBZ is not decoration; it defines every mechanic name, character, sound, and visual

---

## Sources

- Habitica: [Wikipedia](https://en.wikipedia.org/wiki/Habitica), [GitHub](https://github.com/HabitRPG/habitica), [Gamification Case Study — Trophy (2025)](https://trophy.so/blog/habitica-gamification-case-study)
- LifeUp: [Official site](https://lifeupapp.fun/), [GitHub](https://github.com/Ayagikei/LifeUp), [Android Authority](https://www.androidauthority.com/best-life-rpg-apps-1037041/)
- Finch: [Official site](https://finchcare.com/), [Autonomous.ai review](https://www.autonomous.ai/ourblog/finch-self-care-app-review-full-breakdown), [CLT Counseling review](https://www.cltcounseling.com/resources/finch-habit-tracker-app-review)
- Streaks: [Official site](https://streaksapp.com/), [Productivity.directory review (2025)](https://productivity.directory/streaks)
- ADHD UX research: [Neurodiversity in UX — AufaitUX](https://www.aufaitux.com/blog/neuro-inclusive-ux-design/), [Neuroinclusive design for ADHD — Tamara Sredojevic](https://www.tamarasredojevic.com/work/inflow), [Toward Neurodivergent-Aware Productivity — arXiv 2025](https://arxiv.org/html/2507.06864)
- Gamification research: [Cohorty: Gamification in Habit Tracking — research + real user data](https://blog.cohorty.app/gamification-in-habit-tracking-does-it-work-research-real-user-data), [Counterproductive effects of gamification — ResearchGate](https://www.researchgate.net/publication/327451529_Counterproductive_effects_of_gamification_An_analysis_on_the_example_of_the_gamified_task_manager_Habitica)
- Variable rewards: [Variable Rewards — Nir Eyal/NirAndFar](https://www.nirandfar.com/want-to-hook-your-users-drive-them-crazy/), [Dopamine Loops and Player Retention — JCOMA 2025](https://jcoma.com/index.php/JCM/article/download/352/192)
- Gamified app landscape (2026): [Gamification+ — Best Gamified Habit App 2026](https://gamificationplus.uk/which-gamified-habit-building-app-do-i-think-is-best-in-2026/), [New Horizons in Habit-Building Gamification — Naavik](https://naavik.co/deep-dives/deep-dives-new-horizons-in-gamification/)

---
*Feature research for: Gamified habit tracker (RPG, ADHD-optimized, Dragon Ball Z theme)*
*Researched: 2026-03-03*
