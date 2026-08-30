@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo CERTUS needs Node.js once, then it opens as a desktop window.
  echo Install it from https://nodejs.org and run this file again.
  start "" "https://nodejs.org"
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo Installing CERTUS. First run only...
  call npm install
  if errorlevel 1 (
    echo Install failed.
    pause
    exit /b 1
  )
)

call npm run desktop
if errorlevel 1 pause
