@echo off
echo ========================================
echo Stopping Swift Wallet Treasury System
echo ========================================
echo.

REM Kill Node processes on ports 3000 and 8080
echo Stopping backend server (port 3000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo Backend server stopped.
    )
)

echo Stopping frontend server (port 8080)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo Frontend server stopped.
    )
)

REM Also try to kill by window title
taskkill /F /FI "WINDOWTITLE eq Backend Server*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq Frontend Server*" >nul 2>&1

REM Kill any remaining node processes (be careful with this)
echo.
echo Checking for remaining Node processes...
for /f "tokens=2" %%a in ('tasklist /FI "IMAGENAME eq node.exe" /FO LIST ^| findstr "PID:"') do (
    echo Found Node process: %%a
)

echo.
echo ========================================
echo All servers stopped!
echo ========================================
echo.
pause

