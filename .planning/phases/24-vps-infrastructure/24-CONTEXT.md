# Phase 24: VPS Infrastructure - Context

**Gathered:** 2026-03-12
**Status:** Ready for planning

<domain>
## Phase Boundary

The FastAPI backend runs as a persistent HTTPS service on the Hostinger VPS that survives reboots and serves the production database. Covers systemd, Nginx reverse proxy, TLS via Certbot, SQLite WAL mode, and production environment file. DNS setup is a prerequisite handled separately.

</domain>

<decisions>
## Implementation Decisions

### Service runner
- Uvicorn only (no Gunicorn) — single process, systemd manages restarts
- Bind to Unix socket at /run/saiyan-tracker.sock (Nginx connects via socket)
- Dedicated system user 'saiyan' with no login shell runs the service
- Python virtual environment at /home/user/saiyan-tracker/venv (isolated from system Python)
- systemd unit points to venv's uvicorn binary

### Domain & Nginx
- API subdomain: api.saiyantracker.com
- DNS managed on Hostinger — plan assumes A record already pointing to VPS IP
- Nginx reverse-proxies api.saiyantracker.com to the Unix socket — API only, no frontend serving
- TLS via Certbot (Let's Encrypt) on the api subdomain

### Deploy workflow
- Code deployed via git pull on VPS (SSH in, pull, restart)
- Project lives at /home/user/saiyan-tracker (under home directory)
- deploy.sh script on VPS automates: git pull → pip install -r requirements.txt → systemctl restart
- Deploy script backs up saiyan_tracker.db to .bak before each deploy

### Database
- SQLite database stays inside the repo directory at /home/user/saiyan-tracker/backend/saiyan_tracker.db
- .gitignore already excludes .db files — safe from git pull conflicts
- DB files (.db, .db-shm, .db-wal) owned by 'saiyan' service user
- Deploy script chowns DB files after pull

### Claude's Discretion
- WAL mode setup approach (app-level pragma vs deploy script — leaning toward app startup pragma alongside existing foreign_keys pragma)
- Exact systemd unit parameters (RestartSec, WantedBy, etc.)
- Nginx buffer/timeout tuning
- Certbot renewal method (timer vs cron)

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches for VPS infrastructure.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/core/config.py`: pydantic-settings already reads DATABASE_URL and CORS_ORIGINS from env — no code changes needed for env file support
- `app/database/session.py`: SQLAlchemy connect event already sets PRAGMA foreign_keys=ON — WAL pragma can be added right next to it
- `app/main.py`: /health endpoint exists for service monitoring

### Established Patterns
- Environment configuration via pydantic-settings with .env file support — production env file at /etc/saiyan-tracker.env or systemd EnvironmentFile
- SQLAlchemy engine creation from DATABASE_URL setting

### Integration Points
- systemd EnvironmentFile feeds DATABASE_URL and CORS_ORIGINS to the app via pydantic-settings
- CORS_ORIGINS must include the Vercel frontend domain
- Nginx proxies to the Unix socket that uvicorn binds to

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 24-vps-infrastructure*
*Context gathered: 2026-03-12*
