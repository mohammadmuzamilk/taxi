@echo off
title Chardho Go — Backend Runtime
color 0B
echo ============================================
echo    CHARDHO GO - Starting Backend Services
echo ============================================
echo.

set BASE_DIR=%~dp0backend

echo Starting API Gateway (port 8000)...
start "API-GATEWAY" cmd /k "cd /d "%BASE_DIR%\api-gateway" && npm run dev"
timeout /t 2 /nobreak >nul

echo Starting Client Service (port 5001)...
start "CLIENT-SERVICE" cmd /k "cd /d "%BASE_DIR%\client-service" && npm run dev"
timeout /t 2 /nobreak >nul

echo Starting Driver Service (port 5002)...
start "DRIVER-SERVICE" cmd /k "cd /d "%BASE_DIR%\driver-service" && npm run dev"
timeout /t 2 /nobreak >nul

echo Starting Admin Service (port 5003)...
start "ADMIN-SERVICE" cmd /k "cd /d "%BASE_DIR%\admin-service" && npm run dev"
timeout /t 2 /nobreak >nul

echo Starting Ride Service (port 5005)...
start "RIDE-SERVICE" cmd /k "cd /d "%BASE_DIR%\ride-service" && npm run dev"
timeout /t 2 /nobreak >nul

echo Starting Tracking Service (port 5006)...
start "TRACKING-SERVICE" cmd /k "cd /d "%BASE_DIR%\tracking-service" && npm run dev"
timeout /t 2 /nobreak >nul

echo Starting Notification Service (port 5007)...
start "NOTIFICATION-SERVICE" cmd /k "cd /d "%BASE_DIR%\notification-service" && npm run dev"
timeout /t 2 /nobreak >nul

echo.
echo ============================================
echo    All Backend Services are RUNNING!
echo ============================================
echo    DB 1 (PostgreSQL) must be active
echo    DB 2 (MongoDB Atlas) is connected via .env
echo ============================================
echo.
pause
