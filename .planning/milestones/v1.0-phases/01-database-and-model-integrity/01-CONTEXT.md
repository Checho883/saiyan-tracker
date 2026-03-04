# Phase 1: Database and Model Integrity - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

All 15 SQLAlchemy 2.0 models with correct relationships, constraints, and indexes. Game constants (XP values, Kaio-ken tier multipliers, 10 transformation thresholds) defined as the single source of truth. 100+ quote seed data. All date logic uses client-supplied local_date (YYYY-MM-DD strings, not DATETIME). This phase delivers the data contract that every subsequent phase builds on.

</domain>

<decisions>
## Implementation Decisions

### Quote Seed Content
- Mix of real Dragon Ball Z/Super quotes and original in-character quotes to fill trigger-event gaps
- Real iconic quotes where they naturally fit (transformations, victories, encouragement); original quotes for app-specific triggers like `zenkai`, `welcome_back`, `habit_complete`
- Heavy Goku & Vegeta distribution (~30% Goku, ~25% Vegeta, ~15% Piccolo, ~10% each Gohan/Whis/Beerus)
- Focus on iconic arcs: Namek/Frieza, Cell Games, Tournament of Power — the most memorable transformation moments
- Vegeta roast quotes go full savage at severity level 3+ — pride-destroying, the kind that makes you open the app out of spite. No holding back

### Default Seed Data
- Auto-create default user silently on first DB init (display_name="Saiyan", sound_enabled=true, theme="dark") — no signup flow
- Seed the 6 default categories from PRD: Health, Mind, Body, Family, Skills, Discipline (with colors and emoji icons)
- Seed ~10 default capsule rewards across rarities (Common: "15 min TikTok", "Eat a snack"; Rare: "30 min gaming"; Epic: "Order takeout", etc.)
- Seed 3-5 example Shenron wishes (e.g., "Buy a new game", "Full day off", "Nice dinner out") — user edits to personal wishes later
- No sample habits — habits are personal. Dashboard handles empty state

### Data Constraints & Deletion Rules
- Category is optional on habits (category_id nullable) — keeps habit creation simple
- Archiving a habit (is_active=false) preserves all historical logs, streaks, and XP — data integrity for analytics
- Deleting a category sets category_id to NULL on its habits (SET NULL cascade) — no data loss
- Rewards use soft delete (is_active=false) to preserve capsule drop history references
- Wishes can be hard-deleted; wish_logs reference them via foreign key

### Claude's Discretion
- SQLAlchemy model organization (one file per model vs grouped)
- Migration strategy (Alembic vs create_all for initial setup)
- UUID implementation (Python uuid4 vs database-generated)
- Index strategy beyond the required unique constraints
- Quote text content selection (specific quote wording within the agreed style/tone guidelines)
- Default category colors and emoji choices

</decisions>

<specifics>
## Specific Ideas

- Vegeta savage roasts should feel like actual Vegeta — pride, superiority, disappointment in your Saiyan heritage. Not generic insults.
- Real quotes from Namek ("I am the Super Saiyan, Son Goku!"), Cell Games ("Gohan, let it go"), Tournament of Power ("This is the autonomous state, Ultra Instinct") are the gold standard
- The app is single-user (Sergio), single-tenant — no auth needed, but user_id FK pattern stays for clean data modeling
- PRD defines exact schemas column-by-column — follow them precisely. No creative reinterpretation of the data model.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project, no existing code

### Established Patterns
- None yet — this phase establishes the patterns all subsequent phases follow
- PRD specifies: Python 3.14, FastAPI, SQLAlchemy 2.0, SQLite

### Integration Points
- Models will be imported by Phase 2 (services), Phase 3 (API routes)
- constants.py will be imported by Phase 2 (game logic calculations)
- Quote seed data will be queried by Phase 3 (GET /quotes/random) and Phase 8 (quote system)
- Database session management will be used by all subsequent backend phases

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-database-and-model-integrity*
*Context gathered: 2026-03-04*
