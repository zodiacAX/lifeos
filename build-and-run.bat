@echo off
cd /d %~dp0
call .venv\Scripts\activate.bat
call npm run build
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
