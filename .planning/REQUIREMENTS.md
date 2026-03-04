# Requirements: Saiyan Tracker v1.1 — The Dopamine Layer

**Defined:** 2026-03-04
**Core Value:** Every habit check must feel like something happened — a sound, a visual pulse, a number going up. If the app is silent and still, it has failed.

## v1.1 Requirements

Requirements for the frontend experience. Each maps to roadmap phases.

### State & Foundation

- [ ] **STATE-01**: App renders a React 19 SPA with Vite 7, TypeScript, and Tailwind CSS v4
- [ ] **STATE-02**: TypeScript types match all backend API response schemas (habits, completions, power, attributes, capsules, dragon-balls, quotes, settings, analytics)
- [ ] **STATE-03**: API client layer connects to all 9 backend endpoints with typed request/response
- [ ] **STATE-04**: Zustand stores (habit, power, reward, ui) hold all client state with selector discipline
- [ ] **STATE-05**: Dark theme applied by default with CSS custom properties for all colors
- [ ] **STATE-06**: Page routing between Dashboard, Analytics, and Settings views

### Dashboard

- [ ] **DASH-01**: User can see all active habits grouped by category with completion status
- [ ] **DASH-02**: User can check/uncheck a habit and see optimistic UI toggle with rollback on error
- [ ] **DASH-03**: Daily aura progress bar animates from 0% to current completion with spring physics
- [ ] **DASH-04**: Aura bar shows tier label (Kaio-ken x3/x10/x20) updating at 50%/80%/100% thresholds
- [ ] **DASH-05**: Four RPG attribute bars (STR/VIT/INT/KI) display current level and XP fill toward next level
- [ ] **DASH-06**: Dragon Ball tracker shows 7 slots with glowing filled balls and dim empty slots
- [ ] **DASH-07**: Saiyan avatar displays current transformation form with form-appropriate aura effect
- [ ] **DASH-08**: Avatar shows power level in scouter-style display and progress bar to next form
- [ ] **DASH-09**: Streak display shows current and best streak with visual scaling
- [ ] **DASH-10**: Character quote appears after habit check with character avatar, text, and attribution
- [ ] **DASH-11**: User can create a new habit via modal (title, description, importance, attribute, frequency, category)
- [ ] **DASH-12**: User can edit and delete existing habits
- [ ] **DASH-13**: XP popup floats up from habit card showing "+N [ATTR] XP" in attribute color

### Audio

- [ ] **AUDIO-01**: SoundProvider context wraps app with global sound toggle and playSound method
- [ ] **AUDIO-02**: Habit check triggers scouter beep sound
- [ ] **AUDIO-03**: Tier change triggers power-up burst sound
- [ ] **AUDIO-04**: Capsule drop triggers capsule pop sound; capsule open triggers reveal chime
- [ ] **AUDIO-05**: Perfect Day (100%) triggers explosion/SSJ scream sound
- [ ] **AUDIO-06**: Dragon Ball earned triggers radar ping sound
- [ ] **AUDIO-07**: Shenron ceremony triggers thunder + roar sound
- [ ] **AUDIO-08**: Transformation triggers power-up sequence sound
- [ ] **AUDIO-09**: Sound effects use playbackRate variation (0.9-1.1) to prevent monotony on repeated sounds

### Animations

- [ ] **ANIM-01**: Animation queue in uiStore enforces sequential playback when multiple events trigger simultaneously
- [ ] **ANIM-02**: Tier change flash shows brief banner ("Kaio-ken x3!") with scale-in animation at 50%/80% thresholds
- [ ] **ANIM-03**: Perfect Day explosion plays choreographed 2-3s full-screen sequence (overlay → shake → particles → text → XP counter → quote → fadeout)
- [ ] **ANIM-04**: Capsule drop bounces in with scale spring, pulses to invite tap
- [ ] **ANIM-05**: Capsule reveal plays 3D card flip (rotateY) showing reward with rarity-appropriate glow (white/blue/purple)
- [ ] **ANIM-06**: New Dragon Ball earned flies into tracker slot with trajectory animation
- [ ] **ANIM-07**: Transformation unlock plays form-specific visual (golden flash SSJ, lightning SSJ2, red SSG, blue SSB, silver UI) with avatar swap
- [ ] **ANIM-08**: Shenron ceremony plays full-screen sequence (sky darkens → lightning → Shenron scales up → wish prompt → balls scatter → reset)
- [ ] **ANIM-09**: Shenron ceremony enforces minimum 1 active wish before allowing completion

### Analytics

