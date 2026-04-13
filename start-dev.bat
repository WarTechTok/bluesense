@echo off
REM Start bluesense development environment
REM This script starts both backend and frontend with automatic port cleanup

echo.
echo ========================================
echo    BLUESENSE Development Server
echo ========================================
echo.

REM Kill any existing node processes on ports 3000 and 8080
echo 🧹 Cleaning up ports...
timeout /t 1 /nobreak >nul

REM Check and kill process on port 3000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /PID %%a /F >nul 2>&1
    if errorlevel 0 echo ✓ Cleaned up port 3000
)

REM Check and kill process on port 8080
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080 ^| findstr LISTENING') do (
    taskkill /PID %%a /F >nul 2>&1
    if errorlevel 0 echo ✓ Cleaned up port 8080
)

echo.
echo ✅ Ports cleaned up!
echo.

REM Start backend in new window
echo 🚀 Starting Backend on http://localhost:8080...
start "Bluesense Backend" cmd /k "cd backend && node index.js"
timeout /t 3 /nobreak >nul

REM Start frontend in new window
echo 🚀 Starting Frontend on http://localhost:3000...
start "Bluesense Frontend" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo ✅ Both servers started!
echo.
echo Backend:  http://localhost:8080
echo Frontend: http://localhost:3000
echo ========================================
echo.
echo Closing this window will NOT stop the servers.
echo To stop servers, close the backend and frontend windows.
echo.
pause
