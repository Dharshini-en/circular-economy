@echo off
setlocal
cd /d "%~dp0"

where py >nul 2>nul
if errorlevel 1 (
    echo Python Launcher was not found. Install Python, then try again.
    pause
    exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
    echo npm was not found. Install Node.js, then try again.
    pause
    exit /b 1
)

if not exist ".venv\Scripts\python.exe" py -m venv .venv
if errorlevel 1 exit /b 1

".venv\Scripts\python.exe" -m pip install -r backend\requirements.txt
if errorlevel 1 exit /b 1

call npm.cmd --prefix frontend install
if errorlevel 1 exit /b 1

call npm.cmd --prefix frontend run build
if errorlevel 1 exit /b 1

echo.
echo Dashboard is starting at http://localhost:8080
echo For another computer on this network, use this computer's IP address on port 8080.
echo Keep this window open while using the dashboard.
set PORT=8080
pushd backend
..\.venv\Scripts\python.exe app.py
popd

endlocal