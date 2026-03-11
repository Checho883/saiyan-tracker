# Feature Research

**Domain:** Deployment & visual asset integration for a DBZ-themed React habit tracker (v2.0)
**Researched:** 2026-03-11
**Confidence:** HIGH (deployment patterns), MEDIUM (anime art integration specifics)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features required for the app to function in real use. Missing any of these = the app is still a dev-only toy.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| `vercel.json` with SPA rewrite | Without `rewrites`, every non-root URL returns a 404 on direct load or refresh. React Router handles routing in-browser, but Vercel must serve `index.html` for all paths first. | LOW | `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`. Confirmed pattern from Vercel community and official docs. |
| `VITE_API_URL` env var consumed in `api.ts` | The frontend currently hits `localhost:8000` via the Vite dev proxy (`vite.config.ts`). That proxy does not exist in a Vercel static build — all `ky` calls must target the VPS URL directly. | LOW | `VITE_` prefix makes vars available as `import.meta.env.VITE_API_URL`. Statically inlined at build time. Set in Vercel dashboard under Environment Variables, not in a committed `.env.production` file. |
| FastAPI `CORSMiddleware` with Vercel origin | Without explicit CORS allow-list, every browser request from `app.vercel.app` to the VPS API fails with a CORS error. The browser enforces this; it cannot be worked around client-side. | LOW | `allow_origins=["https://your-app.vercel.app"]` in FastAPI's `CORSMiddleware`. For a single-user personal app, `allow_origins=["*"]` is acceptable and simpler. |
| Systemd unit file for FastAPI auto-start | Without systemd, the backend process dies on VPS reboot, requiring SSH to restart manually. Not viable for a personal-use app. | LOW | `uvicorn app.main:app --host 127.0.0.1 --port 8000` in a `.service` file with `Restart=always` and `WantedBy=multi-user.target`. |
| Nginx reverse proxy on VPS | Uvicorn should not be publicly exposed on port 8000. Nginx handles HTTPS termination (Let's Encrypt), routes requests to uvicorn on `127.0.0.1:8000`, and serves proper response headers. | MEDIUM | Standard: `proxy_pass http://127.0.0.1:8000;` for all API paths. A single `server` block suffices for this single-service VPS. |
| HTTPS / SSL on VPS | Vercel serves the frontend over HTTPS. If the VPS API is plain HTTP, browsers block those requests as mixed content and all API calls fail silently. | LOW | Certbot + Let's Encrypt via `certbot --nginx`. Free, auto-renews every 90 days. Hostinger VPS supports this directly. |
| SQLite database path via env variable | The backend `DATABASE_URL` defaults to a relative path that works in dev. On a VPS, the database must live in a stable absolute path (e.g., `/home/user/saiyan-tracker/data/`) that survives deployments and is outside any git-managed directory. | LOW | `DATABASE_URL=sqlite:////home/user/saiyan-tracker/data/saiyan_tracker.db` in a `.env` on the VPS, read by `python-dotenv`. Do not commit this file. |
| SaiyanAvatar images at expected paths | `SaiyanAvatar` requests `/assets/avatars/{transformation}.webp`. Without the files, the component falls back to a `User` icon. The hero section — the most prominent visual in the app — shows a generic placeholder instead of a DBZ character. | MEDIUM | 7 files needed: `base.webp`, `ssj.webp`, `ssj2.webp`, `ssj3.webp`, `ssg.webp`, `ssb.webp`, `ui.webp`. Place in `frontend/public/assets/avatars/`. |
| Character portrait images for quote toasts and roast card | `CharacterQuote` (toast) and `RoastWelcomeCard` both load `quote.avatar_path` returned by the API. The fallback is a `User` icon or an orange/blue circle emoji. Quote events are a core mechanic — showing a character face makes them land. | MEDIUM | Minimum 2 portraits: Goku (`/assets/portraits/goku.webp`) and Vegeta (`/assets/portraits/vegeta.webp`). Backend `avatar_path` values in the seeded quotes DB must match the actual file paths. This is a data + file coordination step. |

### Differentiators (Competitive Advantage)

Features that elevate the visual experience from "functional" to "feels like the show."

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Transformation-accurate avatar art | Each of the 7 avatar slugs uses art faithful to that form's hair color and energy signature. The existing `glowColorMap` already sets the correct glow per transformation — a matching image grounds the glow in recognizable source material. | MEDIUM | WebP at 192×192px (rendered at 96px on desktop, 24px on mobile compact hero). 2x resolution handles retina displays without any `srcset` complexity. Source: Vecteezy anime-inspired vectors (personal-use license) or similar. |
| Shenron illustration replacing the dragon emoji | `ShenronCeremony` currently renders `🐉` at `text-6xl`. A properly drawn eternal dragon illustration scales infinitely, fills the dark ceremony background with visual weight, and creates the ceremonial drama the wish-granting mechanic deserves. | MEDIUM | SVG is preferred over WebP for this element: scales to any size without pixelation, can have individual paths animated by Motion, and stays sharp on all displays. An 800×800 WebP fallback is acceptable if SVG is not available. |
| Dragon Ball sphere orb images | `DragonBallTracker` renders 7 styled divs with star text. Replacing these with proper orange star-crystal orbs makes the collection loop feel authentic. The glow effect (`boxShadow: '0 0 8px var(--color-warning)'`) already exists — it just needs a real orb behind it. | LOW | Option A: 7 individual WebP orbs at 64×64px (`ball-1.webp` through `ball-7.webp`). Option B: a single sprite sheet with CSS `background-position`. Option A is simpler to implement and maintain. |
| Capsule Corp capsule illustration on flip card | `CapsuleDropOverlay` front face shows a large `?` on a dark gradient. A rendered Capsule Corp capsule (the classic white pill with the black half) transforms the reveal mechanic from abstract to a recognizable DBZ item. | LOW | Static WebP or inline SVG on the front face of the 3D flip card. The component already has `backfaceVisibility: hidden` — drop in an `<img>` replacing the `?` text. |
| Space/nebula background art in hero section | `HeroSection` uses `bg-gradient-to-b from-space-800 to-transparent`. A dark starfield / nebula overlay at 10-20% opacity adds visual depth while preserving text readability and the existing Tailwind color tokens. | LOW | One WebP at 1920×1080 source resolution. Applied as `background-image` with `background-size: cover` and low opacity overlay in `AppShell` or `HeroSection`. Does not require component logic changes. |
| Full character portrait set (4-6 characters) | Piccolo, Gohan, Krillin, and Beerus quotes exist in the 118-quote seed. Each character should have a consistent portrait that appears in `CharacterQuote` toasts throughout the day. Consistency builds character identity — users learn to recognize Piccolo's tone vs Vegeta's. | LOW | 4-6 WebP portraits at 80×80px. Zero component changes required: `avatar_path` drives the image source. Only requires file placement + correct `avatar_path` values in the DB. |
| `loading="lazy"` on below-fold images | Character portraits in `RoastWelcomeCard` and capsule history images are not in the initial viewport. Lazy loading prevents them from competing with the avatar image for initial render bandwidth. | LOW | Add `loading="lazy"` to any `<img>` not rendered in the hero section. Native browser support is universal in 2025. Zero dependency change — a one-line attribute addition per image. |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Serve static frontend from VPS (same origin as API) | Eliminates CORS entirely — frontend and API share a domain. | Loses Vercel's CDN edge caching, zero-downtime preview deployments, and the "git push = live" DX. Adds Nginx static file config complexity. The VPS has one CPU — serving both static files and the API from the same process wastes a perfectly good edge network. | Keep split deployment. Configure `CORSMiddleware` correctly on FastAPI (5 lines). |
| CDN image hosting (Cloudinary, Imgix, or similar) | Automatic format conversion, responsive srcset, real-time transforms. | Significant over-engineering for a personal app with ~20 static images that change once. External dependency, potential costs, additional CORS surface to configure. | Place images in `frontend/public/assets/`. Vercel already serves all static files from its global CDN — the images get edge-cached automatically with no additional config. |
| Docker on the VPS | Reproducible environments, easy rollbacks. | For a single-process FastAPI + SQLite app serving one user, Docker adds image storage overhead (~500MB for Python base), more complex `systemd` unit (or `docker-compose` as a separate concern), and more failure modes to debug over SSH on a fresh VPS. | Systemd + uvicorn + nginx is 3 config files and is directly debuggable with `journalctl -f`. Appropriate for the complexity level. |
| SVG sprite sheet for character portraits | Bundles all icons into one HTTP request, allows CSS `fill` overrides. | Character portraits are detailed raster art, not monochrome icons. SVG sprites only make sense for UI icons (outlines). Encoding raster art as SVG (base64 embedded) defeats the purpose and bloats the HTML. | Individual WebP files. HTTP/2 on both Vercel and the VPS handles parallel requests efficiently — the sprite optimization is irrelevant at this scale. |
| Build-time automatic WebP conversion via `vite-plugin-image-optimizer` | Source PNGs/JPEGs in git, convert at build time, no manual work. | Adds Sharp as a native dependency (platform-specific binary), extends Vite build time by 30-60 seconds in CI, and introduces potential build failures on different Node versions. For ~20 images that don't change frequently, the build-time tax is not worth it. | Pre-convert source art to WebP once using Sharp CLI (`npx sharp input.png -o output.webp`) or Squoosh before placement in `public/`. Only reconsider if the image count exceeds ~50 and builds become a bottleneck. |
| `<picture>` with responsive `srcset` for different viewport widths | Serve 96px images to mobile, 192px to desktop — "true responsive images." | The avatar renders at a fixed CSS size (`w-20 h-20` on desktop, `w-6 h-6` on mobile). There is no viewport-dependent layout shift that would justify multiple source resolutions beyond the standard 2x (retina) vs 1x split. Adding `srcset` sizes here creates complexity for zero visual benefit. | Provide 2x WebP files (192×192px). The browser downsamples to 96px at 1x DPR and serves 192px at 2x DPR with a simple `srcset="image.webp 2x"` if needed. Not necessary unless profiling shows LCP from avatar images on real usage. |
| AVIF format with `<picture>` fallback | AVIF is ~50% smaller than WebP at equivalent quality — meaningful bandwidth savings. | Worth evaluating after real usage data exists. For 20 static images at ~10-30KB each, the difference is negligible on a modern connection. Also requires providing both formats (doubles the file count) or a build plugin. | Start with WebP. If LCP profiling after deployment reveals image loading as a bottleneck, add AVIF then. Defer — this is a P3 optimization. |

---

## Feature Dependencies

```
[HTTPS/SSL on VPS]
    └──required-by──> [Nginx reverse proxy]
        └──required-by──> [FastAPI publicly accessible from internet]
            └──required-by──> [VITE_API_URL wired to production VPS URL]
                └──required-by──> [Vercel frontend calling VPS API without mixed-content block]
                    └──required-by──> [App usable at production URL]

[SaiyanAvatar images in public/assets/avatars/]
    └──enhances──> [Hero section visual identity]
    └──enhances──> [TransformationOverlay animation (shows new form)]

[Backend avatar_path values matching actual file paths]
    └──required-by──> [CharacterQuote toasts showing character portrait]
    └──required-by──> [RoastWelcomeCard avatar images]
    └──requires──> [Portrait files exist in public/assets/portraits/]
    └──requires──> [DB seeded with correct paths OR backend updated to return correct paths]

[Shenron illustration in public/assets/]
    └──enhances──> [ShenronCeremony phase 2 (dragon appear)]

[Dragon Ball orb images in public/assets/]
    └──enhances──> [DragonBallTracker slots]
    └──enhances──> [ShenronCeremony phase 5 (scatter animation)]

[Capsule illustration in public/assets/]
    └──enhances──> [CapsuleDropOverlay front face]
```

### Dependency Notes

- **HTTPS must come before Vercel wiring:** Vercel frontend is HTTPS-only. Plain HTTP backend triggers a mixed-content block in all modern browsers. SSL is not optional — it is the blocker for the entire deployment being usable.
- **`avatar_path` is a data + file coordination step:** `CharacterQuote` and `RoastWelcomeCard` get `avatar_path` from API responses. The values are stored in the SQLite database when quotes are seeded. The DB on the VPS may have the old default paths (empty string or a dev-time path). Either the seeder must be re-run with correct production paths, or the FastAPI quote endpoints must be updated to prepend the correct base URL/path.
- **Visual assets are independently addable:** `SaiyanAvatar` has a two-tier fallback (base → User icon). `CharacterQuote` hides the image on error. `DragonBallTracker` renders CSS divs without any `<img>` tag. No asset is a hard dependency — the app remains functional without any of them. This means assets can be dropped in progressively after initial deployment.
- **Deployment wiring and visual assets are independent tracks:** All the infrastructure work (Vercel config, env vars, CORS, VPS setup) can be completed and verified without any image assets. Then assets can be added as a second pass.

---

## MVP Definition

### Launch With (v1 — Deployed and Functional)

Minimum viable deployment: the app works at a real URL with real data.

- [ ] `vercel.json` with SPA rewrite — without this, direct URLs 404
- [ ] `VITE_API_URL` consumed in `api.ts` — backend call wiring, blocks all data loading
- [ ] FastAPI `CORSMiddleware` with Vercel origin — browser calls fail without it
- [ ] Systemd unit file for auto-restart — operational requirement for a VPS
- [ ] Nginx reverse proxy config — required for port routing and header management
- [ ] HTTPS via Let's Encrypt — required to avoid mixed-content blocks from Vercel
- [ ] SaiyanAvatar images (7 transformations) — hero section identity, highest visual impact per user experience
- [ ] Goku + Vegeta portrait images (2 minimum) — quote toasts and roast card are core daily mechanics

### Add After Validation (v1.x — Visual Completeness)

After confirming the app works end-to-end at the production URL:

- [ ] Shenron illustration — wish ceremony deserves visual weight; adds ceremony drama
- [ ] Dragon Ball orb images (7 spheres) — collection loop visual authenticity
- [ ] Capsule Corp capsule illustration — flip card front face recognition
- [ ] Remaining character portraits (Piccolo, Gohan, etc.) — completes the quote system visually
- [ ] Background/space art overlay — atmospheric depth, purely aesthetic

### Future Consideration (v2+)

- [ ] AVIF format with `<picture>` fallback — defer until LCP profiling shows image loading as bottleneck
- [ ] Per-transformation background art (different nebula color per SSJ tier) — high artistic effort, low functional impact
- [ ] `loading="lazy"` audit across all non-hero images — straightforward but low priority until usage pattern is established

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| `vercel.json` SPA rewrite | HIGH | LOW | P1 |
| `VITE_API_URL` env var wiring in `api.ts` | HIGH | LOW | P1 |
| FastAPI CORS allow-list | HIGH | LOW | P1 |
| Systemd unit + Nginx + SSL on VPS | HIGH | MEDIUM | P1 |
| SQLite absolute path via env var | HIGH | LOW | P1 |
| SaiyanAvatar images (7 forms, WebP) | HIGH | MEDIUM | P1 |
| Goku + Vegeta portrait images | HIGH | LOW | P1 |
| Shenron illustration (SVG preferred) | MEDIUM | LOW | P2 |
| Dragon Ball orb images (7 spheres) | MEDIUM | LOW | P2 |
| Capsule Corp capsule illustration | MEDIUM | LOW | P2 |
| Remaining character portraits (4-6 total) | MEDIUM | LOW | P2 |
| Background/space art overlay | LOW | LOW | P2 |
| `loading="lazy"` on below-fold images | LOW | LOW | P2 |
| AVIF + `<picture>` format upgrade | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch — app is broken, data-less, or visually dead without it
- P2: Should have — completes the visual overhaul goal; add after core deployment verified
- P3: Nice to have — defer until performance profiling justifies the complexity

---

## Reference: Component-to-Asset Mapping

All existing components already implement graceful fallbacks. This table maps each component to what it expects and what happens without the asset.

| Component | Expected Asset Path | Current Fallback | Impact Without Asset |
|-----------|--------------------|--------------------|----------------------|
| `SaiyanAvatar` | `/assets/avatars/{transformation}.webp` (7 slugs) | `User` lucide icon in a rounded div | Hero section shows generic user icon — primary visual identity is lost |
| `CharacterQuote` toast | `quote.avatar_path` (from API response) | Image hidden, `User` icon shown | Quote toasts lose character attribution; mechanics still work |
| `RoastWelcomeCard` | `quote.avatar_path` (from API response) | `🟠` for Goku, `🔵` for Vegeta | Roast/welcome card renders but with emoji placeholders |
| `ShenronCeremony` | None — currently renders `🐉` inline | N/A (emoji IS the current state) | Ceremony functions but lacks visual drama |
| `DragonBallTracker` | None — currently renders styled divs | N/A (CSS divs ARE the current state) | Collection tracker functional, not visually authentic |
| `CapsuleDropOverlay` front face | None — currently renders `?` text | N/A (text IS the current state) | Flip card reveal works, no Capsule Corp visual identity |
| `DragonBallTrajectory` | None — currently renders CSS circles | N/A (circles ARE the current state) | Trajectory animation works, circles instead of orbs |

---

## Image Specification Summary

Pre-converting source art to WebP before placement in `public/` is recommended. No build plugin required.

| Asset Group | Count | Rendered Size | Format | Source Resolution | Path |
|-------------|-------|---------------|--------|-------------------|------|
| Saiyan avatars | 7 | 96×96px (desktop), 24×24px (mobile compact) | WebP | 192×192px (2x) | `public/assets/avatars/` |
| Character portraits | 4–6 | 40×40px | WebP | 80×80px (2x) | `public/assets/portraits/` |
| Dragon Ball orbs | 7 | 32×32px | WebP or inline SVG | 64×64px | `public/assets/dragonballs/` |
| Shenron | 1 | Full-screen overlay, scales to viewport | SVG (preferred) or WebP | Scalable / 800×800px | `public/assets/` |
| Capsule Corp capsule | 1 | 128×160px (flip card front) | WebP or SVG | 256×320px | `public/assets/` |
| Background/space art | 1 | Covers viewport | WebP | 1920×1080px | `public/assets/` |

---

## How Anime-Themed Web Apps Handle Character Art

Findings from community patterns and DBZ fan project conventions (MEDIUM confidence — web research + forum patterns):

1. **Fan projects use image-per-character WebP files at fixed pixel dimensions.** Sprite sheets are reserved for animation frames in pixel art games, not for still portrait art in web UIs. Each character gets its own file, named by character slug.

2. **Art placement convention is `public/assets/` (Vite) or `public/images/` (Next.js).** Static files in `public/` are not processed by the module bundler. Images must not be imported as JS modules — they are served as-is from the static directory. The path in `src` attributes must match the file path relative to `public/`.

3. **Copyright risk for single-user private apps stays low under specific conditions:** (a) the Vercel URL is not shared publicly or indexed by search engines, (b) no revenue is generated, (c) art used is anime-inspired vector art (Vecteezy or similar) with a proper license, not direct screenshots or officially published artwork. Using "inspired by" vectors rather than exact character reproductions reduces infringement risk. The PROJECT.md decision to source from Vecteezy + Pinterest for personal use only is the correct risk posture.

4. **Shenron as SVG offers the best tradeoff for the ceremony use case.** An SVG illustration of a serpentine dragon can have individual body segment paths that Motion animates (undulation, scale, opacity). WebP at a fixed resolution cannot be animated per-element. For the centerpiece of the wish ceremony, SVG is worth the additional sourcing effort.

---

## Vercel + VPS Split Deployment: How It Works

Confirmed pattern (HIGH confidence — Vercel docs + FastAPI official deployment docs):

```
Browser
  └── HTTPS → Vercel CDN (static files: index.html, JS bundles, assets)
                  index.html bootstraps React → imports.meta.env.VITE_API_URL
                  all API calls → HTTPS → VPS domain

VPS (Hostinger)
  └── Port 443 → Nginx
                   └── proxy_pass 127.0.0.1:8000 → uvicorn
                                                       └── FastAPI app
                                                               └── SQLite DB (absolute path)
```

Key coordination points:
- **`VITE_API_URL`** is set in Vercel's env var dashboard (not committed). Value is the VPS API domain (e.g., `https://api.yourdomain.com`).
- **`CORS` allow-list** on FastAPI includes the Vercel deployment URL. If using a custom Vercel domain, add that domain, not the generic `*.vercel.app` wildcard.
- **Nginx on VPS** terminates SSL and proxies all requests to uvicorn on localhost. The uvicorn process is bound to `127.0.0.1` only (not `0.0.0.0`) to prevent direct port exposure.
- **Systemd** restarts uvicorn on reboot and on process crash. Log output goes to `journalctl -u saiyan-tracker.service`.

---

## Sources

- [Vercel rewrites documentation](https://vercel.com/docs/rewrites)
- [Vercel CORS configuration — Vercel KB](https://vercel.com/kb/guide/how-to-enable-cors)
- [Vite environment variables — official Vite docs](https://vite.dev/guide/env-and-mode)
- [FastAPI deployment with Nginx + Gunicorn + systemd (2026) — Zestminds](https://www.zestminds.com/blog/fastapi-deployment-guide/)
- [FastAPI async deployment on Hostinger VPS with Nginx + uvicorn — GeekyShows](https://geekyshows.com/blog/post/deploy-fas/)
- [Deploy FastAPI with Gunicorn and Nginx on Ubuntu 24.04 — Vultr Docs](https://docs.vultr.com/how-to-deploy-a-fastapi-application-with-gunicorn-and-nginx-on-ubuntu-2404)
- [vite-plugin-image-optimizer — GitHub](https://github.com/FatehAK/vite-plugin-image-optimizer)
- [Image optimization 2025 — FrontendTools](https://www.frontendtools.tech/blog/modern-image-optimization-techniques-2025)
- [SVG sprite vs inline SVG performance — Cloud Four](https://cloudfour.com/thinks/svg-icon-stress-test/)
- [React SVG integration and optimization — Strapi blog](https://strapi.io/blog/mastering-react-svg-integration-animation-optimization)
- [DBZ copyright and fan use — Kanzenshuu](https://kanzenshuu.com/forum/viewtopic.php?t=38853)

---
*Feature research for: Saiyan Tracker v2.0 — Deploy & Visual Overhaul*
*Researched: 2026-03-11*
