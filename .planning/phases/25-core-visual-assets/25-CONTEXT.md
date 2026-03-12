# Phase 25: Core Visual Assets - Context

**Gathered:** 2026-03-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace all placeholder icons with anime-faithful Saiyan transformation art (7 forms) and character portraits (Goku/Vegeta) across the dashboard. Update backend seed data paths to match actual files. Sanitize any SVG sources. Component art (Shenron, Dragon Balls, capsules, backgrounds) is Phase 26.

</domain>

<decisions>
## Implementation Decisions

### Art Sourcing & Style
- Primary style: anime-faithful vector art. Secondary: stylized illustration where vectors unavailable
- Source mix: curated fan art from user's URL collection + Claude-found art to fill gaps
- Personal use only — no copyright restrictions apply
- User downloads raw images from URLs into `frontend/public/assets/raw/`
- Claude processes (crop, resize, convert) during execution
- Key gaps to fill during research: Vegeta portraits, SSJ3, SSG, SSB transformation-specific art

### Transformation Avatars (7 forms)
- Each form gets a unique, distinct image — not color overlays on a single base
- Character: Goku specifically (not generic Saiyan)
- Framing: bust / chest-up (head + shoulders) — fits the 96px circular avatar
- Unique pose per form (not same pose with visual changes)
- Visual distinction guide:
  - Base → Black hair, calm pose
  - SSJ → Golden hair, power-up stance
  - SSJ2 → Spikier golden hair, lightning
  - SSJ3 → Long golden hair, no eyebrows
  - SSG → Red hair, slim build, serene
  - SSB → Blue hair, intense aura
  - UI → Silver hair/eyes, calm mastery

### Character Portraits (Goku & Vegeta)
- One portrait per character (not multiple expressions)
- Same anime-faithful vector style as transformation avatars
- Goku: friendly/determined — Claude picks base or SSJ form based on best available art at 40x40px
- Vegeta: stern/smirking expression
- Used in: quote toasts (CharacterQuote.tsx), roast/welcome cards (RoastWelcomeCard.tsx)

### File Format & Paths
- Format: WebP for all final assets (best compression, transparency support, already expected by frontend code)
- Unified path: all images at `/assets/avatars/` — both transformations and portraits
- File naming: `{form}.webp` for transformations (base.webp, ssj.webp, etc.), `{character}.webp` for portraits (goku.webp, vegeta.webp)
- Backend must update hardcoded `/avatars/{character}.png` → `/assets/avatars/{character}.webp` in all avatar_path references

### Claude's Discretion
- Exact image processing pipeline (crop dimensions, resize algorithm, WebP quality level)
- Which specific source image to use for each form (best available from user's URLs + research)
- Goku portrait form choice (base vs SSJ — whichever looks best at small sizes)
- SVG sanitization tool/approach
- Fallback behavior if a source image can't be processed

</decisions>

<specifics>
## Specific Ideas

- User has a curated URL collection saved in memory (reference_dbz_art_sources.md) with 35+ links from Vecteezy, Pinterest, Dribbble, AppleScoop, Easy-Peasy AI, Etsy, SoFancys
- Key Vecteezy vectors: base form (59664217), SSJ golden (59664222), SSJ2 (68841141), SSJ combat spirit (67464706), Ultra Instinct (66422632, 68680163), smiling headshot (68411796)
- Dribbble "Best Friends" shot has both Goku and Vegeta together
- SoFancys has a DBZ SVG bundle that may cover multiple characters
- Workflow: user downloads raw files → `frontend/public/assets/raw/` → Claude processes to final WebP

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `SaiyanAvatar.tsx`: Already expects `/assets/avatars/{transformation}.webp` with fallback chain (form → base.webp → User icon). Has per-form glow colors in `glowColorMap`. No code changes needed for image loading.
- `CharacterQuote.tsx`: Toast component using `avatar_path` from API with img fallback to User icon. Ready for real images.
- `RoastWelcomeCard.tsx`: Uses `avatar_path` from status API for both Goku welcome and Vegeta roast. Falls back to emoji (🟠/🔵). Ready for real images.
- `EmptyState.tsx`: Existing empty state component in common/

### Established Patterns
- Image error handling: SaiyanAvatar uses useState for imgError/fallbackError chain. CharacterQuote hides img and shows hidden fallback div. Consistent pattern across components.
- All components use Tailwind CSS with custom theme tokens (space-*, text-*, saiyan-*, aura-*)
- Framer Motion for animations (motion/react)

### Integration Points
- Backend `avatar_path` construction: Hardcoded in 4 files — `habits.py` (lines 91, 457), `roast_service.py` (lines 108, 118), `quotes.py` (line 29). All use `f"/avatars/{quote.character}.png"` pattern — must update to `/assets/avatars/{character}.webp`
- `frontend/public/assets/avatars/` directory: Currently empty — target location for all image files
- `frontend/public/assets/raw/` directory: Staging area for user-downloaded source images (to be created)

</code_context>

<deferred>
## Deferred Ideas

- Shenron SVG illustration — Phase 26
- Dragon Ball orb images (7 distinct spheres) — Phase 26
- Capsule Corp art — Phase 26
- Dashboard background atmospheric art — Phase 26
- Multiple character expressions per quote context — future enhancement
- User-selectable avatar character (Goku/Vegeta/Generic) in settings — future enhancement

</deferred>

---

*Phase: 25-core-visual-assets*
*Context gathered: 2026-03-12*
