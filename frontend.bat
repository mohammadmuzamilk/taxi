@echo off
title Chardho Go — Frontend Runtime
color 0A
echo ============================================
echo    CHARDHO GO - Starting Frontend Apps
echo ============================================
echo.

set BASE_DIR=%~dp0

echo Starting Client Frontend...
start "CLIENT-FRONTEND" cmd /k "cd /d "%BASE_DIR%client" && npm run dev"
timeout /t 2 /nobreak >nul

echo Starting Driver Frontend...
start "DRIVER-FRONTEND" cmd /k "cd /d "%BASE_DIR%drivers" && npm run dev"
timeout /t 2 /nobreak >nul

echo Starting Admin Frontend...
start "ADMIN-FRONTEND" cmd /k "cd /d "%BASE_DIR%admin" && npm run dev"
timeout /t 2 /nobreak >nul

echo.
echo ============================================
echo    All Frontend Apps are RUNNING!
echo ============================================
echo    Client:  http://localhost:5173
echo    Driver:  http://localhost:5174 (Check console for exact port)
echo    Admin:   http://localhost:5175 (Check console for exact port)
echo ============================================
echo.
pause
