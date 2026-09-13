@echo off
setlocal
cd /d %~dp0
where python >nul 2>&1 || (echo [ERROR] Python not found. Install Python 3.10+ & exit /b 1)
where npm >nul 2>&1 || (echo [ERROR] Node/npm not found. Install Node 18+ & exit /b 1)
if not exist .venv python -m venv .venv
call .venv\Scripts\activate.bat
python -m pip install --upgrade pip
python -m pip install -r backend\requirements.txt
call npm install
if not exist .env copy .env.example .env >nul
echo.
echo [LIFE//OS] Setup complete.
echo [LIFE//OS] Run start.bat
