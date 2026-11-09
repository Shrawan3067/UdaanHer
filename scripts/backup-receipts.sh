#!/usr/bin/env bash
# ==============================================================================
# UdaanHer 80G Tax Receipts & Storage Backup Utility for AWS EC2
# Giving women wings to fly
#
# Usage:
#   ./scripts/backup-receipts.sh [OPTIONAL_S3_BUCKET_NAME]
# ==============================================================================

set -euo pipefail

BACKUP_DIR="/home/ubuntu/udaanher-backups"
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
ARCHIVE_NAME="udaanher_receipts_${TIMESTAMP}.tar.gz"
S3_BUCKET="${1:-}"

mkdir -p "${BACKUP_DIR}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

SOURCE_DIR=""
if [ -d "/var/lib/docker/volumes/udaanher_receipts/_data" ]; then
  SOURCE_DIR="/var/lib/docker/volumes/udaanher_receipts/_data"
elif [ -d "${ROOT_DIR}/server/storage/receipts" ]; then
  SOURCE_DIR="${ROOT_DIR}/server/storage/receipts"
fi

if [ -z "$SOURCE_DIR" ] || [ ! -d "$SOURCE_DIR" ]; then
  echo "⚠️ Receipt storage directory not found or empty. Creating archive of storage root..."
  mkdir -p "${ROOT_DIR}/server/storage/receipts"
  SOURCE_DIR="${ROOT_DIR}/server/storage/receipts"
fi

echo "📦 Creating archive of receipt storage from: ${SOURCE_DIR}"
tar -czf "${BACKUP_DIR}/${ARCHIVE_NAME}" -C "${SOURCE_DIR}" .

echo "✔ Backup created at: ${BACKUP_DIR}/${ARCHIVE_NAME} ($(du -h "${BACKUP_DIR}/${ARCHIVE_NAME}" | cut -f1))"

# If S3 bucket argument is provided, upload to AWS S3
if [ -n "$S3_BUCKET" ]; then
  if command -v aws &> /dev/null; then
    echo "☁️ Uploading backup to AWS S3: s3://${S3_BUCKET}/receipts/${ARCHIVE_NAME}"
    aws s3 cp "${BACKUP_DIR}/${ARCHIVE_NAME}" "s3://${S3_BUCKET}/receipts/${ARCHIVE_NAME}"
    echo "✔ Successfully uploaded to S3."
  else
    echo "⚠️ AWS CLI not found. Skipping S3 upload. Install via: sudo apt-get install -y awscli"
  fi
fi

# Prune archives older than 7 days
find "${BACKUP_DIR}" -name "udaanher_receipts_*.tar.gz" -mtime +7 -delete
echo "🧹 Cleaned local backups older than 7 days."

