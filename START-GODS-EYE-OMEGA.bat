@echo off
setlocal
cd /d "%~dp0"
title GOD'S EYE: OMEGA

echo.
echo  ==========================================
echo       GOD'S EYE: OMEGA
echo       Local one-click launcher
echo  ==========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required. Install Node.js 24.14.x or 26.x, then run this file again.
  echo https://nodejs.org/en/download
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo npm was not found. Reinstall Node.js 24.14.x or 26.x with npm included.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo First launch: installing locked dependencies. This can take several minutes.
  call npm ci
  if errorlevel 1 (
    echo.
    echo Dependency installation failed. Check your internet connection and Node.js version.
    pause
    exit /b 1
  )
)

echo Checking your setup...
call npm run doctor
if errorlevel 1 (
  echo.
  echo Setup check failed. Follow the instructions above, then run this launcher again.
  pause
  exit /b 1
)

echo.
echo Starting GOD'S EYE: OMEGA on this computer only...
echo Keep this window open while using the app.
echo The browser will open at http://localhost:4173
echo.
call npm run dev -- --host 127.0.0.1 --strictPort --open
if errorlevel 1 (
  echo.
  echo The app stopped with an error. Review the messages above.
  pause
)
endlocal
