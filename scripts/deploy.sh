#!/usr/bin/env bash
# ==============================================================================
# UdaanHer AWS EC2 Unified Automated Deployment Script
# Giving women wings to fly
#
# Supports both:
#   1. Containerized deployment via Docker & Docker Compose (--docker)
#   2. Native host deployment via PM2 & Host Nginx (--native)
#
# Usage:
#   ./scripts/deploy.sh [OPTIONS]
#
# Options:
#   --docker       Deploy via Docker Compose (Default)
#   --native       Deploy via Node.js + PM2 + Host Nginx
#   --seed         Run MongoDB database seeding script
#   --pull         Fetch latest changes from git before deploying
#   --help         Show this help message
# ==============================================================================

set -euo pipefail

# Text styling
BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
CYAN="\033[0;36m"
RED="\033[0;31m"
NC="\033[0m"

MODE="docker"
DO_SEED=false
DO_PULL=false

# Parse command line flags
while [[ $# -gt 0 ]]; do
  case $1 in
    --docker)
      MODE="docker"
      shift
      ;;
    --native)
      MODE="native"
      shift
      ;;
    --seed)
      DO_SEED=true
      shift
      ;;
    --pull)
      DO_PULL=true
      shift
      ;;
    -h|--help)
      echo "Usage: ./scripts/deploy.sh [OPTIONS]"
      echo "Options:"
      echo "  --docker       Deploy via Docker Compose (Default)"
      echo "  --native       Deploy via PM2 + Host Nginx"
      echo "  --seed         Seed the MongoDB Atlas database"
      echo "  --pull         Pull latest git commits before building"
      echo "  --help         Show this help message"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      echo "Use --help for available options."
      exit 1
      ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${ROOT_DIR}"

echo -e "${CYAN}${BOLD}"
echo "================================================================="
echo "  🚀 UdaanHer: Deploying Application on AWS EC2                 "
echo "     Mode: ${MODE^^} | Seed: ${DO_SEED} | Pull: ${DO_PULL}       "
echo "================================================================="
echo -e "${NC}"

# ------------------------------------------------------------------------------
# 1. Environment Verification
# ------------------------------------------------------------------------------
echo -e "${YELLOW}[1/5] Checking environment configuration...${NC}"
if [[ ! -f "server/.env" ]]; then
  if [[ -f ".env" ]]; then
    echo "Copying root .env to server/.env..."
    cp .env server/.env
  elif [[ -f ".env.production.example" ]]; then
    echo -e "${RED}❌ server/.env not found!${NC}"
    echo "Creating server/.env from .env.production.example..."
    cp .env.production.example server/.env
    echo -e "${YELLOW}⚠️ Please edit server/.env with your MongoDB Atlas connection string and run again:${NC}"
    echo "   nano server/.env"
    exit 1
  else
    echo -e "${RED}❌ Missing server/.env file. Please create it before deploying.${NC}"
    exit 1
  fi
fi

# Verify DATABASE_URL is present
if ! grep -q "DATABASE_URL" server/.env; then
  echo -e "${RED}❌ DATABASE_URL is missing in server/.env! Please configure your MongoDB Atlas URI.${NC}"
  exit 1
fi
echo -e "${GREEN}✔ Environment file verified.${NC}"

# ------------------------------------------------------------------------------
# 2. Git Pull (Optional)
# ------------------------------------------------------------------------------
if [ "$DO_PULL" = true ]; then
  echo -e "\n${YELLOW}[2/5] Fetching latest git changes...${NC}"
  if git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    git pull origin main || git pull
    echo -e "${GREEN}✔ Latest git changes pulled.${NC}"
  else
    echo -e "${YELLOW}⚠️ Not a git repository. Skipping git pull.${NC}"
  fi
else
  echo -e "\n${YELLOW}[2/5] Skipping git pull (use --pull to fetch latest code).${NC}"
fi

# ------------------------------------------------------------------------------
# 3. Execution based on selected MODE
# ------------------------------------------------------------------------------
if [ "$MODE" = "docker" ]; then
  echo -e "\n${YELLOW}[3/5] Building and launching Docker Compose containers...${NC}"

  # Ensure docker is accessible
  if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Run sudo ./scripts/ec2-setup.sh first.${NC}"
    exit 1
  fi

  # Determine compose command
  COMPOSE_CMD="docker compose"
  if ! docker compose version &> /dev/null; then
    if command -v docker-compose &> /dev/null; then
      COMPOSE_CMD="docker-compose"
    else
      echo -e "${RED}❌ Neither 'docker compose' nor 'docker-compose' found.${NC}"
      exit 1
    fi
  fi

  # Build and start services
  $COMPOSE_CMD down --remove-orphans || true
  $COMPOSE_CMD up -d --build

  echo -e "${GREEN}✔ Containers launched successfully.${NC}"

  # ----------------------------------------------------------------------------
  # 4. Database Seeding (if requested)
  # ----------------------------------------------------------------------------
  if [ "$DO_SEED" = true ]; then
    echo -e "\n${YELLOW}[4/5] Seeding MongoDB Atlas database inside container...${NC}"
    sleep 5
    $COMPOSE_CMD exec -T backend node dist/scripts/seed.js || \
      $COMPOSE_CMD run --rm backend node dist/scripts/seed.js
    echo -e "${GREEN}✔ Database seeded with production-ready welfare schemes and demonstration accounts.${NC}"
  else
    echo -e "\n${YELLOW}[4/5] Skipping database seeding (use --seed to initialize database).${NC}"
  fi

