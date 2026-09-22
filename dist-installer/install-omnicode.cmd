@echo off
title Installing OmniCode Native x64 Desktop Agent...
echo ========================================================
echo   OmniCode Native Windows x64 Desktop Setup
echo ========================================================
echo.
echo Installing OmniCode to %LOCALAPPDATA%\Programs\OmniCode...
set INSTALL_DIR=%LOCALAPPDATA%\Programs\OmniCode
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"
xcopy /E /I /Y "%~dp0*.*" "%INSTALL_DIR%" >nul

echo Registering Windows Start Menu & Desktop Shortcuts...
powershell -Command "$s=(New-Object -COM WScript.Shell).CreateShortcut([System.Environment]::GetFolderPath('Desktop')+'\OmniCode.lnk'); $s.TargetPath='%INSTALL_DIR%\OmniCode.exe'; $s.Save()"

echo.
echo [OK] OmniCode successfully installed!
echo Launching OmniCode...
start "" "%INSTALL_DIR%\OmniCode.exe"
