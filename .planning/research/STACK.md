# Stack Research

**Domain:** Gamified habit tracker — RPG progression, heavy animations, sound effects, Dragon Ball Z theme
**Researched:** 2026-03-03
**Confidence:** HIGH (PRD stack validated; versions verified via npm/PyPI as of March 2026)

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| React | 19.x | UI framework | Concurrent rendering handles animation-heavy UIs without jank; React 19 stable since late 2024 with improved Actions and form handling; no breaking change risk for this app pattern |
| Vite | 7.x (7.3.1 latest) | Build tool & dev server | Sub-second HMR critical for iteration speed on animation work; native ESM, no Webpack overhead; 2026 standard for React SPAs |
| TypeScript | 5.x | Type safety | Strict types on the XP formula, transformation thresholds, and Zustand stores prevent runtime logic bugs in complex game mechanics |
| Python | 3.14.3 | Backend runtime | Current stable (released Feb 2026); experimental JIT compiler; no breaking changes for this API; PRD specifies it explicitly |
| FastAPI | 0.135.x | REST API | Automatic OpenAPI docs, async-first, Pydantic v2 integration; the standard Python API framework in 2026; 5-50x validation speed via Pydantic v2's Rust core |
| SQLAlchemy | 2.0.x | ORM | Declarative models with `mapped_column()`, async session support; 2.0 is the current standard; pairs cleanly with aiosqlite for async SQLite |
| SQLite | (stdlib) | Database | Single-user, single-file, zero config; perfect for this app; no server to manage; survives app restarts with full data intact |

### Animation & Effects Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| framer-motion | 12.x (12.34.4 latest) | Screen shakes, aura pulses, transformation overlays, XP popups | All animated UI elements; use `animate={{ x: [-10,10,-10,10,0] }}` for screen shake; `AnimatePresence` for mount/unmount; `motion.div` wrappers on habit cards and overlays |
| react-canvas-confetti | 2.x | Particle burst effects — energy blasts, Dragon Ball drops, Perfect Day explosion sparks | Replace confetti shapes with energy/fire particle configs; use canvas overlay during 100% climax sequence |
| tsParticles / @tsparticles/react | 3.x | Persistent ambient particle backgrounds (aura field, SSJ lightning sparks) | For always-on ambient effects like the Saiyan aura field; more configurable than react-canvas-confetti for looping effects |

**Note on tsParticles:** `@tsparticles/react` 3.0.0 is the current package (react-tsparticles was deprecated). Last published 2 years ago but still functional; evaluate at implementation time whether react-canvas-confetti alone is sufficient for burst effects before adding tsParticles as a dependency.

### Audio Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| use-sound | 5.0.0 | React hook for short sound effects | Primary audio layer; use for all event-triggered sounds (scouter beep, habit check, capsule pop, tier change); wraps Howler.js automatically |
| howler | 2.x | Direct audio engine for advanced control | Use directly (via Howler) only if use-sound's API is insufficient — e.g., looping ki-charge audio that must be stopped programmatically mid-playback; Howler provides `stop()`, `fade()`, `rate()` |

**Decision rationale:** use-sound is semi-maintained (5.0.0, published ~1 year ago) but stable for its scope. For the ki-charge hum that must grow and stop on demand, access Howler directly. use-sound delegates unrecognized options to Howler, so you can stay in the hook API and pass `loop: true` where needed.

### State Management

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Zustand | 5.x (5.0.11 latest) | Client state stores | All 4 stores from PRD: habitStore, powerStore, rewardStore, uiStore; v5 uses `useSyncExternalStore` for React 18/19 compatibility and eliminates tearing |

### Styling

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Tailwind CSS | 4.x (4.2.1 latest) | Utility-first CSS | Full UI styling; v4 is a complete rewrite — no more `tailwind.config.js` JS file, config is pure CSS `@import "tailwindcss"` in index.css; **5x faster full builds, 100x faster incremental** — critical for rapid animation iteration |

**Tailwind v4 breaking change:** The configuration model changed completely from v3. No `module.exports`, no `content` array, no `theme.extend`. All customization via CSS `@theme` directive. The PRD specifies Tailwind CSS without version; use v4 — it's the 2026 standard.

### Data Visualization

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Recharts | 3.x (3.7.0 latest) | Analytics charts — attribute progression, weekly XP bars | AttributeChart, contribution graph sparklines; declarative React components built on D3; 3.6M weekly downloads; React 19 compatible |

### Notifications / Feedback

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| sonner | latest (2.x) | Toast notifications | For non-animated feedback like "Off day marked", "Habit deleted"; the 2026 standard for React toasts; 2-3KB; shadcn/ui compatible |

