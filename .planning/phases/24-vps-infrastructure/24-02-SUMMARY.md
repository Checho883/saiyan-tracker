---
phase: 24-vps-infrastructure
plan: 02
status: complete
started: 2026-03-12
completed: 2026-03-12
---

# Plan 24-02 Summary: VPS Deployment Config Files

## What was built
Complete set of VPS deployment configuration files in a `deploy/` directory. Includes systemd service unit, Nginx reverse proxy config, environment file template, automated deploy script, smoke test, and step-by-step setup guide.

## Tasks completed

| # | Task | Status |
|---|------|--------|
| 1 | Create systemd, Nginx, and env config files | Complete |
| 2 | Create deploy script, smoke test, and SETUP.md | Complete |
| 3 | VPS setup checkpoint (human-action) | Deferred to user |

## Key files

### Created
- `deploy/saiyan-tracker.service` -- systemd unit: uvicorn via Unix socket, restart-on-failure, EnvironmentFile
- `deploy/saiyan-tracker.nginx` -- Nginx reverse proxy: api.saiyantracker.com to Unix socket
- `deploy/saiyan-tracker.env.example` -- Template with DATABASE_URL and CORS_ORIGINS
- `deploy/deploy.sh` -- Automated: backup DB, git pull, pip install, chown, restart
- `deploy/smoke-test.sh` -- 5-check verification: service, HTTPS, WAL, env perms, socket
- `deploy/SETUP.md` -- 10-step guide from fresh VPS to working HTTPS service

## Verification
- Both shell scripts pass `bash -n` syntax check
- Socket path `/run/saiyan-tracker/saiyan-tracker.sock` consistent across all 3 config files
- systemd RuntimeDirectory creates socket directory with correct ownership
- UMask=0117 ensures socket permissions allow group access (www-data in saiyan group)

## Requirements addressed
- DEPLOY-08: systemd auto-start + restart-on-failure
- DEPLOY-09: Nginx reverse proxy to Unix socket
- DEPLOY-10: Certbot TLS (documented in SETUP.md step 8)
- DEPLOY-12: Environment file at /etc/saiyan-tracker.env

## Notes
- VPS setup (Task 3 checkpoint) is deferred -- user must SSH to VPS and follow SETUP.md
- Certbot step is manual (requires DNS to be pointed and interactive prompts)
- Socket path was adjusted from CONTEXT.md's `/run/saiyan-tracker.sock` to `/run/saiyan-tracker/saiyan-tracker.sock` to leverage systemd's RuntimeDirectory for automatic directory creation

## Self-Check: PASSED
- All 6 deploy files created and committed
- Internal consistency verified (socket paths match)
- Shell scripts syntax-valid
