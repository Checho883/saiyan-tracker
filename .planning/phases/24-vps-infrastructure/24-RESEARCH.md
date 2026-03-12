# Phase 24: VPS Infrastructure - Research

**Researched:** 2026-03-12
**Status:** Complete

## Phase Boundary

Deploy the FastAPI backend as a persistent HTTPS service on Hostinger VPS. Covers: systemd service unit, Nginx reverse proxy, Certbot TLS, SQLite WAL mode, production environment file, and a deploy script. DNS A record for `api.saiyantracker.com` is a prerequisite assumed to be in place.

## Requirements Coverage

| Req ID | What | Approach |
|--------|------|----------|
| DEPLOY-08 | systemd unit for auto-start + restart-on-failure | Unit file with `Restart=on-failure`, `WantedBy=multi-user.target` |
| DEPLOY-09 | Nginx reverse proxy for API subdomain | server block proxying to Unix socket |
| DEPLOY-10 | Let's Encrypt TLS via Certbot | `certbot --nginx` auto-configures SSL for the server block |
| DEPLOY-11 | SQLite WAL mode + correct permissions | App-level PRAGMA on connect event; chown in deploy script |
| DEPLOY-12 | Environment file for systemd | `/etc/saiyan-tracker.env` with `EnvironmentFile=` directive |

## Technical Research

### 1. systemd Service Unit

**File:** `/etc/systemd/system/saiyan-tracker.service`

Key directives:
- `Type=notify` not needed for uvicorn; use `Type=simple`
- `ExecStart=` points to venv uvicorn: `/home/user/saiyan-tracker/venv/bin/uvicorn app.main:app --uds /run/saiyan-tracker.sock`
- `WorkingDirectory=/home/user/saiyan-tracker/backend`
- `User=saiyan` (dedicated no-login system user)
- `Restart=on-failure`, `RestartSec=5`
- `WantedBy=multi-user.target` for boot autostart
- `EnvironmentFile=/etc/saiyan-tracker.env`
- `RuntimeDirectory=saiyan-tracker` auto-creates `/run/saiyan-tracker/` with correct ownership (alternative: use `/run/saiyan-tracker.sock` directly with tmpfiles.d)

**Socket permissions:** The Unix socket must be readable by the Nginx worker (runs as `www-data`). Options:
- Add `UMask=0117` to the service unit so the socket is created as `srw-rw----`
- Add `saiyan` user to `www-data` group, OR add `www-data` to `saiyan` group
- Simplest: bind to `127.0.0.1:8000` instead of Unix socket

**Decision from CONTEXT.md:** Unix socket at `/run/saiyan-tracker.sock`. To solve permissions, the service unit should set `UMask=0111` (socket gets `rw-rw-rw-`) since only localhost access matters, or better: `chmod 660` the socket via `ExecStartPost` and add `www-data` to the `saiyan` group.

**Recommended approach:** Use `127.0.0.1:8000` binding instead of Unix socket. Reasons:
- Simpler configuration, no socket permission issues
- Only accessible on localhost (Nginx handles external access)
- Easier to debug with curl from the VPS

However, CONTEXT.md explicitly chose Unix socket. Sticking with that decision. Use `UMask=0117` + add `www-data` to `saiyan` group.

### 2. Nginx Reverse Proxy

**File:** `/etc/nginx/sites-available/saiyan-tracker`