- [ ] **ANLYT-01**: Calendar heatmap displays days with 4-color coding (gold 100%, blue 75-99%, red 50-74%, gray <50%) and blue outline for off-days
- [ ] **ANLYT-02**: User can navigate calendar by month with prev/next controls
- [ ] **ANLYT-03**: Attribute progression area chart shows STR/VIT/INT/KI growth over time with period selector (week/month/all)
- [ ] **ANLYT-04**: Summary stat cards display perfect days count, average %, total XP, and longest streak
- [ ] **ANLYT-05**: Power level line chart shows cumulative XP progression over days

### Settings

- [ ] **SET-01**: User can toggle sound effects on/off (persisted via backend)
- [ ] **SET-02**: User can switch between dark and light theme (persisted via backend)
- [ ] **SET-03**: User can CRUD capsule rewards with rarity assignment (common/rare/epic) and see distribution stats
- [ ] **SET-04**: User can CRUD Shenron wishes with active toggle and times-wished count
- [ ] **SET-05**: User can manage categories (name, color, emoji)
- [ ] **SET-06**: User can mark an off-day with reason selection (sick/vacation/rest/injury/other)
- [ ] **SET-07**: User can set display name

## v1.2 Requirements

Deferred to next milestone. Tracked but not in current roadmap.

### Polish

- **POLISH-01**: Per-habit 90-day contribution graph (binary heatmap per individual habit)
- **POLISH-02**: Vegeta escalating roast system with 3 severity levels based on consecutive missed days
- **POLISH-03**: Streak milestone badges (3/7/21/30/60/90/365) with character-specific quotes
- **POLISH-04**: Calendar day drill-down popover showing per-habit breakdown on click
- **POLISH-05**: Capsule and wish history in analytics page

### Future

- **FUT-01**: PWA with offline support and service worker
- **FUT-02**: Training Arc time-limited challenges
- **FUT-03**: Tournament mode (compete against past self)
- **FUT-04**: Drag-and-drop habit reordering

## Out of Scope

| Feature | Reason |
|---------|--------|
| Task management | Habits only — tasks compete with habits and enable hyperfocus exploits |
| Multi-user / authentication | Single tenant, Sergio only — auth adds complexity for zero value |
| Mobile app | Web-first (PWA in v1.2+) |
| Cloud sync / multi-device | Local SQLite, no VPS needed for solo use |
| Social / leaderboards | Solo tracker — external comparison triggers shame for neurodivergent users |
| HP loss / punishment mechanics | Loss aversion kills ADHD motivation — Zenkai halves, never resets |
| Notification / reminder system | Notification fatigue; dopamine loop IS the reminder |
| AI habit suggestions | Analysis paralysis risk for someone who knows their habits |
| Real-time chat | Not a social app |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| STATE-01 | — | Pending |
| STATE-02 | — | Pending |
| STATE-03 | — | Pending |
| STATE-04 | — | Pending |
| STATE-05 | — | Pending |
| STATE-06 | — | Pending |
| DASH-01 | — | Pending |
| DASH-02 | — | Pending |
| DASH-03 | — | Pending |
| DASH-04 | — | Pending |
| DASH-05 | — | Pending |
| DASH-06 | — | Pending |
| DASH-07 | — | Pending |
| DASH-08 | — | Pending |
| DASH-09 | — | Pending |
| DASH-10 | — | Pending |
| DASH-11 | — | Pending |
| DASH-12 | — | Pending |
| DASH-13 | — | Pending |
| AUDIO-01 | — | Pending |
| AUDIO-02 | — | Pending |
| AUDIO-03 | — | Pending |
| AUDIO-04 | — | Pending |
| AUDIO-05 | — | Pending |
| AUDIO-06 | — | Pending |
| AUDIO-07 | — | Pending |
| AUDIO-08 | — | Pending |
| AUDIO-09 | — | Pending |
| ANIM-01 | — | Pending |
| ANIM-02 | — | Pending |
| ANIM-03 | — | Pending |
| ANIM-04 | — | Pending |
| ANIM-05 | — | Pending |
| ANIM-06 | — | Pending |
| ANIM-07 | — | Pending |
| ANIM-08 | — | Pending |
| ANIM-09 | — | Pending |
| ANLYT-01 | — | Pending |
| ANLYT-02 | — | Pending |
| ANLYT-03 | — | Pending |
| ANLYT-04 | — | Pending |
| ANLYT-05 | — | Pending |
| SET-01 | — | Pending |
| SET-02 | — | Pending |
| SET-03 | — | Pending |
| SET-04 | — | Pending |
| SET-05 | — | Pending |
| SET-06 | — | Pending |
| SET-07 | — | Pending |

**Coverage:**
- v1.1 requirements: 47 total
- Mapped to phases: 0
- Unmapped: 47

---
*Requirements defined: 2026-03-04*
*Last updated: 2026-03-04 after initial definition*
