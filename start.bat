@echo off
cd /d "%~dp0"

REM --- Start backend ---
start "AI Predictive Service Scheduling - Backend" cmd /k "cd /d "%~dp0backend" && "%~dp0.venv\Scripts\python.exe" app.py"

REM --- Start frontend ---
start "AI Predictive Service Scheduling - Frontend" cmd /k "cd /d "%~dp0frontend" && npm install && npm run dev"

REM --- Open browser to frontend ---
start "" http://localhost:5173

echo.
echo Application started.
echo Backend: http://localhost:5000

echo Frontend: http://localhost:5173

echo Close the terminal windows to stop the app.
exit /b 0
