#!/usr/bin/env bash
# ==============================================================================
# UdaanHer Automated Healthcheck & Watchdog Script for AWS EC2
# Giving women wings to fly
#
# Can be run via crontab every 5 minutes:
#   */5 * * * * /home/ubuntu/udaanher/scripts/healthcheck-monitor.sh >> /var/log/udaanher-watchdog.log 2>&1
# ==============================================================================

set -euo pipefail

HEALTH_URL="http://127.0.0.1:5001/health"
ALT_HEALTH_URL="http://localhost/health"
MAX_ATTEMPTS=3
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

check_health() {
  if curl -sf -m 5 "${HEALTH_URL}" > /dev/null 2>&1; then
    return 0
  elif curl -sf -m 5 "${ALT_HEALTH_URL}" > /dev/null 2>&1; then
    return 0
  fi
  return 1
}

if check_health; then
  # Healthy - silent return to avoid cluttering cron logs
  exit 0
fi

echo "[${TIMESTAMP}] ⚠️ Health check probe failed. Retrying..."

FAILED=true
for ((i=1; i<=MAX_ATTEMPTS; i++)); do
  sleep 3
  if check_health; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✔ Recovered on attempt ${i}."
    FAILED=false
    break
  fi
done

if [ "$FAILED" = true ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ Service unhealthy after ${MAX_ATTEMPTS} attempts. Triggering automated recovery..."

  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
  cd "${ROOT_DIR}"

  # 1. Attempt Docker Compose recovery if running
  if command -v docker &> /dev/null && docker compose ps --services --filter "status=running" 2>/dev/null | grep -q "backend"; then
    echo "Restarting backend container..."
    docker compose restart backend
  # 2. Attempt PM2 recovery if running
  elif command -v pm2 &> /dev/null && pm2 list | grep -q "udaanher-backend"; then
    echo "Restarting PM2 backend process..."
    pm2 restart udaanher-backend
  # 3. Fallback: restart systemd / nginx
  elif systemctl is-active --quiet nginx; then
    echo "Reloading Nginx web server..."
    sudo systemctl reload nginx || true
  fi

  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Automated recovery action completed."
fi

