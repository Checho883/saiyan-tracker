# Saiyan Tracker VPS Setup Guide

Step-by-step guide for deploying the FastAPI backend on a Hostinger VPS (Ubuntu/Debian).

## Prerequisites

- SSH access to VPS
- DNS A record: `api.saiyantracker.com` pointing to VPS IP
- Git repo URL for saiyan-tracker

## 1. Install System Packages

```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx python3-venv python3-pip sqlite3 git
```

## 2. Create Service User

```bash
sudo useradd --system --no-create-home --shell /usr/sbin/nologin saiyan
sudo usermod -aG saiyan www-data
```

The `saiyan` user runs the backend service. Adding `www-data` to the `saiyan` group lets Nginx access the Unix socket.

## 3. Clone Repo and Set Up Python

```bash
cd /home/user
git clone <YOUR_REPO_URL> saiyan-tracker
cd saiyan-tracker
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
```

## 4. Create Environment File

```bash
sudo cp deploy/saiyan-tracker.env.example /etc/saiyan-tracker.env
sudo nano /etc/saiyan-tracker.env
```

Edit the values:
- `DATABASE_URL` -- set the absolute path to your SQLite database
- `CORS_ORIGINS` -- set your Vercel frontend URL (e.g., `https://saiyan-tracker-2-gsd.vercel.app`)

Lock down permissions:
```bash
sudo chmod 640 /etc/saiyan-tracker.env
sudo chown root:saiyan /etc/saiyan-tracker.env
```

## 5. Set Up Database Ownership

```bash
sudo chown saiyan:saiyan /home/user/saiyan-tracker/backend/saiyan_tracker.db 2>/dev/null || true
sudo chown saiyan:saiyan /home/user/saiyan-tracker/backend/
```

The `saiyan` user needs write access to the backend directory for SQLite WAL files (`.db-shm`, `.db-wal`).

## 6. Install systemd Service

```bash
sudo cp deploy/saiyan-tracker.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable saiyan-tracker
sudo systemctl start saiyan-tracker
```

Verify it started:
```bash
sudo systemctl status saiyan-tracker
```

## 7. Configure Nginx

```bash
sudo cp deploy/saiyan-tracker.nginx /etc/nginx/sites-available/saiyan-tracker
sudo ln -sf /etc/nginx/sites-available/saiyan-tracker /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

Test HTTP (before TLS):
```bash
curl -s http://api.saiyantracker.com/health
```

## 8. Enable HTTPS with Certbot

```bash
sudo certbot --nginx -d api.saiyantracker.com
```

Follow the prompts. Certbot will:
- Obtain a Let's Encrypt certificate
- Auto-modify the Nginx config to add SSL
- Set up auto-renewal via systemd timer

Verify HTTPS:
```bash
curl -s https://api.saiyantracker.com/health
```

## 9. Run Smoke Test

```bash
chmod +x deploy/smoke-test.sh
./deploy/smoke-test.sh
```

All 5 checks should pass.

## 10. Test Reboot Persistence

```bash
sudo reboot
```

After VPS comes back online:
```bash
curl -s https://api.saiyantracker.com/health
```

Should return `{"status":"ok"}` without manual intervention.

---

## Future Deploys

```bash
cd /home/user/saiyan-tracker
chmod +x deploy/deploy.sh
./deploy/deploy.sh
```

The deploy script handles: database backup, git pull, pip install, DB ownership fix, service restart, and health check.

## Troubleshooting

| Problem | Command |
|---------|---------|
| Service won't start | `sudo journalctl -u saiyan-tracker -n 30` |
| Socket not created | Check `RuntimeDirectory=saiyan-tracker` in service file |
| Nginx 502 | Verify socket exists: `ls -la /run/saiyan-tracker/` |
| Permission denied on socket | Verify: `groups www-data` includes `saiyan` |
| Certbot fails | Verify DNS: `dig api.saiyantracker.com` |
| DB locked | Verify WAL: `sqlite3 backend/saiyan_tracker.db "PRAGMA journal_mode;"` |