elif [ "$MODE" = "native" ]; then
  echo -e "\n${YELLOW}[3/5] Building application natively for Host Nginx + PM2...${NC}"

  # Check Node.js and PM2
  if ! command -v node &> /dev/null || ! command -v pm2 &> /dev/null; then
    echo -e "${RED}❌ Node.js or PM2 not found. Run sudo ./scripts/ec2-setup.sh first.${NC}"
    exit 1
  fi

  # Install root dependencies
  npm install

  # Build server and client
  npm run build

  # Configure Host Nginx
  NGINX_AVAILABLE="/etc/nginx/sites-available"
  NGINX_ENABLED="/etc/nginx/sites-enabled"
  if [ -d "$NGINX_AVAILABLE" ] && [ -d "$NGINX_ENABLED" ]; then
    echo "Updating Host Nginx virtual host configuration..."
    sudo cp nginx/udaanher.conf "${NGINX_AVAILABLE}/udaanher"
    sudo ln -sf "${NGINX_AVAILABLE}/udaanher" "${NGINX_ENABLED}/udaanher"
    sudo rm -f "${NGINX_ENABLED}/default" || true
    
    # Copy or link client dist to /var/www/udaanher/client/dist
    sudo mkdir -p /var/www/udaanher/client
    sudo rm -rf /var/www/udaanher/client/dist
    sudo cp -r client/dist /var/www/udaanher/client/dist
    sudo chown -R www-data:www-data /var/www/udaanher || true

    # Test and reload Nginx
    sudo nginx -t && sudo systemctl reload nginx
    echo -e "${GREEN}✔ Nginx reloaded.${NC}"
  fi

  # Start or reload backend with PM2
  echo "Managing backend process with PM2..."
  pm2 reload ecosystem.config.cjs --update-env || pm2 start ecosystem.config.cjs
  pm2 save
  echo -e "${GREEN}✔ PM2 process active.${NC}"

  # ----------------------------------------------------------------------------
  # 4. Database Seeding (if requested)
  # ----------------------------------------------------------------------------
  if [ "$DO_SEED" = true ]; then
    echo -e "\n${YELLOW}[4/5] Seeding MongoDB Atlas database natively...${NC}"
    npm run seed:prod
    echo -e "${GREEN}✔ Database seeded with production-ready welfare schemes and demonstration accounts.${NC}"
  else
    echo -e "\n${YELLOW}[4/5] Skipping database seeding (use --seed to initialize database).${NC}"
  fi
fi

# ------------------------------------------------------------------------------
# 5. Health Check Verification
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}[5/5] Performing deployment health check verification...${NC}"
MAX_RETRIES=15
WAIT_SECONDS=2
SUCCESS=false

for ((i=1; i<=MAX_RETRIES; i++)); do
  echo "Health check attempt $i of $MAX_RETRIES..."
  if curl -sf http://127.0.0.1:5001/health > /dev/null 2>&1 || curl -sf http://localhost/health > /dev/null 2>&1; then
    SUCCESS=true
    break
  fi
  sleep "$WAIT_SECONDS"
done

if [ "$SUCCESS" = true ]; then
  # Detect public IP if running on AWS EC2
  PUBLIC_IP=$(curl -sf -m 2 http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || curl -sf -m 2 https://api.ipify.org 2>/dev/null || echo "your-server-ip")
  
  echo -e "\n${GREEN}${BOLD}================================================================="
  echo "  ✅ UdaanHer Successfully Deployed and Running on AWS EC2!      "
  echo "=================================================================${NC}"
  echo -e "Access points:"
  echo -e "  🌐 Web Application: ${CYAN}http://${PUBLIC_IP}/${NC}"
  echo -e "  🩺 Health Check:    ${CYAN}http://${PUBLIC_IP}/health${NC}"
  echo -e "  📡 API Root:        ${CYAN}http://${PUBLIC_IP}/api/v1${NC}"
  echo -e "=================================================================\n"
else
  echo -e "\n${RED}⚠️ Health check did not return HTTP 200 within timeout.${NC}"
  if [ "$MODE" = "docker" ]; then
    echo "Check container logs via: docker compose logs backend"
  else
    echo "Check PM2 logs via: pm2 logs udaanher-backend"
  fi
  exit 1
fi

