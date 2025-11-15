@echo off
echo Starting Backend Server (Simple Mode)...
echo.
echo This will start the server without requiring MongoDB
echo You can login with any email/password
echo.
cd /d %~dp0
set MOCK_AUTH=true
npm run dev

