@echo off
title Chardho Go - Microservices Launcher
color 0A

echo ============================================
echo    CHARDHO GO - Starting All Microservices
echo ============================================
echo.

:: Start API Gateway
echo [1/6] Starting API Gateway...
start "API-GATEWAY" cmd /k "cd /d "%~dp0api-gateway" && npm run dev"
timeout /t 2 /nobreak >nul

:: Start Auth Service
echo [2/6] Starting Auth Service...
start "AUTH-SERVICE" cmd /k "cd /d "%~dp0auth-service" && npm run dev"
timeout /t 2 /nobreak >nul

:: Start User Service
echo [3/6] Starting User Service...
start "USER-SERVICE" cmd /k "cd /d "%~dp0user-service" && npm run dev"
timeout /t 2 /nobreak >nul

:: Start Driver Service
echo [4/6] Starting Driver Service...
start "DRIVER-SERVICE" cmd /k "cd /d "%~dp0driver-service" && npm run dev"
timeout /t 2 /nobreak >nul

:: Start Admin Service
echo [5/6] Starting Admin Service...
start "ADMIN-SERVICE" cmd /k "cd /d "%~dp0admin-service" && npm run dev"
timeout /t 2 /nobreak >nul

:: Start Notification Service
echo [6/6] Starting Notification Service...
start "NOTIFICATION-SERVICE" cmd /k "cd /d "%~dp0notification-service" && npm run dev"

echo.
echo ============================================
echo    All 6 microservices launched!
echo ============================================
echo.
echo    1. API Gateway
echo    2. Auth Service
echo    3. User Service
echo    4. Driver Service
echo    5. Admin Service
echo    6. Notification Service
echo.
echo    Each service is running in its own window.
echo    Close this window or press any key to exit.
echo ============================================
pause >nul
