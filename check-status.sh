#!/bin/bash

# LexNotar Status Check Script
# Quick status check for all services

echo "🔍 LexNotar - Service Status Check"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check PostgreSQL
echo -n "📊 PostgreSQL Database: "
if docker ps | grep -q lexnotar-postgres; then
    echo -e "${GREEN}✅ RUNNING${NC}"
else
    echo -e "${RED}❌ STOPPED${NC}"
    echo "   Start with: docker start lexnotar-postgres"
fi

# Check Backend
echo -n "🔧 Backend API (port 3000): "
if curl -s http://localhost:3000/api/v1/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ RUNNING${NC}"
    HEALTH=$(curl -s http://localhost:3000/api/v1/health | jq -r '.status' 2>/dev/null)
    if [ "$HEALTH" = "ok" ]; then
        echo "   Health: ${GREEN}OK${NC}"
    fi
else
    echo -e "${RED}❌ NOT RESPONDING${NC}"
    echo "   Start with: cd backend && npm run start:dev"
fi

# Check Frontend
echo -n "🎨 Frontend (port 5173): "
if curl -s -I http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ RUNNING${NC}"
else
    echo -e "${RED}❌ NOT RESPONDING${NC}"
    echo "   Start with: cd frontend && npm run dev"
fi

echo ""
echo "===================================="

# Process check
echo "📋 Running Processes:"
BACKEND_PID=$(pgrep -f "nest start" | head -1)
FRONTEND_PID=$(pgrep -f "vite" | head -1)

if [ -n "$BACKEND_PID" ]; then
    echo -e "   Backend:  ${GREEN}PID $BACKEND_PID${NC}"
else
    echo -e "   Backend:  ${RED}Not running${NC}"
fi

if [ -n "$FRONTEND_PID" ]; then
    echo -e "   Frontend: ${GREEN}PID $FRONTEND_PID${NC}"
else
    echo -e "   Frontend: ${RED}Not running${NC}"
fi

echo ""
echo "🌐 Access URLs:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3000/api/v1"
echo "   API Docs: http://localhost:3000/api/v1/health"
echo ""
echo "📚 Documentation:"
echo "   Developer Guide: README-DEV.md"
echo "   Deployment:      DEPLOYMENT.md"
echo "   Testing Guide:   TEST_GUIDE.md"
echo ""
