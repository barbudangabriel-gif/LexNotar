#!/bin/bash

# LexNotar Setup Script
# This script automates the setup process for LexNotar

set -e

echo "🚀 LexNotar Setup Script"
echo "========================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo -e "${RED}❌ Please do not run this script as root${NC}"
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version must be 18 or higher${NC}"
    echo "Current version: $(node -v)"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v) installed${NC}"

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ npm $(npm -v) installed${NC}"

if ! command_exists psql; then
    echo -e "${YELLOW}⚠ PostgreSQL client not found${NC}"
    echo "Please install PostgreSQL or ensure database is accessible"
fi

if command_exists docker; then
    echo -e "${GREEN}✓ Docker $(docker --version | cut -d' ' -f3) installed${NC}"
    DOCKER_AVAILABLE=true
else
    echo -e "${YELLOW}⚠ Docker not found (optional for development)${NC}"
    DOCKER_AVAILABLE=false
fi

echo ""
echo "🎯 Select setup mode:"
echo "1) Development setup (local PostgreSQL required)"
echo "2) Docker setup (recommended)"
echo "3) Exit"
echo ""
read -p "Enter choice [1-3]: " choice

case $choice in
    1)
        echo ""
        echo "📦 Starting development setup..."
        
        # Backend setup
        echo ""
        echo "🔧 Setting up backend..."
        cd backend
        
        if [ ! -f ".env" ]; then
            echo "Creating .env file..."
            cp .env.example .env
            echo -e "${YELLOW}⚠ Please edit backend/.env with your database credentials${NC}"
            read -p "Press Enter after editing .env..."
        fi
        
        echo "Installing backend dependencies..."
        npm install
        
        echo "Generating Prisma Client..."
        npx prisma generate
        
        echo ""
        read -p "Database name [lexnotar]: " DB_NAME
        DB_NAME=${DB_NAME:-lexnotar}
        
        read -p "Create database '$DB_NAME'? (y/n): " create_db
        if [ "$create_db" = "y" ]; then
            createdb $DB_NAME || echo -e "${YELLOW}Database may already exist${NC}"
        fi
        
        echo "Running database migrations..."
        npx prisma migrate dev
        
        read -p "Seed database with initial data? (y/n): " seed_db
        if [ "$seed_db" = "y" ]; then
            npx prisma db seed
        fi
        
        cd ..
        
        # Frontend setup
        echo ""
        echo "🎨 Setting up frontend..."
        cd frontend
        
        if [ ! -f ".env" ]; then
            echo "Creating .env file..."
            cp .env.example .env
        fi
        
        echo "Installing frontend dependencies..."
        npm install
        
        cd ..
        
        echo ""
        echo -e "${GREEN}✅ Development setup complete!${NC}"
        echo ""
        echo "To start the application:"
        echo ""
        echo "Terminal 1 (Backend):"
        echo "  cd backend && npm run start:dev"
        echo ""
        echo "Terminal 2 (Frontend):"
        echo "  cd frontend && npm run dev"
        echo ""
        echo "Access the application at: http://localhost:5173"
        echo "Default login: admin@lexnotar.ro / admin123"
        ;;
        
    2)
        if [ "$DOCKER_AVAILABLE" = false ]; then
            echo -e "${RED}❌ Docker is not installed${NC}"
            echo "Please install Docker and Docker Compose first"
            exit 1
        fi
        
        echo ""
        echo "🐳 Starting Docker setup..."
        
        if [ ! -f ".env" ]; then
            echo "Creating .env file..."
            cp .env.example .env
            echo -e "${YELLOW}⚠ Please edit .env with your configuration${NC}"
            read -p "Press Enter after editing .env..."
        fi
        
        echo "Building Docker images..."
        docker-compose build
        
        echo "Starting services..."
        docker-compose up -d
        
        echo "Waiting for database to be ready..."
        sleep 10
        
        echo "Running database migrations..."
        docker-compose exec backend npx prisma migrate deploy
        
        read -p "Seed database with initial data? (y/n): " seed_db
        if [ "$seed_db" = "y" ]; then
            docker-compose exec backend npx prisma db seed
        fi
        
        echo ""
        echo -e "${GREEN}✅ Docker setup complete!${NC}"
        echo ""
        echo "Services running:"
        docker-compose ps
        echo ""
        echo "Access the application at: http://localhost"
        echo "Backend API at: http://localhost:3000"
        echo ""
        echo "Useful commands:"
        echo "  docker-compose logs -f       # View logs"
        echo "  docker-compose down          # Stop services"
        echo "  docker-compose restart       # Restart services"
        ;;
        
    3)
        echo "Exiting..."
        exit 0
        ;;
        
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo "📚 Documentation:"
echo "  README-DEV.md    - Development guide"
echo "  DEPLOYMENT.md    - Deployment guide"
echo "  docs/            - Detailed documentation"
echo ""
echo -e "${GREEN}Happy coding! 🎉${NC}"