### Backend Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Pydantic | 2.12.x | Request/response validation | Ships with FastAPI; v2 required (FastAPI dropped v1 support); 5-50x faster than v1 via Rust core |
| pydantic-settings | 2.x | Environment config loading | `Settings` class for CORS origins, SQLite path, debug flag |
| aiosqlite | 0.22.1 | Async SQLite driver | SQLAlchemy 2.0 async sessions with SQLite; enables non-blocking DB queries in FastAPI async route handlers |
| uvicorn | 0.x (latest) | ASGI server | Run FastAPI in development and production; use `--reload` in dev |
| alembic | 1.x (latest) | Database migrations | Schema evolution without data loss as models change through development |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint 9 | Linting | Flat config (`eslint.config.js`); v9 is the 2026 standard; configure react-hooks and typescript rules |
| Vitest | Frontend unit tests | Same config as Vite; fast; test XP formula functions, transformation threshold logic |
| pytest | Backend unit tests | Test habit_service, power_service, XP calculations in isolation |
| httpx | FastAPI test client | Async HTTP client for pytest integration tests against FastAPI routes |

---

## Installation

```bash
# Frontend — core
npm install react@^19 react-dom@^19
npm install framer-motion zustand recharts sonner
npm install use-sound howler
npm install react-canvas-confetti @tsparticles/react @tsparticles/engine

# Frontend — dev
npm install -D vite@^7 @vitejs/plugin-react typescript
npm install -D tailwindcss @tailwindcss/vite
npm install -D eslint vitest @types/react @types/react-dom

# Backend
pip install fastapi[standard]  # includes uvicorn, pydantic, pydantic-settings
pip install sqlalchemy[asyncio] aiosqlite alembic
```

