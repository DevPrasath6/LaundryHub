@echo off
echo Starting Smart Laundry System...
echo.

echo Starting Backend Services...
start "Backend Services" cmd /k "cd /d \"%~dp0\" && node scripts/start-backend.js"

echo Waiting for backend to initialize...
timeout /t 3 >nul

echo Starting Frontend Development Server...
start "Frontend Server" cmd /k "cd /d \"%~dp0frontend\web\" && npm run dev"

echo.
echo Smart Laundry System is starting up!
echo.
echo Backend Services running on:
echo - Payment Service: http://localhost:3003
echo - Notification Service: http://localhost:3004
echo - Lost ^& Found Service: http://localhost:3005
echo - Reporting Service: http://localhost:3006
echo.
echo Frontend will be available at: http://localhost:8080 or http://localhost:8081
echo.
echo Press any key to exit...
pause >nul
