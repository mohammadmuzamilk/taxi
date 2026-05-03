@echo off
title Chardho Go — Master Launcher
color 0E
:menu
cls
echo ============================================
echo    CHARDHO GO - MASTER LAUNCHER
echo ============================================
echo
echo    1. Start Backend (All Microservices)
echo    2. Start Frontend (Client PWA)
echo    3. Start Drivers App (Driver PWA)
echo    4. Start Everything
echo    5. Install All Dependencies (First time only)
echo    6. Exit
echo
echo ============================================
set /p choice="Enter choice (1-6): "

if "%choice%"=="1" goto backend
if "%choice%"=="2" goto client
if "%choice%"=="3" goto drivers
if "%choice%"=="4" goto all
if "%choice%"=="5" goto install
if "%choice%"=="6" exit
goto menu

:backend
call run-backend.bat
goto menu

:client
echo Starting Client App...
start "CLIENT-APP" cmd /k "cd /d "%~dp0client" && npm run dev"
goto menu

:drivers
echo Starting Driver App...
start "DRIVER-APP" cmd /k "cd /d "%~dp0drivers" && npm run dev"
goto menu

:all
start cmd /c "call run-backend.bat"
timeout /t 5 >nul
start "CLIENT-APP" cmd /k "cd /d "%~dp0client" && npm run dev"
start "DRIVER-APP" cmd /k "cd /d "%~dp0drivers" && npm run dev"
goto menu

:install
echo Installing... This will take a few minutes.
cd /d "%~dp0backend"
call npm run install:all
cd /d "%~dp0client"
call npm install
cd /d "%~dp0drivers"
call npm install
echo Done!
pause
goto menu