Configuration:
```nginx
upstream saiyan_backend {
    server unix:/run/saiyan-tracker.sock;
}

server {
    listen 80;
    server_name api.saiyantracker.com;

    location / {
        proxy_pass http://saiyan_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Certbot will modify this to add SSL directives automatically.

Symlink to `sites-enabled` and remove default site.

### 3. Certbot / Let's Encrypt TLS

```bash
sudo certbot --nginx -d api.saiyantracker.com --non-interactive --agree-tos -m <email>
```

Certbot:
- Auto-modifies the Nginx server block to add `listen 443 ssl`, certificate paths, and HTTP->HTTPS redirect
- Installs a systemd timer for auto-renewal (`certbot.timer`)
- Renewal timer is included by default on Ubuntu/Debian when installed via `apt`

**Prerequisite:** DNS A record for `api.saiyantracker.com` must point to VPS IP before running certbot.

### 4. SQLite WAL Mode

**Current code in `session.py`:**
```python
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()
```

**Add WAL pragma** in the same event handler:
```python
cursor.execute("PRAGMA journal_mode=WAL")
```

WAL mode persists in the database file once set, but setting it on every connection is harmless and ensures it's always active.

**File permissions:** The `saiyan` user must own the `.db`, `.db-shm`, and `.db-wal` files AND the directory containing them (SQLite needs write access to the directory for creating temp files).

### 5. Environment File

**File:** `/etc/saiyan-tracker.env`
```
DATABASE_URL=sqlite:////home/user/saiyan-tracker/backend/saiyan_tracker.db
CORS_ORIGINS=https://saiyan-tracker-2-gsd.vercel.app
```

Note: four slashes for absolute SQLite path (`sqlite:///` prefix + `/home/...`).

**Permissions:** `chmod 640 /etc/saiyan-tracker.env`, owned by `root:saiyan`.

pydantic-settings `SettingsConfigDict(env_file=".env")` loads `.env` for local dev. In production, systemd's `EnvironmentFile` sets the env vars directly — pydantic-settings reads them from environment, `.env` file is not needed on VPS.

### 6. Deploy Script

**File:** `/home/user/saiyan-tracker/deploy.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail
cd /home/user/saiyan-tracker

# Backup database
cp backend/saiyan_tracker.db backend/saiyan_tracker.db.bak 2>/dev/null || true

# Pull latest
git pull origin main

# Install dependencies
source venv/bin/activate
pip install -r backend/requirements.txt

# Fix DB ownership
sudo chown saiyan:saiyan backend/saiyan_tracker.db backend/saiyan_tracker.db-shm backend/saiyan_tracker.db-wal 2>/dev/null || true

# Restart service
sudo systemctl restart saiyan-tracker
echo "Deploy complete. Checking status..."
sudo systemctl status saiyan-tracker --no-pager
```

### 7. System User Setup

```bash
sudo useradd --system --no-create-home --shell /usr/sbin/nologin saiyan
sudo usermod -aG saiyan www-data  # Nginx worker can access socket
```

## Validation Architecture

### Test Matrix

| Test | Validates | Method |
|------|-----------|--------|
| Service starts after reboot | DEPLOY-08 | `sudo reboot` then `curl https://api.saiyantracker.com/health` |
| Service restarts after crash | DEPLOY-08 | `sudo systemctl kill saiyan-tracker` then wait 5s and check |
| HTTPS responds | DEPLOY-10 | `curl -I https://api.saiyantracker.com/health` — status 200 |
| No mixed content | DEPLOY-09/10 | Browser console on Vercel frontend — no warnings |
| WAL mode active | DEPLOY-11 | `sqlite3 backend/saiyan_tracker.db "PRAGMA journal_mode"` — returns `wal` |
| Env file not world-readable | DEPLOY-12 | `ls -la /etc/saiyan-tracker.env` — no world read bit |
| DB persists across restarts | DEPLOY-11 | Create a task, restart service, verify task exists |

### Smoke Test Script

```bash
#!/usr/bin/env bash
echo "=== Saiyan Tracker VPS Smoke Test ==="
echo "1. Service status:"
systemctl is-active saiyan-tracker
echo "2. HTTPS health check:"
curl -s https://api.saiyantracker.com/health
echo ""
echo "3. WAL mode:"
sqlite3 /home/user/saiyan-tracker/backend/saiyan_tracker.db "PRAGMA journal_mode;"
echo "4. Env file permissions:"
ls -la /etc/saiyan-tracker.env
echo "5. Socket exists:"
ls -la /run/saiyan-tracker.sock
echo "=== Done ==="
```

## Plan Decomposition

**Wave 1 (parallel):**
- Plan 24-01: WAL mode code change (only code modification in repo)
- Plan 24-02: VPS config files (systemd, nginx, env file, deploy script — all created on VPS or as reference docs)

Wave 1 has no dependencies between plans. Plan 01 is a tiny code change. Plan 02 is all infrastructure config that gets applied on the VPS.

## RESEARCH COMPLETE
