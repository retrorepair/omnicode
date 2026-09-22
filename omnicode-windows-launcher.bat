@echo off
title OmniCode Desktop Agent - Windows Launcher
color 0B

echo ==============================================================================
echo                 OmniCode Autonomous Emulation ^& Development Agent
echo                             Windows Desktop Launcher
echo ==============================================================================
echo.

:: Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js 18+ from https://nodejs.org/ or run:
    echo   winget install OpenJS.NodeJS -e
    pause
    exit /b 1
)

:: Set default working directories if not provided
if "%OMNICODE_WORKSPACE%"=="" set OMNICODE_WORKSPACE=C:\dev\mame-arcade
if "%OMNICODE_ROMS%"=="" set OMNICODE_ROMS=D:\arcade\roms
if "%OMNICODE_GHIDRA%"=="" set OMNICODE_GHIDRA=C:\tools\ghidra
if "%OMNICODE_MINGW%"=="" set OMNICODE_MINGW=C:\tools\mingw64

echo [INFO] Working Directory: %OMNICODE_WORKSPACE%
echo [INFO] ROMs Directory:    %OMNICODE_ROMS%
echo [INFO] Ghidra Directory:  %OMNICODE_GHIDRA%
echo [INFO] MinGW Directory:   %OMNICODE_MINGW%
echo.

:: Ensure working directories exist
if not exist "%OMNICODE_WORKSPACE%" (
    echo [INFO] Creating directory: %OMNICODE_WORKSPACE%
    mkdir "%OMNICODE_WORKSPACE%"
)

echo [1/3] Starting OmniCode Host Daemon Bridge (port 4040)...
start /min "OmniCode Host Bridge" powershell -NoProfile -ExecutionPolicy Bypass -Command "$origin='http://localhost:3000'; $script=(Invoke-WebRequest -Uri '$origin/api/companion/runner-script').Content; Invoke-Expression $script"

echo [2/3] Verifying dependencies...
if not exist "node_modules" (
    echo [INFO] Installing npm dependencies...
    call npm install
)

echo [3/3] Launching OmniCode Application on Windows...
start http://localhost:3000
call npm run dev

pause
