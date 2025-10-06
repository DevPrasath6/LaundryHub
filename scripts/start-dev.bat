@echo off
REM Laundry System - Development Startup Script for Windows
REM This script starts all backend services and the frontend development server

echo 🚀 Starting Laundry System Development Environment...
echo =================================================

REM Function to check if a port is available
REM We'll use netstat to check for port usage

echo Starting Backend Services...
echo ================================

REM Get the script directory
set SCRIPT_DIR=%~dp0
set PROJECT_ROOT=%SCRIPT_DIR%..

echo Project root: %PROJECT_ROOT%

REM Start API Gateway
echo Starting API Gateway on port 3000...
cd /d "%PROJECT_ROOT%\backend\api-gateway"
if not exist "node_modules" (
    echo Installing dependencies for API Gateway...
    call npm install
)
start "API Gateway" cmd /k "npm start"
timeout /t 3 /nobreak > nul

REM Start Auth Service
echo Starting Auth Service on port 3001...
cd /d "%PROJECT_ROOT%\backend\auth-service"
if not exist "node_modules" (
    echo Installing dependencies for Auth Service...
    call npm install
)
start "Auth Service" cmd /k "npm start"
timeout /t 2 /nobreak > nul

REM Start Laundry Service
echo Starting Laundry Service on port 3002...
cd /d "%PROJECT_ROOT%\backend\laundry-service"
if not exist "node_modules" (
    echo Installing dependencies for Laundry Service...
    call npm install
)
start "Laundry Service" cmd /k "npm start"
timeout /t 2 /nobreak > nul

REM Start Payment Service
echo Starting Payment Service on port 3003...
cd /d "%PROJECT_ROOT%\backend\payment-service"
if not exist "node_modules" (
    echo Installing dependencies for Payment Service...
    call npm install
)
start "Payment Service" cmd /k "npm start"
timeout /t 2 /nobreak > nul

REM Start Notification Service
echo Starting Notification Service on port 3004...
cd /d "%PROJECT_ROOT%\backend\notification-service"
if not exist "node_modules" (
    echo Installing dependencies for Notification Service...
    call npm install
)
start "Notification Service" cmd /k "npm start"
timeout /t 2 /nobreak > nul

REM Start Lost & Found Service
echo Starting Lost ^& Found Service on port 3005...
cd /d "%PROJECT_ROOT%\backend\lostfound-service"
if not exist "node_modules" (
    echo Installing dependencies for Lost ^& Found Service...
    call npm install
)
start "Lost & Found Service" cmd /k "npm start"
timeout /t 2 /nobreak > nul

REM Start Reporting Service
echo Starting Reporting Service on port 3006...
cd /d "%PROJECT_ROOT%\backend\reporting-service"
if not exist "node_modules" (
    echo Installing dependencies for Reporting Service...
    call npm install
)
start "Reporting Service" cmd /k "npm start"
timeout /t 2 /nobreak > nul

REM Wait for services to initialize
echo.
echo Waiting for services to initialize...
timeout /t 5 /nobreak > nul

REM Start Frontend
echo.
echo Starting Frontend Application...
echo =====================================

cd /d "%PROJECT_ROOT%\frontend\web"

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)

echo Starting frontend development server...
echo.
echo ✅ All services are starting!
echo ======================================
echo Frontend: http://localhost:8080
echo API Gateway: http://localhost:3000
echo Backend Services: ports 3001-3006
echo.
echo Press Ctrl+C to stop the frontend server
echo Close the individual service windows to stop backend services
echo.

REM Start frontend (this will block until Ctrl+C)
npm run dev

echo.
echo Frontend stopped. Backend services may still be running in separate windows.
pause
