#!/bin/bash

# Laundry System - Development Startup Script
# This script starts all backend services and the frontend development server

echo "🚀 Starting Laundry System Development Environment..."
echo "================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${RED}Port $port is already in use${NC}"
        return 1
    else
        echo -e "${GREEN}Port $port is available${NC}"
        return 0
    fi
}

# Function to start a service
start_service() {
    local service_name=$1
    local service_path=$2
    local port=$3

    echo -e "${BLUE}Starting $service_name on port $port...${NC}"

    if check_port $port; then
        cd "$service_path"

        # Install dependencies if node_modules doesn't exist
        if [ ! -d "node_modules" ]; then
            echo -e "${YELLOW}Installing dependencies for $service_name...${NC}"
            npm install
        fi

        # Start the service in background
        npm start &
        local pid=$!
        echo "$pid" > "/tmp/laundry_${service_name,,}_pid"
        echo -e "${GREEN}$service_name started with PID $pid${NC}"

        # Wait a moment for service to start
        sleep 2
    else
        echo -e "${RED}Cannot start $service_name - port $port is occupied${NC}"
    fi
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm is not installed. Please install npm first.${NC}"
    exit 1
fi

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}Project root: $PROJECT_ROOT${NC}"

# Start backend services
echo -e "\n${YELLOW}Starting Backend Services...${NC}"
echo "================================"

start_service "API Gateway" "$PROJECT_ROOT/backend/api-gateway" 3000
start_service "Auth Service" "$PROJECT_ROOT/backend/auth-service" 3001
start_service "Laundry Service" "$PROJECT_ROOT/backend/laundry-service" 3002
start_service "Payment Service" "$PROJECT_ROOT/backend/payment-service" 3003
start_service "Notification Service" "$PROJECT_ROOT/backend/notification-service" 3004
start_service "Lost & Found Service" "$PROJECT_ROOT/backend/lostfound-service" 3005
start_service "Reporting Service" "$PROJECT_ROOT/backend/reporting-service" 3006

# Wait for services to fully start
echo -e "\n${YELLOW}Waiting for services to initialize...${NC}"
sleep 5

# Start frontend
echo -e "\n${YELLOW}Starting Frontend Application...${NC}"
echo "====================================="

cd "$PROJECT_ROOT/frontend/web"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install
fi

echo -e "${BLUE}Starting frontend development server...${NC}"

# Start frontend in foreground
npm run dev &
FRONTEND_PID=$!
echo "$FRONTEND_PID" > "/tmp/laundry_frontend_pid"

echo -e "\n${GREEN}✅ All services started successfully!${NC}"
echo "======================================"
echo -e "${BLUE}Frontend:${NC} http://localhost:8080"
echo -e "${BLUE}API Gateway:${NC} http://localhost:3000"
echo -e "${BLUE}Backend Services:${NC} ports 3001-3006"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

# Function to cleanup processes
cleanup() {
    echo -e "\n${YELLOW}Stopping all services...${NC}"

    # Kill all service PIDs
    for pid_file in /tmp/laundry_*_pid; do
        if [ -f "$pid_file" ]; then
            pid=$(cat "$pid_file")
            if kill -0 "$pid" 2>/dev/null; then
                echo -e "${BLUE}Stopping process $pid${NC}"
                kill "$pid"
            fi
            rm "$pid_file"
        fi
    done

    echo -e "${GREEN}All services stopped.${NC}"
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT

# Wait for frontend process
wait $FRONTEND_PID
