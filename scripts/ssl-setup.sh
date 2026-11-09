#!/usr/bin/env bash
# ==============================================================================
# UdaanHer AWS EC2 SSL Certificate Automation Script (Let's Encrypt / Certbot)
# Giving women wings to fly
#
# Usage:
#   sudo ./scripts/ssl-setup.sh <DOMAIN_NAME> <ADMIN_EMAIL>
#
# Example:
#   sudo ./scripts/ssl-setup.sh udaanher.org admin@udaanher.org
# ==============================================================================

set -euo pipefail

# Text styling
BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
CYAN="\033[0;36m"
RED="\033[0;31m"
NC="\033[0m"

if [[ $# -lt 2 ]]; then
  echo -e "${RED}Error: Missing required arguments.${NC}"
  echo "Usage: sudo ./scripts/ssl-setup.sh <DOMAIN_NAME> <ADMIN_EMAIL>"
  echo "Example: sudo ./scripts/ssl-setup.sh udaanher.org admin@udaanher.org"
  exit 1
fi

DOMAIN="$1"
EMAIL="$2"

if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ This script must be run with sudo or as root.${NC}"
   exit 1
fi

echo -e "${CYAN}${BOLD}"
echo "================================================================="
echo "  🔒 Setting up Let's Encrypt SSL for ${DOMAIN}                   "
echo "================================================================="
echo -e "${NC}"

# Check certbot is installed
if ! command -v certbot &> /dev/null; then
  echo "Installing certbot and python3-certbot-nginx..."
  if command -v apt-get &> /dev/null; then
    apt-get update -y && apt-get install -y certbot python3-certbot-nginx
  elif command -v dnf &> /dev/null; then
    dnf install -y certbot python3-certbot-nginx
  fi
fi

# Request certificate
echo -e "\n${YELLOW}Requesting SSL Certificate from Let's Encrypt...${NC}"
certbot --nginx \
  --non-interactive \
  --agree-tos \
  --redirect \
  -m "${EMAIL}" \
  -d "${DOMAIN}"

echo -e "\n${GREEN}✔ SSL Certificate successfully generated and configured in Nginx!${NC}"

# Test certificate renewal
echo -e "\n${YELLOW}Testing automatic certificate renewal...${NC}"
certbot renew --dry-run

echo -e "\n${GREEN}${BOLD}================================================================="
echo "  🎉 HTTPS is now active on https://${DOMAIN}                    "
echo "=================================================================${NC}"