**Tailwind v4 with Vite:** Use `@tailwindcss/vite` plugin instead of the PostCSS approach. In `vite.config.ts`:
```ts
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({ plugins: [react(), tailwindcss()] })
```
Then in `index.css`:
```css
@import "tailwindcss";
@theme { /* custom tokens here */ }
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| framer-motion | react-spring | react-spring is better for physics-heavy gesture interactions (dragging, throw velocity); framer-motion wins for declarative variant-based UI sequences like the transformation animation chain |
| framer-motion | GSAP | GSAP is more powerful for complex timeline sequences; overkill for this app; framer-motion covers all PRD animation needs declaratively |
| use-sound + Howler | Web Audio API directly | Web Audio API gives full DSP control (pitch shifting, reverb); not needed here; short clips don't need audio graph complexity |
| Zustand | Redux Toolkit | Redux adds boilerplate and DevTools complexity that Zustand avoids; RTK is justified at team scale, not for single-dev solo apps |
| Zustand | Jotai | Jotai is atom-based (bottom-up); Zustand store-based (top-down) better models this app's domain objects (habitStore, powerStore) as cohesive units |
| Recharts | Victory | Victory has a smaller ecosystem and fewer maintained examples; Recharts has 3.6M weekly downloads and React 19 support confirmed |
| Recharts | Chart.js | Chart.js is non-React; requires imperative API; Recharts is declarative JSX, fits the React mental model |
| SQLite + aiosqlite | PostgreSQL | PostgreSQL is overkill for single-user local app; SQLite is zero-config, file-based, survives process restarts; migrate to PostgreSQL only if moving to multi-user VPS deployment |
| FastAPI | Django REST | Django is heavier, ORM is less composable; FastAPI's async-first design and automatic Pydantic validation suit this use case |
| Tailwind v4 | Tailwind v3 | v3 is EOL for new projects; v4's CSS-first config is simpler once learned; 100x faster incremental builds matter for animation iteration |
| sonner | react-hot-toast | Both are fine; sonner is the 2026 trending choice; react-hot-toast is more established but slower release cadence |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| CSS animations / keyframes for complex sequences | Cannot sequence, pause, or trigger conditionally from React state; no spring physics; brittle timing | framer-motion for all stateful animation |
| react-spring for this project | Physics model is powerful but adds complexity for timeline-style sequences; framer-motion's `variants` and `AnimatePresence` are a better fit for the Perfect Day animation chain | framer-motion |
| react-tsparticles (old package) | Deprecated 3 years ago; new package is `@tsparticles/react` | `@tsparticles/react` — or skip entirely if react-canvas-confetti covers burst needs |
| Pydantic v1 | FastAPI has dropped v1 support as of late 2024; only v2 works with FastAPI 0.100+ | pydantic v2 (already the default with `pip install fastapi`) |
| SQLModel | Created by FastAPI's author but lags behind SQLAlchemy 2.0 and Pydantic v2 changes; community notes it as "behind the curve"; SQLAlchemy 2.0 directly gives more control | SQLAlchemy 2.0 + Pydantic v2 separately |
| `react-query` / `TanStack Query` | Not needed here; Zustand stores own server state; API calls are triggered by explicit user actions (habit check), not background syncing; adding TanStack Query adds complexity without payoff | Zustand + direct fetch in store actions |
| Next.js | SSR adds complexity with no benefit for single-user local app; no SEO need; no server components needed; full Vite SPA is simpler and faster to develop | Vite + React SPA |
| Electron | Desktop wrapping adds 300MB+ to distribution; no file system access needed beyond SQLite which FastAPI handles; browser-served app is sufficient | FastAPI serving React SPA locally |

---

## Stack Patterns by Variant

**If the ki-charge sound needs to loop and fade out on 100%:**
- Use Howler directly: `const sound = new Howl({ src: ['ki-charge.mp3'], loop: true })`
- `sound.fade(1, 0, 500)` then `sound.stop()` after fade
- Do NOT use use-sound for looping sounds that need programmatic stop; use-sound's `stop()` is fire-and-forget

**If Tailwind custom theme tokens cause issues in v4:**
- Define all design tokens in `index.css` under `@theme { --color-ki-orange: #FF6B00; }`
- Access via `bg-[--color-ki-orange]` or use Tailwind's CSS variable utilities
- There is no `tailwind.config.js` in v4 — do not create one

**If tsParticles bundle size is a concern:**
- Use `@tsparticles/basic` (slim bundle) instead of `tsparticles` (full bundle)
- Or use react-canvas-confetti for burst effects only and skip ambient particles entirely
- The PRD lists `react-canvas-confetti` as the explicit choice — start there, add tsParticles only if ambient aura effects require persistent looping particles

**If Python 3.14's experimental JIT causes issues:**
- FastAPI is compatible with Python 3.10+; fall back to 3.13.x (stable, no JIT experiment)
- Python 3.14.3 is in full support phase (not alpha) — JIT is opt-in, not default

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| React 19 | framer-motion 12.x | framer-motion 12 explicitly supports React 19 |
| React 19 | Zustand 5.x | Zustand 5 uses `useSyncExternalStore`, compatible with React 18/19 |
| React 19 | Recharts 3.x | Recharts 3.x tested with React 19 |
| React 19 | use-sound 5.0.0 | Maintainer commits to major React release compatibility |
| Tailwind v4 | Vite 7 | Use `@tailwindcss/vite` plugin — do NOT use PostCSS approach with v4 |
| FastAPI 0.135+ | Pydantic v2 only | FastAPI dropped Pydantic v1 support; v2 is required |
| SQLAlchemy 2.0 | aiosqlite 0.22.x | Standard async SQLite driver for SQLAlchemy 2.0 async sessions |
| Python 3.14 | FastAPI 0.135+ | FastAPI requires Python >= 3.10; 3.14 is fully supported |

---

## Sources

- [framer-motion on npm](https://www.npmjs.com/package/framer-motion) — version 12.34.4 confirmed, React 19 support verified — HIGH confidence
- [motion.dev docs](https://motion.dev/docs/react) — official framer-motion documentation — HIGH confidence
- [Vite releases](https://vite.dev/releases) — version 7.3.1 confirmed — HIGH confidence
- [Zustand GitHub releases](https://github.com/pmndrs/zustand/releases) — version 5.0.11, React 19 `useSyncExternalStore` integration confirmed — HIGH confidence
- [Recharts npm](https://www.npmjs.com/package/recharts) — version 3.7.0 confirmed — HIGH confidence
- [use-sound npm](https://www.npmjs.com/package/use-sound) — version 5.0.0, semi-maintained status noted — MEDIUM confidence (maintenance risk flagged)
- [Tailwind CSS v4.0 announcement](https://tailwindcss.com/blog/tailwindcss-v4) — CSS-first config confirmed, v4.2.1 current — HIGH confidence
- [FastAPI releases](https://github.com/fastapi/fastapi/releases) — version 0.135.1, Python 3.10+ requirement — HIGH confidence
- [Pydantic PyPI](https://pypi.org/project/pydantic/) — version 2.12.x, FastAPI v1 drop confirmed — HIGH confidence
- [aiosqlite PyPI](https://pypi.org/project/aiosqlite/) — version 0.22.1, SQLAlchemy 2.0 async compatibility confirmed — HIGH confidence
- [Python 3.14 release](https://www.python.org/downloads/release/python-3143/) — 3.14.3 stable as of Feb 2026 — HIGH confidence
- [react-canvas-confetti npm](https://www.npmjs.com/package/react-canvas-confetti) — confirmed functional — MEDIUM confidence (canvas customization for non-confetti effects needs implementation-time testing)
- [@tsparticles/react npm](https://www.npmjs.com/package/@tsparticles/react) — 3.0.0, last published 2 years ago — LOW confidence for active maintenance; evaluate at implementation
- [LogRocket: React animation libraries 2026](https://blog.logrocket.com/best-react-animation-libraries/) — framer-motion vs react-spring comparison — MEDIUM confidence
- [sonner vs react-hot-toast comparison](https://www.oreateai.com/blog/sonner-vs-toast-a-deep-dive-into-react-notification-libraries/) — MEDIUM confidence

---

*Stack research for: Gamified habit tracker — Dragon Ball Z theme, RPG progression, heavy animations, sound effects*
*Researched: 2026-03-03*
