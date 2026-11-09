#!/usr/bin/env bash
# ==============================================================================
# UdaanHer AWS EC2 Instance Bootstrap & Environment Setup Script
# Giving women wings to fly
#
# Supported OS: Ubuntu 22.04 LTS / 24.04 LTS, Amazon Linux 2023
#
# Usage:
#   chmod +x scripts/ec2-setup.sh
#   sudo ./scripts/ec2-setup.sh
# ==============================================================================

set -euo pipefail

# Text styling
BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
CYAN="\033[0;36m"
RED="\033[0;31m"
NC="\033[0m"

echo -e "${CYAN}${BOLD}"
echo "================================================================="
echo "  🚀 UdaanHer: AWS EC2 Instance Provisioning & Environment Setup "
echo "     Giving women wings to fly                                   "
echo "================================================================="
echo -e "${NC}"

# Check for root / sudo
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ This script must be run with sudo or as root.${NC}"
   echo "   Example: sudo ./scripts/ec2-setup.sh"
   exit 1
fi

REAL_USER="${SUDO_USER:-$USER}"
echo -e "${GREEN}✔ Detected deployment user: ${BOLD}${REAL_USER}${NC}"

# ------------------------------------------------------------------------------
# 1. 2GB Swap Memory Configuration (Crucial for t2.micro / t3.micro 1GB RAM)
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}[1/7] Configuring Swap Memory (2GB)...${NC}"
if free | awk '/^Swap:/ {exit !$2}'; then
    echo -e "${GREEN}✔ Swap memory already active ($(free -h | awk '/^Swap:/ {print $2}')). Skipping.${NC}"
else
    echo "Creating 2GB swapfile to prevent OOM errors during build on EC2..."
    fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    if ! grep -q '/swapfile' /etc/fstab; then
        echo '/swapfile none swap sw 0 0' >> /etc/fstab
    fi
    echo -e "${GREEN}✔ 2GB Swap successfully created and enabled.${NC}"
fi

# ------------------------------------------------------------------------------
# 2. System Packages & Base Utilities
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}[2/7] Updating system packages & installing core utilities...${NC}"
if command -v apt-get &> /dev/null; then
    export DEBIAN_FRONTEND=noninteractive
    apt-get update -y
    apt-get install -y curl wget git build-essential ufw software-properties-common ca-certificates gnupg
elif command -v dnf &> /dev/null; then
    dnf update -y
    dnf install -y curl wget git make gcc gcc-c++ tar
fi

# ------------------------------------------------------------------------------
# 3. Node.js v20 LTS & PM2 Installation
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}[3/7] Installing Node.js v20 LTS & PM2...${NC}"
if ! command -v node &> /dev/null || [[ $(node -v | cut -d'.' -f1 | tr -d 'v') -lt 20 ]]; then
    if command -v apt-get &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs
    elif command -v dnf &> /dev/null; then
        dnf module install -y nodejs:20/common || dnf install -y nodejs
    fi
fi
echo -e "${GREEN}✔ Node.js installed: $(node -v)${NC}"
echo -e "${GREEN}✔ npm installed: $(npm -v)${NC}"

# Install PM2 Process Manager globally
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi
echo -e "${GREEN}✔ PM2 installed: $(pm2 -v)${NC}"

# ------------------------------------------------------------------------------
# 4. Nginx Web Server Installation
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}[4/7] Installing & Enabling Nginx...${NC}"
if command -v apt-get &> /dev/null; then
    apt-get install -y nginx certbot python3-certbot-nginx
elif command -v dnf &> /dev/null; then
    dnf install -y nginx certbot python3-certbot-nginx || true
fi
systemctl enable nginx
systemctl start nginx || true
echo -e "${GREEN}✔ Nginx web server active.${NC}"

# ------------------------------------------------------------------------------
# 5. Docker & Docker Compose Installation
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}[5/7] Installing Docker & Docker Compose...${NC}"
if ! command -v docker &> /dev/null; then
    if command -v apt-get &> /dev/null; then
        install -m 0755 -d /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor --yes -o /etc/apt/keyrings/docker.gpg
        chmod a+r /etc/apt/keyrings/docker.gpg
        echo \
          "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
          $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
          tee /etc/apt/sources.list.d/docker.list > /dev/null
        apt-get update -y
        apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    elif command -v dnf &> /dev/null; then
        dnf install -y docker
        systemctl enable --now docker
        # Install compose plugin
        mkdir -p /usr/local/lib/docker/cli-plugins
        curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m) -o /usr/local/lib/docker/cli-plugins/docker-compose
        chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
    fi
fi

# Ensure docker daemon is enabled and running
systemctl enable docker || true
systemctl start docker || true

# Add deployment user to docker group to run docker without sudo
usermod -aG docker "${REAL_USER}" || true
echo -e "${GREEN}✔ Docker $(docker --version) configured.${NC}"

# ------------------------------------------------------------------------------
# 6. Firewall Configuration (UFW on Ubuntu)
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}[6/7] Configuring Host Firewall (SSH, HTTP, HTTPS)...${NC}"
if command -v ufw &> /dev/null; then
    ufw allow OpenSSH || ufw allow 22/tcp
    ufw allow 'Nginx Full' || (ufw allow 80/tcp && ufw allow 443/tcp)
    # Enable UFW non-interactively
    echo "y" | ufw enable || true
    echo -e "${GREEN}✔ UFW firewall rules updated (Ports 22, 80, 443 open).${NC}"
fi

# ------------------------------------------------------------------------------
# 7. Create App Directories & Set Permissions
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}[7/7] Preparing Application & SSL Directories...${NC}"
mkdir -p /var/www/certbot
mkdir -p certbot/conf certbot/www
mkdir -p server/storage/receipts server/logs

# Assign ownership to real user
if [[ -d "/var/www" ]]; then
    chown -R "${REAL_USER}:${REAL_USER}" /var/www || true
fi

echo -e "\n${GREEN}${BOLD}================================================================="
echo "  🎉 AWS EC2 Instance Setup Completed Successfully!             "
echo "=================================================================${NC}"
echo -e "Next steps:"
echo -e "  1. Configure your production environment:"
echo -e "     ${CYAN}cp .env.production.example server/.env${NC}"
echo -e "     ${CYAN}nano server/.env${NC}  # Enter your MongoDB Atlas URI, JWT_SECRET, etc."
echo -e "  2. Run the deployment script:"
echo -e "     ${CYAN}./scripts/deploy.sh --docker --seed${NC}   # For Docker deployment"
echo -e "     or"
echo -e "     ${CYAN}./scripts/deploy.sh --native --seed${NC}   # For PM2 + Nginx deployment"
echo -e "=================================================================\n"

