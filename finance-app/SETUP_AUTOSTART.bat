@echo off
set "SCRIPT_PATH=%~dp0start-dev.bat"
set "SHORTCUT_PATH=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\FinanceMy.lnk"

echo ========================================================
echo   Setting up FinanceMy Auto-Start (Mode: Hardcoded Path)
echo ========================================================
echo.

:: 1. Locate System Tools explicitly since PATH is broken
set "CSCRIPT_CMD=C:\Windows\System32\cscript.exe"

if not exist "%CSCRIPT_CMD%" (
    echo [WARNING] cscript.exe not found in System32. Trying SysWOW64...
    set "CSCRIPT_CMD=C:\Windows\SysWOW64\cscript.exe"
)

if not exist "%CSCRIPT_CMD%" (
    echo [CRITICAL ERROR] Could not find cscript.exe anywhere.
    echo Your Windows installation seems to have missing system files or unusual paths.
    echo.
    echo Please create the shortcut manually:
    echo 1. Right-click 'start-dev.bat' -> Create Shortcut.
    echo 2. Press Windows+R, type 'shell:startup' and ENTER.
    echo 3. Drag the new shortcut into that folder.
    pause
    exit /b
)

echo Found script engine at: %CSCRIPT_CMD%

:: 2. Create the VBScript file
set "VBS_SCRIPT=%TEMP%\create_shortcut_%RANDOM%.vbs"

(
echo Set oWS = WScript.CreateObject^("WScript.Shell"^)
echo sLinkFile = "%SHORTCUT_PATH%"
echo Set oLink = oWS.CreateShortcut^(sLinkFile^)
echo oLink.TargetPath = "%SCRIPT_PATH%"
echo oLink.WorkingDirectory = "%~dp0"
echo oLink.Description = "Start FinanceMy Dev Server"
echo oLink.IconLocation = "%SCRIPT_PATH%"
echo oLink.Save
) > "%VBS_SCRIPT%"

:: 3. Execute using the absolute path
"%CSCRIPT_CMD%" /nologo "%VBS_SCRIPT%"

:: 4. Cleanup
if exist "%VBS_SCRIPT%" del "%VBS_SCRIPT%"

:: 5. Verify
if exist "%SHORTCUT_PATH%" (
    echo.
    echo [SUCCESS] Shortcut created successfully!
    echo.
) else (
    echo.
    echo [ERROR] Script ran but shortcut is missing.
    echo You may need to create it manually.
)

echo.
pause
