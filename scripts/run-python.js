const { spawn, spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

function isExecutable(file) {
  try {
    return fs.existsSync(file) && fs.statSync(file).isFile();
  } catch {
    return false;
  }
}

function findPython() {
  const envName = process.env.PYTHON || process.env.PYTHON_PATH;
  const candidates = [];

  if (envName) candidates.push(envName);
  candidates.push('py');
  candidates.push('python');
  candidates.push('python3');

  if (process.platform === 'win32') {
    const localPythonRoot = path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'Python');
    for (const version of ['Python312', 'Python311', 'Python310', 'Python39']) {
      const candidate = path.join(localPythonRoot, version, 'python.exe');
      candidates.push(candidate);
    }
  }

  for (const candidate of candidates) {
    const res = spawnSync(candidate, ['--version'], { stdio: 'ignore' });
    if (res.status === 0) return candidate;

    if (candidate === 'py') {
      const resTwo = spawnSync(candidate, ['-3', '--version'], { stdio: 'ignore' });
      if (resTwo.status === 0) return candidate;
    }
  }

  throw new Error('Python was not found. Install Python 3.10+ and ensure it is available on PATH or use the Windows launcher (py).');
}

const target = process.argv[2] || 'dev.py';
const python = findPython();

const child = spawn(python, [target], { stdio: 'inherit', shell: false });
child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
child.on('error', (error) => {
  console.error(error.message);
  process.exit(1);
});
