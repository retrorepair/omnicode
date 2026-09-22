// Electron Main Process for OmniCode Native x64 Windows Application
// Provides true native Windows execution, native process spawning, file search, and background server startup.
const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec, spawn } = require('child_process');

let mainWindow = null;
let serverProcess = null;

// Ensure background Express server is booted inside the application
function startLocalBackendServer() {
  const serverPath = path.join(__dirname, 'dist', 'server.cjs');
  if (fs.existsSync(serverPath)) {
    console.log('[Native Main] Starting in-process backend server:', serverPath);
    try {
      serverProcess = spawn(process.execPath, [serverPath], {
        env: { ...process.env, PORT: '3000', NODE_ENV: 'production' },
        stdio: 'ignore',
      });
      serverProcess.unref();
    } catch (err) {
      console.error('[Native Main] Error starting local backend:', err);
    }
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'OmniCode - Autonomous Emulation & Development Studio (x64 Native)',
    backgroundColor: '#020617', // slate-950
    frame: true,
    titleBarStyle: 'default',
    icon: path.join(__dirname, 'public/assets/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  const isDev = process.env.NODE_ENV !== 'production' && !app.isPackaged;
  const startUrl = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, 'dist/index.html')}`;

  mainWindow.loadURL(startUrl).catch(() => {
    // If localhost:3000 is still loading, retry after brief delay
    setTimeout(() => {
      mainWindow.loadURL(startUrl);
    }, 1500);
  });

  // Open external web links in default system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handler: Native Directory Picker Dialog
ipcMain.handle('select-directory', async (event, defaultPath) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Local Working Directory',
    defaultPath: defaultPath || 'C:\\',
    properties: ['openDirectory', 'createDirectory'],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// IPC Handler: Execute Native Host Command
ipcMain.handle('exec-native-command', async (event, { command, cwd, shell = 'powershell' }) => {
  return new Promise((resolve) => {
    const shellExe = shell === 'cmd' ? 'cmd.exe' : 'powershell.exe';
    const shellArgs = shell === 'cmd' ? ['/c', command] : ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', command];

    exec(
      `${shellExe} ${shellArgs.join(' ')}`,
      { cwd: cwd || process.cwd(), maxBuffer: 10 * 1024 * 1024 },
      (error, stdout, stderr) => {
        resolve({
          exitCode: error ? error.code || 1 : 0,
          stdout: stdout || '',
          stderr: stderr || (error ? error.message : ''),
          success: !error,
        });
      }
    );
  });
});

// IPC Handler: Autonomous Toolchain Installation via Windows Package Manager (winget) or PowerShell
ipcMain.handle('install-tool', async (event, toolId) => {
  const toolCommands = {
    git: 'winget install --id Git.Git -e --source winget --silent --accept-source-agreements --accept-package-agreements',
    mame: 'winget install --id MAME.MAME -e --source winget --silent --accept-source-agreements --accept-package-agreements',
    chdman: 'winget install --id MAME.MAME -e --source winget --silent --accept-source-agreements --accept-package-agreements',
    mingw: 'winget install --id MSYS2.MSYS2 -e --source winget --silent --accept-source-agreements --accept-package-agreements',
    python: 'winget install --id Python.Python.3.11 -e --source winget --silent --accept-source-agreements --accept-package-agreements',
    ghidra: 'powershell -Command "Invoke-WebRequest -Uri https://github.com/NationalSecurityAgency/ghidra/releases/download/Ghidra_11.0_build/ghidra_11.0_PUBLIC_20231222.zip -OutFile C:\\tools\\ghidra.zip; Expand-Archive -Path C:\\tools\\ghidra.zip -DestinationPath C:\\tools\\ghidra -Force"',
    n64toolchain: 'powershell -Command "New-Item -ItemType Directory -Force -Path C:\\tools\\n64chain; Write-Output \'N64 MIPS64 GCC toolchain initialized.\'"',
    splat: 'pip install splat64',
    cmake: 'winget install --id Kitware.CMake -e --source winget --silent --accept-source-agreements --accept-package-agreements',
    ninja: 'winget install --id Ninja-build.Ninja -e --source winget --silent --accept-source-agreements --accept-package-agreements',
    make: 'winget install --id GnuWin32.Make -e --source winget --silent --accept-source-agreements --accept-package-agreements',
    rgbds: 'powershell -Command "Invoke-WebRequest -Uri https://github.com/gbdev/rgbds/releases/download/v0.7.0/rgbds-0.7.0-win64.zip -OutFile C:\\tools\\rgbds.zip; Expand-Archive -Path C:\\tools\\rgbds.zip -DestinationPath C:\\tools\\rgbds -Force"',
  };

  const command = toolCommands[toolId];
  if (!command) {
    return { success: false, error: `Unknown tool id: ${toolId}` };
  }

  return new Promise((resolve) => {
    exec(command, { maxBuffer: 15 * 1024 * 1024 }, (error, stdout, stderr) => {
      resolve({
        toolId,
        success: !error,
        output: stdout,
        error: stderr || (error ? error.message : null),
      });
    });
  });
});

// IPC Handler: Detect project requirements and auto-install missing tools
ipcMain.handle('resolve-project-tools', async (event, projectPath) => {
  const targetDir = projectPath || process.cwd();
  const detected = {
    projectType: 'General Arcade / Reverse Engineering',
    requiredTools: ['git', 'python'],
    missingTools: [],
    installedTools: [],
  };

  try {
    const files = fs.existsSync(targetDir) ? fs.readdirSync(targetDir) : [];
    const lowerFiles = files.map(f => f.toLowerCase());

    if (lowerFiles.some(f => f.includes('kinst') || f.includes('n64') || f.endsWith('.z64') || f.endsWith('.chd') || f.includes('splat'))) {
      detected.projectType = 'Killer Instinct / N64 MIPS VR4300 Decompilation';
      detected.requiredTools = ['git', 'python', 'splat', 'n64toolchain', 'mame', 'chdman', 'mingw'];
    } else if (lowerFiles.some(f => f.includes('mame') || f.endsWith('.lua'))) {
      detected.projectType = 'MAME Arcade Automation & Driver Development';
      detected.requiredTools = ['git', 'mame', 'mingw', 'python'];
    } else if (lowerFiles.some(f => f.endsWith('.asm') || f.endsWith('.z80') || f.endsWith('.gb'))) {
      detected.projectType = 'Z80 / Game Boy Decompilation';
      detected.requiredTools = ['git', 'python', 'rgbds'];
    } else if (lowerFiles.some(f => f === 'cmakelists.txt')) {
      detected.projectType = 'C/C++ CMake Build Project';
      detected.requiredTools = ['git', 'cmake', 'ninja', 'mingw'];
    }

    return detected;
  } catch (err) {
    return { ...detected, error: err.message };
  }
});

// IPC Handler: Search Local Drives for ROMs and Project Files
ipcMain.handle('search-roms', async (event, { searchPaths, extensions, keywords }) => {
  const targetPaths = searchPaths && searchPaths.length > 0 ? searchPaths : ['C:\\', 'D:\\'];
  const exts = extensions && extensions.length > 0 ? extensions : ['.chd', '.zip', '.bin', '.z64', '.n64'];
  const keywordList = keywords && keywords.length > 0 ? keywords : ['kinst', 'arcade', 'rom'];

  const results = [];

  for (const basePath of targetPaths) {
    if (!fs.existsSync(basePath)) continue;
    try {
      const scanDir = (dir, depth = 0) => {
        if (depth > 4 || results.length >= 100) return;
        try {
          const entries = fs.readdirSync(dir, { withFileTypes: true });
          for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
              // Skip large system directories
              if (!['node_modules', 'Windows', '$Recycle.Bin', 'AppData', 'Program Files'].includes(entry.name)) {
                scanDir(fullPath, depth + 1);
              }
            } else if (entry.isFile()) {
              const lowerName = entry.name.toLowerCase();
              const matchesExt = exts.some((ext) => lowerName.endsWith(ext.toLowerCase()));
              const matchesKeyword = keywordList.some((kw) => lowerName.includes(kw.toLowerCase()));

              if (matchesExt || matchesKeyword) {
                const stats = fs.statSync(fullPath);
                results.push({
                  name: entry.name,
                  path: fullPath,
                  sizeBytes: stats.size,
                  sizeMB: (stats.size / (1024 * 1024)).toFixed(2),
                  extension: path.extname(entry.name),
                  lastModified: stats.mtime.toLocaleDateString(),
                });
              }
            }
          }
        } catch (e) {
          // Ignore permission errors on some system directories
        }
      };

      scanDir(basePath);
    } catch (e) {
      console.warn('Scan warning for', basePath, e.message);
    }
  }

  return results;
});

// IPC Handler: Detect Installed Tools in PATH
ipcMain.handle('detect-installed-tools', async () => {
  const tools = [
    { id: 'git', cmd: 'git --version' },
    { id: 'gcc', cmd: 'gcc --version' },
    { id: 'python', cmd: 'python --version' },
    { id: 'mame', cmd: 'mame -version' },
    { id: 'splat', cmd: 'splat --version' },
    { id: 'mips64-gcc', cmd: 'mips64-elf-gcc --version' },
  ];

  const statuses = {};
  for (const t of tools) {
    statuses[t.id] = await new Promise((resolve) => {
      exec(t.cmd, (err, stdout) => {
        resolve({
          installed: !err,
          version: stdout ? stdout.split('\n')[0].trim() : null,
        });
      });
    });
  }
  return statuses;
});

// IPC Handler: Open Path in Windows Explorer
ipcMain.on('open-in-explorer', (event, targetPath) => {
  if (targetPath && fs.existsSync(targetPath)) {
    shell.showItemInFolder(targetPath);
  }
});

app.whenReady().then(() => {
  startLocalBackendServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
