# Phase 23: Deployment Configuration - Context

**Gathered:** 2026-03-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Make the codebase production-ready with environment-driven config so that deploying the frontend to Vercel and the backend to a Hostinger VPS requires zero code changes. This phase handles config wiring only — actual VPS setup (systemd, Nginx, TLS) is Phase 24.

</domain>

<decisions>
## Implementation Decisions

### VPS API URL
- No domain yet — will use VPS IP address initially, buy a domain soon
- Frontend starts on Vercel default URL (e.g., saiyan-tracker.vercel.app), custom domain later
- VITE_API_BASE is fully env-driven — swap IP for domain by changing one env var, no code changes
- Config must support both IP-based and domain-based URLs without modification

### CORS Policy
- CORS_ORIGINS env var with comma-separated allowed origins
- Dev environment uses Vite proxy (no CORS middleware needed) — current proxy setup stays
- Production uses FastAPI CORSMiddleware with origins from CORS_ORIGINS env var
- Standard headers only — no custom exposed headers needed yet

### Environment File Strategy
- Use pydantic-settings for typed config with .env file support and env var override
- Commit .env.example templates with placeholder values (not real secrets)
- Add .env to .gitignore — only .env.example gets committed
- Settings class reads from environment variables with sensible dev defaults as fallback

### Database Path
- Production: DATABASE_URL points to absolute path in /var/lib/saiyan-tracker/
- Development: keeps current relative path (sqlite:///saiyan_tracker.db in backend/)
- Auto-create database if it doesn't exist — current create_all + seed behavior continues
- Remove saiyan_tracker.db from git tracking, add *.db to .gitignore

### Claude's Discretion
- Whether to allow CORS credentials (based on current app state — no auth yet)
- CORS allowed/exposed headers configuration
- Whether .env.example files are per-service (frontend/ + backend/) or single root file — pick what fits the project structure

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `backend/app/core/config.py`: Plain Settings class — needs upgrade to pydantic-settings BaseSettings
- `frontend/src/services/api.ts`: Already reads `VITE_API_BASE` from `import.meta.env` with localhost fallback — minimal change needed
- `frontend/vite.config.ts`: Dev proxy already configured for /api -> localhost:8000

### Established Patterns
- Backend uses SQLAlchemy with create_engine from settings.DATABASE_URL
- Database session management in `backend/app/database/session.py` with SQLite pragmas
- Frontend uses ky HTTP client with prefixUrl from API_BASE constant

### Integration Points
- `backend/app/main.py`: FastAPI app — CORS middleware adds here
- `backend/app/database/session.py`: Engine creation reads from settings — will use new pydantic-settings
- `frontend/vite.config.ts`: May need Vercel SPA rewrite config (vercel.json)
- No vercel.json exists yet — needs creation for SPA routing (rewrites to index.html)

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches for FastAPI + Vercel deployment patterns.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 23-deployment-configuration*
*Context gathered: 2026-03-12*
