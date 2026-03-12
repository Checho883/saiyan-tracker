#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="/home/user/saiyan-tracker"
BACKEND_DIR="${PROJECT_DIR}/backend"
DB_FILE="${BACKEND_DIR}/saiyan_tracker.db"

echo "=== Saiyan Tracker Deploy ==="

# Backup database
if [ -f "$DB_FILE" ]; then
    cp "$DB_FILE" "${DB_FILE}.bak"
    echo "Database backed up to ${DB_FILE}.bak"
fi

# Pull latest code
cd "$PROJECT_DIR"
git pull origin main
echo "Code updated"

# Install Python dependencies
source "${PROJECT_DIR}/venv/bin/activate"
pip install -r "${BACKEND_DIR}/requirements.txt" --quiet
echo "Dependencies installed"

# Fix DB file ownership (service runs as 'saiyan' user)
sudo chown saiyan:saiyan "$DB_FILE" "${DB_FILE}-shm" "${DB_FILE}-wal" 2>/dev/null || true
echo "DB ownership fixed"

# Restart service
sudo systemctl restart saiyan-tracker
echo "Service restarted"

# Quick health check
sleep 2
if curl -sf http://localhost/health > /dev/null 2>&1; then
    echo "Health check: OK"
else
    echo "Health check: FAILED — check 'sudo journalctl -u saiyan-tracker -n 20'"
fi

echo "=== Deploy complete ==="
