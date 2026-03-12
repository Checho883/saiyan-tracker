# Phase 25: Core Visual Assets - Research

**Researched:** 2026-03-12
**Domain:** Image asset pipeline, WebP conversion, SVG sanitization, backend path updates
**Confidence:** HIGH

## Summary

Phase 25 replaces placeholder icons with real Dragon Ball Z art across three integration points: SaiyanAvatar transformation images (7 forms), character portraits for Goku/Vegeta in quote toasts and roast/welcome cards, and backend avatar_path field corrections. The frontend components are already wired to load from `/assets/avatars/{form}.webp` with robust fallback chains, so no frontend component code changes are needed — only image files need to be placed at the expected paths.

The backend has 5 hardcoded `f"/avatars/{quote.character}.png"` references across 3 files (habits.py lines 91/457, roast_service.py lines 108/118, quotes.py line 29) that must be updated to `/assets/avatars/{character}.webp`. The Quote model has no `avatar_path` column — paths are constructed at query time.

The image pipeline is straightforward: user downloads source images from curated URLs into `frontend/public/assets/raw/`, then Claude processes them (crop to bust framing, resize, convert to WebP) and places final files at `frontend/public/assets/avatars/`. Since this is a personal-use app with curated fan art, no licensing concerns apply.

**Primary recommendation:** Split into two parallel plans — (1) image asset sourcing/processing pipeline for all 9 images, (2) backend path updates + SVG sanitization script. Plan 1 is the human-dependent bottleneck (user must download raw files); Plan 2 is fully autonomous code changes.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Primary style: anime-faithful vector art. Secondary: stylized illustration where vectors unavailable
- Source mix: curated fan art from user's URL collection + Claude-found art to fill gaps
- Personal use only — no copyright restrictions apply
- User downloads raw images from URLs into `frontend/public/assets/raw/`
- Claude processes (crop, resize, convert) during execution
- Each form gets a unique, distinct image — not color overlays on a single base
- Character: Goku specifically (not generic Saiyan)
- Framing: bust / chest-up (head + shoulders) — fits 96px circular avatar
- Unique pose per form (not same pose with visual changes)
- One portrait per character (not multiple expressions)
- Same anime-faithful vector style as transformation avatars
- Format: WebP for all final assets
- Unified path: all images at `/assets/avatars/`
- File naming: `{form}.webp` for transformations, `{character}.webp` for portraits
- Backend must update hardcoded `/avatars/{character}.png` to `/assets/avatars/{character}.webp`

