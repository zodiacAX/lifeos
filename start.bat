@echo off
cd /d %~dp0
if exist .venv\Scripts\python.exe (
  .venv\Scripts\python.exe dev.py
  exit /b %errorlevel%
)
where py >nul 2>&1
if not errorlevel 1 (
  py -3 dev.py
  exit /b %errorlevel%
)
where python >nul 2>&1
if not errorlevel 1 (
  python dev.py
  exit /b %errorlevel%
)
printf [ERROR] Python not found. Run setup.bat or install Python 3.10+
pause
exit /b 1
