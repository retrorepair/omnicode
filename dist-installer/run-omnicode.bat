@echo off
title OmniCode Desktop Agent Launcher
cd /d "%~dp0"
echo ========================================================
echo   OmniCode: Autonomous Desktop Coding Agent
echo ========================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [Notice] Node.js is not found in your system PATH.
    echo Please install Node.js from https://nodejs.org or run:
    echo   winget install OpenJS.NodeJS.LTS
    echo.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo Installing local dependencies...
    cmd /c npm install --omit=dev
)

echo Starting OmniCode workstation on http://localhost:3000...
start "" "http://localhost:3000"

if exist "dist\server.cjs" (
    set NODE_ENV=production
    node dist\server.cjs
) else if exist "server.cjs" (
    set NODE_ENV=production
    node server.cjs
) else (
    npm start
)
