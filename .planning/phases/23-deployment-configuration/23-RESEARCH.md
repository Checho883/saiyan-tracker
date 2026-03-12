# Phase 23: Deployment Configuration - Research

**Researched:** 2026-03-12
**Domain:** Environment-driven configuration for FastAPI + Vite/React deployment
**Confidence:** HIGH

## Summary

Phase 23 makes the Saiyan Tracker codebase production-ready by replacing hardcoded values with environment-driven configuration. The backend needs pydantic-settings for typed config with .env support, CORS middleware for cross-origin requests from Vercel, and an absolute DATABASE_URL for production SQLite. The frontend needs a vercel.json with SPA rewrites and already reads VITE_API_BASE from environment — minimal change needed.

The codebase is well-structured for this change. The backend config is a simple plain class (9 lines), the session module reads from it cleanly, and the frontend API client already has the env var pattern in place. No architectural changes needed — just upgrading config.py to pydantic-settings and wiring CORS middleware into main.py.

**Primary recommendation:** Use pydantic-settings BaseSettings with SettingsConfigDict for typed env-driven config; add CORSMiddleware to main.py reading origins from settings; create vercel.json in frontend/ with SPA rewrite rule.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- No domain yet — will use VPS IP address initially, buy a domain soon
- Frontend starts on Vercel default URL (e.g., saiyan-tracker.vercel.app), custom domain later
- VITE_API_BASE is fully env-driven — swap IP for domain by changing one env var, no code changes
- Config must support both IP-based and domain-based URLs without modification
- CORS_ORIGINS env var with comma-separated allowed origins
- Dev environment uses Vite proxy (no CORS middleware needed) — current proxy setup stays
- Production uses FastAPI CORSMiddleware with origins from CORS_ORIGINS env var
- Standard headers only — no custom exposed headers needed yet
- Use pydantic-settings for typed config with .env file support and env var override
- Commit .env.example templates with placeholder values (not real secrets)
- Add .env to .gitignore — only .env.example gets committed
- Settings class reads from environment variables with sensible dev defaults as fallback
- Production: DATABASE_URL points to absolute path in /var/lib/saiyan-tracker/
- Development: keeps current relative path (sqlite:///saiyan_tracker.db in backend/)
- Auto-create database if it doesn't exist — current create_all + seed behavior continues
- Remove saiyan_tracker.db from git tracking, add *.db to .gitignore

### Claude's Discretion
- Whether to allow CORS credentials (based on current app state — no auth yet)
- CORS allowed/exposed headers configuration
- Whether .env.example files are per-service (frontend/ + backend/) or single root file — pick what fits the project structure

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DEPLOY-01 | Backend reads DATABASE_URL from env var with absolute path | pydantic-settings BaseSettings with env var override and dev default |
| DEPLOY-02 | FastAPI CORSMiddleware with explicit Vercel origin allowlist | CORSMiddleware pattern with origins from settings, split on comma |
| DEPLOY-03 | Backend reads CORS_ORIGINS from env var | pydantic-settings field with comma-separated parsing |
| DEPLOY-04 | python-dotenv loads .env for local dev, env vars for production | pydantic-settings has built-in .env support via SettingsConfigDict(env_file=".env") |
| DEPLOY-05 | vercel.json with SPA rewrite rule | Standard `{"rewrites": [{"source": "/(.*)", "destination": "/index.html"}]}` |
| DEPLOY-06 | VITE_API_BASE env var set in Vercel, consumed at build time | Already implemented in api.ts — just needs Vercel dashboard config documentation |
| DEPLOY-07 | Vercel project configured with Root Directory set to frontend | vercel.json placement in frontend/ handles this; document Vercel dashboard setting |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| pydantic-settings | >=2.0 | Typed settings from env vars + .env files | Official Pydantic companion; recommended by FastAPI docs |
| python-dotenv | >=1.0 | .env file parsing (pydantic-settings dependency) | Auto-installed with pydantic-settings; industry standard |
| FastAPI CORSMiddleware | (built-in) | Cross-origin request handling | Ships with FastAPI via Starlette; no extra install |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| N/A | — | — | No additional libraries needed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| pydantic-settings | python-decouple | Loses Pydantic type validation and FastAPI integration |
| pydantic-settings | environs | Extra dependency; pydantic-settings is the FastAPI-blessed approach |

**Installation:**
```bash
pip install pydantic-settings
```
(python-dotenv is a dependency of pydantic-settings and installs automatically)

## Architecture Patterns

### Recommended Config Structure
```
backend/
├── app/
│   └── core/
│       └── config.py          # Settings class with BaseSettings
├── .env                       # Local dev values (gitignored)
├── .env.example               # Template with placeholders (committed)
└── requirements.txt           # Add pydantic-settings

frontend/
├── vercel.json                # SPA rewrite + Vercel config
├── .env                       # Local dev (gitignored — but Vite dev uses proxy, not env)
└── .env.example               # Template with VITE_API_BASE placeholder
```

### Pattern 1: Pydantic BaseSettings with SettingsConfigDict
**What:** Replace plain Settings class with pydantic-settings BaseSettings
**When to use:** Any FastAPI app that needs environment-driven config
**Example:**
```python
# Source: https://docs.pydantic.dev/latest/concepts/pydantic_settings/
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    APP_TITLE: str = "Saiyan Tracker"
    DATABASE_URL: str = "sqlite:///saiyan_tracker.db"
    CORS_ORIGINS: str = ""

    @property
    def cors_origin_list(self) -> list[str]:
        if not self.CORS_ORIGINS:
            return []
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

settings = Settings()
```

### Pattern 2: CORS Middleware with Environment Origins
**What:** Add CORSMiddleware to FastAPI app, reading origins from settings
**When to use:** When frontend and backend are on different domains (Vercel + VPS)
**Example:**
```python
# Source: https://fastapi.tiangolo.com/tutorial/cors/
from fastapi.middleware.cors import CORSMiddleware

if settings.cors_origin_list:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=False,  # No auth yet
        allow_methods=["*"],
        allow_headers=["*"],
    )
```

### Pattern 3: Vercel SPA Rewrite
**What:** Route all non-file requests to index.html for client-side routing
**When to use:** Any SPA deployed to Vercel with client-side routing (React Router)
**Example:**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Anti-Patterns to Avoid
- **Wildcard CORS origins in production:** Never use `allow_origins=["*"]` — always explicit origins
- **Hardcoded URLs:** Never put VPS IP or Vercel URL in source code — always from env vars
- **Relative DB paths in production:** SQLite relative paths resolve from CWD, which varies by how the service starts

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Env var parsing | Custom os.environ parser | pydantic-settings BaseSettings | Type validation, .env support, defaults, case handling |
| .env file loading | Custom file reader | SettingsConfigDict(env_file=".env") | Handles encoding, missing files, override precedence |
| CORS handling | Manual header injection | FastAPI CORSMiddleware | Preflight requests, credential handling, header normalization |

**Key insight:** pydantic-settings handles the entire env var → typed config pipeline including .env files, defaults, validation, and case insensitivity. No custom code needed.

## Common Pitfalls

### Pitfall 1: SQLite Relative Path in Production
**What goes wrong:** `sqlite:///saiyan_tracker.db` resolves relative to CWD, which changes depending on how systemd starts the service
**Why it happens:** SQLAlchemy interprets `///` (three slashes) as relative; `////` (four slashes) as absolute
**How to avoid:** Production DATABASE_URL must use absolute path: `sqlite:////var/lib/saiyan-tracker/saiyan_tracker.db`
**Warning signs:** Database file created in unexpected directory; empty database on each restart

### Pitfall 2: CORS Middleware Order
**What goes wrong:** CORS middleware must be added AFTER the app is created but BEFORE routes are included (or at least before requests are served)
**Why it happens:** Middleware in FastAPI/Starlette wraps the app; order matters for preflight handling
**How to avoid:** Add middleware right after `app = FastAPI(...)`, before `app.include_router(...)`
**Warning signs:** OPTIONS preflight requests returning 405 or missing Access-Control headers

### Pitfall 3: Vercel Root Directory vs vercel.json Location
**What goes wrong:** vercel.json must be in the directory Vercel considers the "root" — if Root Directory is set to `frontend/`, vercel.json goes inside `frontend/`, not the repo root
**Why it happens:** Vercel only reads vercel.json from the configured root directory
**How to avoid:** Place vercel.json in `frontend/` since that's the Vercel root directory
**Warning signs:** Rewrites not working; direct URL access returns 404

### Pitfall 4: pydantic-settings env_file Not Found
**What goes wrong:** If .env file doesn't exist, pydantic-settings raises an error (depending on version)
**Why it happens:** Some versions require the file to exist
**How to avoid:** Use `env_file=".env"` — pydantic-settings v2 silently skips missing .env files by default
**Warning signs:** App crashes on startup in production where .env doesn't exist (using real env vars instead)

### Pitfall 5: Root package.json Confusing Vercel
**What goes wrong:** Empty root `package.json` may cause Vercel to detect the project as a Node.js project at root level instead of recognizing `frontend/` as the build directory
**Why it happens:** Vercel auto-detects framework from root; empty or minimal package.json misleads detection
**How to avoid:** Either remove root package.json or ensure Vercel Root Directory is explicitly set to `frontend/`
**Warning signs:** Vercel build fails or runs `npm install` at root instead of in `frontend/`

### Pitfall 6: CORS Credentials Without Auth
**What goes wrong:** Setting `allow_credentials=True` with `allow_origins=["*"]` is invalid per CORS spec
**Why it happens:** When credentials are allowed, origins must be explicit (not wildcard)
**How to avoid:** Set `allow_credentials=False` since there's no auth yet; update when auth is added
**Warning signs:** Browser console error about credentials with wildcard origins

## Code Examples

### Backend config.py Upgrade
```python
# Source: https://docs.pydantic.dev/latest/concepts/pydantic_settings/
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )

    APP_TITLE: str = "Saiyan Tracker"
    DATABASE_URL: str = "sqlite:///saiyan_tracker.db"
    CORS_ORIGINS: str = ""

    @property
    def cors_origin_list(self) -> list[str]:
        """Parse comma-separated CORS_ORIGINS into a list."""
        if not self.CORS_ORIGINS:
            return []
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


settings = Settings()
```

### Backend main.py CORS Addition
```python
# Source: https://fastapi.tiangolo.com/tutorial/cors/
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(title=settings.APP_TITLE, lifespan=lifespan)

# Add CORS middleware (only active when origins are configured)
if settings.cors_origin_list:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Wire API routes AFTER middleware
from app.api.router import api_router
app.include_router(api_router)
```

### Frontend vercel.json
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Backend .env.example
```env
# Saiyan Tracker Backend Configuration
# Copy to .env and fill in values

# Database - absolute path for production
# DATABASE_URL=sqlite:////var/lib/saiyan-tracker/saiyan_tracker.db

# CORS - comma-separated allowed origins
# CORS_ORIGINS=https://saiyan-tracker.vercel.app
```

### Frontend .env.example
```env
# Saiyan Tracker Frontend Configuration
# Copy to .env and fill in values

# API Base URL - set in Vercel dashboard for production
# VITE_API_BASE=http://<VPS_IP>:8000/api/v1
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| pydantic v1 BaseSettings (built-in) | pydantic-settings v2 (separate package) | Pydantic v2, 2023 | Must `pip install pydantic-settings` separately |
| `from pydantic import BaseSettings` | `from pydantic_settings import BaseSettings` | Pydantic v2, 2023 | Import path changed |
| python-dotenv manual loading | SettingsConfigDict(env_file=".env") | pydantic-settings v2 | Built-in .env support, no manual `load_dotenv()` |

**Deprecated/outdated:**
- `from pydantic import BaseSettings` — moved to pydantic-settings package in Pydantic v2

## Open Questions

1. **CORS credentials flag**
   - What we know: No auth system exists yet; `allow_credentials=False` is safe
   - What's unclear: When auth is added, will it use cookies or Bearer tokens?
   - Recommendation: Set `allow_credentials=False` now; revisit when auth is implemented (Bearer tokens don't need CORS credentials)

2. **Root package.json cleanup**
   - What we know: STATE.md mentions root `package.json` and `package-lock.json` may interfere with Vercel
   - What's unclear: Whether Vercel will auto-detect correctly with Root Directory set to `frontend/`
   - Recommendation: Delete root `package.json` and `package-lock.json` if they only contain `{}` / are empty; or explicitly set Root Directory in Vercel dashboard

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | pytest (backend), vitest (frontend) |
| Config file | `backend/pyproject.toml`, `frontend/package.json` (vitest) |
| Quick run command | `cd backend && python -m pytest tests/ -x --tb=short` |
| Full suite command | `cd backend && python -m pytest tests/ -v && cd ../frontend && npm run test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DEPLOY-01 | DATABASE_URL from env var with absolute path | unit | `cd backend && python -m pytest tests/test_config.py::test_database_url_from_env -x` | ❌ Wave 0 |
| DEPLOY-02 | CORSMiddleware with Vercel origin | integration | `cd backend && python -m pytest tests/test_cors.py::test_cors_headers -x` | ❌ Wave 0 |
| DEPLOY-03 | CORS_ORIGINS from env var, comma-separated | unit | `cd backend && python -m pytest tests/test_config.py::test_cors_origins_parsing -x` | ❌ Wave 0 |
| DEPLOY-04 | .env file loading for local dev | unit | `cd backend && python -m pytest tests/test_config.py::test_env_file_loading -x` | ❌ Wave 0 |
| DEPLOY-05 | vercel.json SPA rewrite rule | manual-only | Verify file exists and contains correct rewrite rule | N/A |
| DEPLOY-06 | VITE_API_BASE consumed at build time | manual-only | Already implemented; verify in Vercel dashboard | N/A |
| DEPLOY-07 | Vercel Root Directory set to frontend | manual-only | Vercel dashboard configuration | N/A |

### Sampling Rate
- **Per task commit:** `cd backend && python -m pytest tests/ -x --tb=short`
- **Per wave merge:** `cd backend && python -m pytest tests/ -v && cd ../frontend && npm run test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `backend/tests/test_config.py` — covers DEPLOY-01, DEPLOY-03, DEPLOY-04 (settings class behavior)
- [ ] `backend/tests/test_cors.py` — covers DEPLOY-02 (CORS headers on cross-origin requests)

## Sources

### Primary (HIGH confidence)
- [Pydantic Settings Documentation](https://docs.pydantic.dev/latest/concepts/pydantic_settings/) — BaseSettings, SettingsConfigDict, env_file
- [FastAPI Settings Documentation](https://fastapi.tiangolo.com/advanced/settings/) — FastAPI + pydantic-settings integration
- [FastAPI CORS Documentation](https://fastapi.tiangolo.com/tutorial/cors/) — CORSMiddleware configuration
- [Vercel Rewrites Documentation](https://vercel.com/docs/rewrites) — SPA rewrite rules

### Secondary (MEDIUM confidence)
- [Vercel SPA Fallback Discussion](https://github.com/vercel/vercel/discussions/5448) — Community-verified rewrite pattern
- [React Router on Vercel](https://vercel.com/docs/frameworks/frontend/react-router) — Official Vercel + React Router guidance

### Tertiary (LOW confidence)
- None — all findings verified with primary sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — pydantic-settings is the official FastAPI recommendation, well-documented
- Architecture: HIGH — straightforward config upgrade with clear patterns from official docs
- Pitfalls: HIGH — common issues well-documented in community; SQLite path issue verified from SQLAlchemy docs

**Research date:** 2026-03-12
**Valid until:** 2026-04-12 (stable domain, slow-moving)
