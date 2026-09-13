"""Cross-platform dev launcher. Starts FastAPI and Vite, then opens the browser."""
from __future__ import annotations
import os, platform, subprocess, sys, time, webbrowser, signal
from pathlib import Path

ROOT=Path(__file__).resolve().parent
IS_WIN=platform.system()=='Windows'
venv_python=ROOT/'.venv'/('Scripts/python.exe' if IS_WIN else 'bin/python')
python=str(venv_python if venv_python.exists() else Path(sys.executable))
npm='npm.cmd' if IS_WIN else 'npm'

def main():
    env=os.environ.copy(); env['PYTHONPATH']=str(ROOT)
    api=subprocess.Popen([python,'-m','uvicorn','backend.app.main:app','--reload','--host','127.0.0.1','--port','8000'],cwd=ROOT,env=env)
    ui=subprocess.Popen([npm,'run','client:dev'],cwd=ROOT,env=env)
    print('\n[LIFE//OS] Frontend: http://localhost:3000')
    print('[LIFE//OS] API:      http://localhost:8000/api/health')
    print('[LIFE//OS] Docs:     http://localhost:8000/docs\n')
    time.sleep(2)
    try:webbrowser.open('http://localhost:3000')
    except Exception: pass
    try:
        while api.poll() is None and ui.poll() is None: time.sleep(.5)
    except KeyboardInterrupt: pass
    finally:
        for p in (api,ui):
            if p.poll() is None: p.terminate()

if __name__=='__main__': main()
