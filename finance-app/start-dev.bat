@echo off
title FinanceMy Dev Server
color 0A

echo ========================================================
echo   Starting FinanceMy Development Server
echo ========================================================
echo.

:: 1. Navigate to the project directory (where this script is located)
cd /d "%~dp0"

:: 2. Check for npm and try to fix PATH if missing
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo NPM not found in global PATH. Checking standard locations...
    if exist "C:\Program Files\nodejs" set "PATH=%PATH%;C:\Program Files\nodejs"
    if exist "C:\Program Files (x86)\nodejs" set "PATH=%PATH%;C:\Program Files (x86)\nodejs"
)

:: Verify again
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [WARNING] NPM could not be found.
    echo Ensure Node.js is installed from https://nodejs.org/
    echo.
    echo Attempting to run 'npm' anyway...
) else (
    echo NPM found.
)

:: 3. Open the browser (Start it slightly before or in parallel)
echo Opening application in default browser...
timeout /t 3 >nul
start http://localhost:3000

:: 4. Run the development server
echo Starting npm run dev...
call npm run dev

if %errorlevel% neq 0 (
    echo.
    echo --------------------------------------------------------
    echo ERROR: 'npm run dev' failed or exited.
    echo Code: %errorlevel%
    echo --------------------------------------------------------
    echo Possible causes:
    echo  1. Node.js is not installed.
    echo  2. 'npm' is not in your PATH.
    echo  3. Port 3000 is already in use.
    echo --------------------------------------------------------
)

pause
