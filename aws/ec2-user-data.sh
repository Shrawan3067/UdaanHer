#!/usr/bin/env bash
# ==============================================================================
# AWS EC2 Cloud-Init User Data Script for UdaanHer
# Giving women wings to fly
#
# Paste this script into the "User Data" field (under Advanced Details)
# when launching an Ubuntu 22.04 LTS or 24.04 LTS EC2 Instance in AWS Console.
# ==============================================================================

set -euo pipefail
exec > >(tee /var/log/udaanher-bootstrap.log | logger -t udaanher-init -s 2>/dev/console) 2>&1

echo "================================================================="
echo "  🚀 Starting UdaanHer Automated EC2 Bootstrap                  "
echo "================================================================="

export DEBIAN_FRONTEND=noninteractive

# 1. Configure 2GB Swap Memory (ensures build stability on t2/t3.micro)
if ! free | awk '/^Swap:/ {exit !$2}'; then
    fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# 2. Update System Packages
apt-get update -y
apt-get install -y curl wget git build-essential ufw software-properties-common ca-certificates gnupg

# 3. Install Node.js 20 LTS & PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
npm install -g pm2

# 4. Install Docker & Docker Compose Plugin
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor --yes -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

systemctl enable --now docker
usermod -aG docker ubuntu || true

# 5. Install Nginx & Certbot
apt-get install -y nginx certbot python3-certbot-nginx
systemctl enable --now nginx

# 6. Configure UFW Firewall
ufw allow OpenSSH || ufw allow 22/tcp
ufw allow 'Nginx Full' || (ufw allow 80/tcp && ufw allow 443/tcp)
echo "y" | ufw enable || true

# 7. Create App Directory
mkdir -p /home/ubuntu/udaanher
chown -R ubuntu:ubuntu /home/ubuntu/udaanher

echo "================================================================="
echo "  ✅ UdaanHer EC2 Bootstrap Complete! Logged to /var/log/udaanher-bootstrap.log"
echo "================================================================="

