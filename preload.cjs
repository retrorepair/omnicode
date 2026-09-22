// Electron Preload Script for OmniCode Native Windows Desktop Application
// Exposes secure native Windows APIs to the renderer process
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('nativeApp', {
  isElectron: true,
  platform: 'win32',
  arch: 'x64',
  
  // Select directory on local machine via Windows native Explorer dialog
  selectDirectory: async (defaultPath) => {
    return await ipcRenderer.invoke('select-directory', defaultPath);
  },

  // Execute native Windows command (PowerShell / CMD)
  executeCommand: async (command, cwd, shell) => {
    return await ipcRenderer.invoke('exec-native-command', { command, cwd, shell });
  },

  // Autonomous Toolchain Installation via Windows Package Manager (winget) or direct binary
  installTool: async (toolId) => {
    return await ipcRenderer.invoke('install-tool', toolId);
  },

  // Search local drives for ROMs, CHDs, and project files
  searchRomsAndFiles: async (searchPaths, extensions, keywords) => {
    return await ipcRenderer.invoke('search-roms', { searchPaths, extensions, keywords });
  },

  // Check system status & installed toolchains
  detectInstalledTools: async () => {
    return await ipcRenderer.invoke('detect-installed-tools');
  },

  // Open native path in Windows Explorer
  openInExplorer: (targetPath) => {
    ipcRenderer.send('open-in-explorer', targetPath);
  }
});
