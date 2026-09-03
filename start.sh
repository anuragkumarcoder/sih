#!/usr/bin/env bash
set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "================================================================="
echo "  AI-Based Smart Logistics & Accessibility Platform (SIH26002)   "
echo "  North Eastern Region Logistics Intelligence & Terrain Engine   "
echo "================================================================="

# 1. Start FastAPI AI Microservice in background
echo "[1/3] Starting FastAPI AI Microservice (Port 8000)..."
cd "$PROJECT_DIR/ai-service"
if [ ! -d "venv" ]; then
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 &
AI_PID=$!
echo "✓ AI Service running (PID: $AI_PID, http://localhost:8000/docs)"

# 2. Start Frontend Dev Server
echo "[2/3] Starting React + Vite + Leaflet GIS Frontend (Port 3000)..."
cd "$PROJECT_DIR/frontend"
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi
npm run dev -- --port 3000 &
FRONTEND_PID=$!
echo "✓ Frontend running (PID: $FRONTEND_PID, http://localhost:3000)"

echo ""
echo "================================================================="
echo "  All Local Services Active!                                    "
echo "  - Frontend GIS Map:      http://localhost:3000                "
echo "  - AI Routing Swagger:    http://localhost:8000/docs           "
echo "  - Backend Gateway (when Docker/Java active): http://localhost:8080/swagger-ui.html "
echo "================================================================="
echo "To run full hybrid stack with MySQL 8 & MongoDB 7, use:"
echo "  docker compose up --build"
echo "================================================================="

# Trap exit signals to clean up background processes
trap "kill $AI_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM EXIT
wait