### Claude's Discretion
- Exact image processing pipeline (crop dimensions, resize algorithm, WebP quality level)
- Which specific source image to use for each form (best available from user's URLs + research)
- Goku portrait form choice (base vs SSJ — whichever looks best at small sizes)
- SVG sanitization tool/approach
- Fallback behavior if a source image can't be processed

### Deferred Ideas (OUT OF SCOPE)
- Shenron SVG illustration — Phase 26
- Dragon Ball orb images (7 distinct spheres) — Phase 26
- Capsule Corp art — Phase 26
- Dashboard background atmospheric art — Phase 26
- Multiple character expressions per quote context — future enhancement
- User-selectable avatar character (Goku/Vegeta/Generic) in settings — future enhancement
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ART-01 | Base form Goku WebP at `/assets/avatars/base.webp` | Vecteezy 59664217 (Son Goku base form 2D editable) — direct source |
| ART-02 | SSJ Goku WebP at `/assets/avatars/ssj.webp` | Vecteezy 59664222 (Super Saiyan golden editable) — direct source |
| ART-03 | SSJ2 Goku WebP at `/assets/avatars/ssj2.webp` | Vecteezy 68841141 (Goku SSJ2 character) — direct source |
| ART-04 | SSJ3 Goku WebP at `/assets/avatars/ssj3.webp` | Gap — no specific SSJ3 in user URLs; needs web search or AI generation |
| ART-05 | SSG Goku WebP at `/assets/avatars/ssg.webp` | Gap — no specific SSG in user URLs; red-haired Goku needs sourcing |
| ART-06 | SSB Goku WebP at `/assets/avatars/ssb.webp` | AppleScoop 9409 (Goku SSB wallpaper) — needs crop/convert |
| ART-07 | UI Goku WebP at `/assets/avatars/ui.webp` | Vecteezy 66422632 + 68680163 (Ultra Instinct 2D + poster) — two options |
| ART-08 | Goku portrait for quote toasts/welcome cards | Vecteezy 68411796 (smiling headshot) — ideal for 40x40 portrait |
| ART-09 | Vegeta portrait for roast cards/quote toasts | Dribbble "Best Friends" shot or SoFancys SVG bundle — needs research during execution |
| ART-10 | Backend seed data `avatar_path` fields match production paths | 5 hardcoded locations identified: habits.py (2), roast_service.py (2), quotes.py (1) |
| ART-15 | All sourced SVGs sanitized | DOMPurify or manual inspection — see sanitization section below |
</phase_requirements>

## Standard Stack

### Core
| Tool | Purpose | Why Standard |
|------|---------|--------------|
| sharp (npm) | Image resize, crop, WebP conversion | Industry standard Node.js image processing; already in npm ecosystem; handles WebP natively |
| DOMPurify | SVG sanitization | Standard XSS prevention library; removes scripts, event handlers, external refs from SVGs |

### Supporting
| Tool | Purpose | When to Use |
|------|---------|-------------|
| cwebp (CLI) | WebP conversion alternative | If sharp unavailable; Google's official WebP encoder |
| svgo | SVG optimization | Reduce SVG file size before any conversion |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| sharp | Pillow (Python) | Backend is Python, but images are frontend assets — Node toolchain is natural |
| sharp | Manual GIMP/Photoshop | Works fine for 9 images; sharp just automates consistently |
| DOMPurify | Manual inspection | Only ~2-3 SVGs expected; manual inspection is viable for this scale |

**Recommendation:** Given only 9 final images, sharp is convenient but not mandatory. The user could manually process images in any image editor. For SVG sanitization at this scale (2-3 files max), manual inspection of source SVGs is sufficient — check for `<script>`, `on*` attributes, `xlink:href` to external URLs, and `<foreignObject>`.

## Architecture Patterns

### Asset Directory Structure
```
frontend/public/
├── assets/
│   ├── raw/                    # User-downloaded source files (git-ignored)
│   │   ├── base-source.png
│   │   ├── ssj-source.svg
│   │   └── ...
│   └── avatars/                # Final processed WebP files (committed)
│       ├── base.webp           # Transformation avatars
│       ├── ssj.webp
│       ├── ssj2.webp
│       ├── ssj3.webp
│       ├── ssg.webp
│       ├── ssb.webp
│       ├── ui.webp
│       ├── goku.webp           # Character portraits
│       └── vegeta.webp
```

### Image Processing Pipeline Pattern
1. User downloads raw images from URLs to `frontend/public/assets/raw/`
2. Processing script (or manual steps) for each image:
   - Crop to bust framing (head + shoulders)
   - Resize to target dimensions (96x96 for avatars, 40x40 for portraits — or larger with CSS scaling)
   - Convert to WebP with transparency preservation
   - Output to `frontend/public/assets/avatars/`
3. Verify each file loads in SaiyanAvatar component

**Target dimensions recommendation:**
- Transformation avatars: 192x192 px (2x for retina at 96px display) or 256x256 for quality margin
- Character portraits: 80x80 px (2x for retina at 40px display) or 128x128 for flexibility
- WebP quality: 85-90 (good balance of quality and compression for illustrations)

### Backend Path Update Pattern
All 5 locations follow the same pattern — a simple string replacement:
```python
# OLD:
avatar_path=f"/avatars/{quote.character}.png"

# NEW:
avatar_path=f"/assets/avatars/{quote.character}.webp"
```

No model changes needed — `avatar_path` is constructed at query time, not stored in DB.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| WebP conversion | Custom ffmpeg pipeline | sharp or cwebp CLI | Handles transparency, quality settings, error handling |
| SVG sanitization | Regex-based script filter | DOMPurify or manual checklist | Regex misses edge cases; for 2-3 files, manual is fine |
| Image serving | Custom API endpoint | Vite static file serving | `frontend/public/` is already served as static root |

## Common Pitfalls

### Pitfall 1: Transparency Loss in WebP Conversion
**What goes wrong:** Source images with transparent backgrounds become white/black backgrounds in WebP
**Why it happens:** Some conversion tools default to JPEG-like encoding without alpha channel
**How to avoid:** Use WebP lossless mode for images needing transparency, or ensure lossy mode preserves alpha. sharp: `sharp(input).webp({ quality: 85, alphaQuality: 100 })`
**Warning signs:** White squares around character art against dark dashboard background

### Pitfall 2: Circular Crop Clipping Important Features
**What goes wrong:** Hair spikes (SSJ3 long hair, SSJ2 spiky hair) get clipped by the 96px circular avatar
**Why it happens:** CSS `rounded-full` + `object-cover` clips to circle, and anime hair often extends beyond head bounds
**How to avoid:** Frame the bust with extra headroom. For forms with extreme hair (SSJ3, SSJ2), center the crop slightly lower so hair fits. Test each image in the actual component with rounded-full clipping.
**Warning signs:** Flat-topped avatars where hair should spike upward

### Pitfall 3: Backend Path Mismatch After Update
**What goes wrong:** Backend returns `/assets/avatars/goku.webp` but file doesn't exist yet (images not deployed), breaking the img tag
**Why it happens:** Code change deployed before image files
**How to avoid:** Deploy images first, or ensure the existing fallback chain handles missing files gracefully. SaiyanAvatar already has fallback to User icon. CharacterQuote hides img and shows fallback div. RoastWelcomeCard falls back to emoji.
**Warning signs:** Broken image icons in production

### Pitfall 4: Git-Committing Large Raw Source Files
**What goes wrong:** Raw downloaded images (multi-MB PNGs, SVGs with embedded bitmaps) bloat the repo
**Why it happens:** `git add .` catches everything in `public/assets/raw/`
**How to avoid:** Add `frontend/public/assets/raw/` to `.gitignore`. Only commit the processed WebP files in `avatars/`.

### Pitfall 5: Hardcoded Path Missed in Update
**What goes wrong:** One of the 5 `avatar_path` constructions still uses old `.png` path
**Why it happens:** Easy to miss when updating across 3 files
**How to avoid:** Use grep to verify zero remaining `/avatars/` + `.png` references after update. All 5 locations are known: habits.py (lines 91, 457), roast_service.py (lines 108, 118), quotes.py (line 29).

## Code Examples

### SaiyanAvatar — Already Correct (no changes needed)
```tsx
// frontend/src/components/dashboard/SaiyanAvatar.tsx
// Already loads from: /assets/avatars/${transformation}.webp
// Has fallback chain: form → base.webp → User icon
<img src={`/assets/avatars/${transformation}.webp`} ... />
```

### CharacterQuote — Already Correct (no changes needed)
```tsx
// frontend/src/components/dashboard/CharacterQuote.tsx
// Uses avatar_path from API response directly
// Has fallback: hide img → show User icon div
<img src={quote.avatar_path} ... />
```

### Backend Path Fix (all 5 locations)
```python
# Pattern to apply at all 5 locations:
# OLD: f"/avatars/{quote.character}.png"
# NEW: f"/assets/avatars/{quote.character}.webp"
avatar_path=f"/assets/avatars/{quote.character}.webp"
```

### Image Processing with sharp (if used)
```javascript
const sharp = require('sharp');

// Transformation avatar: crop + resize + WebP
await sharp('raw/base-source.png')
  .resize(256, 256, { fit: 'cover', position: 'top' })  // top-biased for hair
  .webp({ quality: 85, alphaQuality: 100 })
  .toFile('avatars/base.webp');

// Portrait: smaller target
await sharp('raw/goku-portrait-source.png')
  .resize(128, 128, { fit: 'cover', position: 'center' })
  .webp({ quality: 90, alphaQuality: 100 })
  .toFile('avatars/goku.webp');
```

### SVG Sanitization Checklist (manual)
```
For each SVG file:
1. Open in text editor
2. Search for: <script, onclick, onload, on*, javascript:, xlink:href="http
3. Search for: <foreignObject, <iframe, <embed
4. Search for: url(http, url(data:text/html
5. If any found: remove the element/attribute
6. If clean: proceed to conversion
```

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| PNG avatar placeholders | WebP with transparency | 30-50% smaller files, native transparency, same quality |
| Emoji fallbacks (🟠/🔵) | Real character portraits | Visual identity, anime-faithful look |
| `/avatars/{char}.png` path | `/assets/avatars/{char}.webp` path | Consistent with Vite static serving conventions |

## Open Questions

1. **SSJ3 and SSG source images**
   - What we know: User's URL collection lacks specific SSJ3 (long golden hair, no eyebrows) and SSG (red hair, slim) images
   - What's unclear: Whether the user will find suitable sources or needs alternatives
   - Recommendation: During execution, check if user has found sources. If not, suggest specific search terms or AI-generated alternatives. The SoFancys DBZ SVG bundle may contain these forms.

2. **Vegeta portrait source**
   - What we know: Dribbble "Best Friends" shot has both characters; SoFancys SVG bundle may have Vegeta
   - What's unclear: Whether these sources provide a clean, croppable Vegeta bust shot
   - Recommendation: User explores these during download phase; Claude crops best available

3. **Image processing toolchain**
   - What we know: sharp (Node) and cwebp (CLI) are both viable; project has Node installed
   - What's unclear: Whether to install sharp as devDependency or use manual processing
   - Recommendation: For 9 images, a simple Node script with sharp is efficient but manual GIMP/Photoshop works too. Claude's discretion per CONTEXT.md.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (frontend), pytest (backend) |
| Config file | `frontend/vitest.config.ts`, `backend/pytest.ini` or inline |
| Quick run command | `cd frontend && npx vitest run --reporter=verbose` / `cd backend && python -m pytest -x` |
| Full suite command | `cd frontend && npx vitest run` / `cd backend && python -m pytest` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ART-01 | base.webp exists and loads in SaiyanAvatar | smoke | `test -f frontend/public/assets/avatars/base.webp` | ❌ Wave 0 |
| ART-02 | ssj.webp exists | smoke | `test -f frontend/public/assets/avatars/ssj.webp` | ❌ Wave 0 |
| ART-03 | ssj2.webp exists | smoke | `test -f frontend/public/assets/avatars/ssj2.webp` | ❌ Wave 0 |
| ART-04 | ssj3.webp exists | smoke | `test -f frontend/public/assets/avatars/ssj3.webp` | ❌ Wave 0 |
| ART-05 | ssg.webp exists | smoke | `test -f frontend/public/assets/avatars/ssg.webp` | ❌ Wave 0 |
| ART-06 | ssb.webp exists | smoke | `test -f frontend/public/assets/avatars/ssb.webp` | ❌ Wave 0 |
| ART-07 | ui.webp exists | smoke | `test -f frontend/public/assets/avatars/ui.webp` | ❌ Wave 0 |
| ART-08 | goku.webp portrait exists | smoke | `test -f frontend/public/assets/avatars/goku.webp` | ❌ Wave 0 |
| ART-09 | vegeta.webp portrait exists | smoke | `test -f frontend/public/assets/avatars/vegeta.webp` | ❌ Wave 0 |
| ART-10 | Backend avatar_path uses `/assets/avatars/*.webp` | unit | `cd backend && python -m pytest tests/test_api_quotes.py -x` | ✅ |
| ART-15 | SVG sources have no embedded scripts | manual | Manual inspection during processing | N/A |

### Sampling Rate
- **Per task commit:** `cd backend && python -m pytest -x --tb=short`
- **Per wave merge:** Full frontend + backend suites
- **Phase gate:** All 9 WebP files exist + backend tests green + SVG inspection done

### Wave 0 Gaps
- [ ] `frontend/public/assets/avatars/` directory — must be created
- [ ] `frontend/public/assets/raw/` directory — staging area for user downloads (git-ignored)
- [ ] `.gitignore` entry for `frontend/public/assets/raw/`
- [ ] Asset existence verification script (optional — can be manual `ls` check)

## Sources

### Primary (HIGH confidence)
- Codebase analysis: SaiyanAvatar.tsx, CharacterQuote.tsx, RoastWelcomeCard.tsx — verified current image loading patterns
- Codebase analysis: habits.py, roast_service.py, quotes.py — verified all 5 avatar_path construction sites
- Codebase analysis: vitest.config.ts, backend/tests/ — verified test infrastructure

### Secondary (MEDIUM confidence)
- User's curated URL collection (reference_dbz_art_sources.md) — URLs verified present but image availability/quality not checked
- sharp npm package — well-known, used extensively in Node image processing

### Tertiary (LOW confidence)
- SSJ3/SSG/Vegeta art availability from listed URLs — user must verify during download

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - codebase patterns fully inspected, straightforward file placement + string replacement
- Architecture: HIGH - no architectural changes needed; frontend components already wired correctly
- Pitfalls: HIGH - based on direct codebase analysis of fallback chains and path patterns

**Research date:** 2026-03-12
**Valid until:** 2026-04-12 (stable — static assets, no version-sensitive dependencies)
