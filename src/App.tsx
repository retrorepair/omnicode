import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { AgentStudio } from './components/AgentStudio';
import { MameAutomationLab } from './components/MameAutomationLab';
import { GhidraStudio } from './components/GhidraStudio';
import { MinGwBuilder } from './components/MinGwBuilder';
import { GitSyncStudio } from './components/GitSyncStudio';
import { TerminalDrawer } from './components/TerminalDrawer';
import { CompanionModal } from './components/CompanionModal';
import { DirectoryMountModal } from './components/DirectoryMountModal';
import { FileEditorModal } from './components/FileEditorModal';
import { GeminiAuthModal } from './components/GeminiAuthModal';
import { SetupWizardModal } from './components/SetupWizardModal';
import { SettingsModal } from './components/SettingsModal';
import { WindowsAppModal } from './components/WindowsAppModal';
import { KiDecompStudio } from './components/KiDecompStudio';
import { AutonomousToolManagerModal } from './components/AutonomousToolManagerModal';
import { DEFAULT_TOOLCHAINS } from './data/presets';
import {
  WorkspaceFile,
  AgentChatMessage,
  ToolchainStatus,
  ShellType,
  MountedFolder,
  GeminiAuthStatus,
  AppSettings,
} from './types';
import {
  pingLocalCompanion,
  executeOnLocalMachine,
  writeLocalHostFile,
} from './services/companionClient';
import { writeLocalFileViaHandle } from './services/localFileSystem';

export default function App() {
  const [activeTab, setActiveTab] = useState<'agent' | 'mame' | 'ghidra' | 'mingw' | 'git' | 'terminal' | 'ki_n64'>('agent');
  const [workspacePath, setWorkspacePath] = useState('C:\\dev\\mame-arcade');
  const [mountedFolders, setMountedFolders] = useState<MountedFolder[]>([
    {
      id: 'primary',
      name: 'Primary Working Directory',
      path: 'C:\\dev\\mame-arcade',
      type: 'working_dir',
    },
    {
      id: 'roms',
      name: 'ROMs Repository',
      path: 'D:\\arcade\\roms',
      type: 'roms',
    },
    {
      id: 'ghidra',
      name: 'Ghidra Projects & Scripts',
      path: 'C:\\dev\\ghidra_projects',
      type: 'ghidra',
    },
    {
      id: 'mingw',
      name: 'MinGW-w64 Toolchain',
      path: 'C:\\tools\\mingw64',
      type: 'mingw',
    },
  ]);
  const [files, setFiles] = useState<WorkspaceFile[]>([]);
  const [activeFile, setActiveFile] = useState<WorkspaceFile | null>(null);
  const [toolchains, setToolchains] = useState<ToolchainStatus[]>(DEFAULT_TOOLCHAINS);
  const [messages, setMessages] = useState<AgentChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Welcome to OmniCode! I am your autonomous Windows emulation and reverse engineering agent with Claude Code-level system integration. I have direct access to your local working directory and mounted folders (ROMs, Ghidra, MinGW, Git). I can autonomously decompile Killer Instinct from arcade CHD/EPROMs into native C, map Midway blitter graphics to N64 Reality Coprocessor microcode, cross-compile into a native .z64 ROM, automate MAME runs, and push repositories to GitHub.",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // Modals state
  const [isCompanionModalOpen, setIsCompanionModalOpen] = useState(false);
  const [isDirectoryMountModalOpen, setIsDirectoryMountModalOpen] = useState(false);
  const [isGeminiAuthModalOpen, setIsGeminiAuthModalOpen] = useState(false);
  const [isSetupWizardModalOpen, setIsSetupWizardModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isWindowsAppModalOpen, setIsWindowsAppModalOpen] = useState(false);
  const [isAutoSetupModalOpen, setIsAutoSetupModalOpen] = useState(false);
  const [isCompanionConnected, setIsCompanionConnected] = useState(false);

  // Gemini Auth Status state
  const [authStatus, setAuthStatus] = useState<GeminiAuthStatus>({
    signedIn: true,
    model: 'gemini-3.8-flash',
    tier: 'Pro Quota (Workspace Active)',
    authMethod: 'workspace_secret',
  });

  // Global App Settings
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'dark',
    autoRetryCompilerErrors: true,
    defaultShell: 'powershell',
    companionPort: 4040,
    companionAutoConnect: true,
    preferredModel: 'gemini-3.8-flash',
    desktopNotifications: true,
    mamePath: 'C:\\tools\\mame\\mame.exe',
    ghidraPath: 'C:\\tools\\ghidra\\support\\analyzeHeadless.bat',
    mingwPath: 'C:\\tools\\mingw64\\bin\\gcc.exe',
    gitPath: 'C:\\Program Files\\Git\\bin\\git.exe',
    mips64Path: 'C:\\tools\\n64chain\\bin\\mips64-elf-gcc.exe',
    splatPath: 'C:\\tools\\splat\\split.py',
    chdPath: 'D:\\arcade\\roms\\kinst\\kinst.chd',
    bootRomPath: 'D:\\arcade\\roms\\kinst\\u98-l10.bin',
    n64OutputPath: 'C:\\dev\\kinst_n64\\build',
    n64RomFormat: 'z64',
  });

  // Fetch workspace files on mount
  const fetchFiles = async () => {
    try {
      const res = await fetch('/api/workspace/files');
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
      }
    } catch (e) {
      console.error('Failed to load workspace files', e);
    }
  };

  // Fetch Gemini auth status
  const fetchAuthStatus = async () => {
    try {
      const res = await fetch('/api/auth/gemini/status');
      if (res.ok) {
        const data = await res.json();
        setAuthStatus(data);
      }
    } catch (e) {
      console.error('Failed to fetch auth status', e);
    }
  };

  // Check local companion status on load and periodically
  const checkCompanion = async () => {
    const res = await pingLocalCompanion();
    if (res.connected) {
      setIsCompanionConnected(true);
    }
  };

  useEffect(() => {
    fetchFiles();
    fetchAuthStatus();
    checkCompanion();
    const timer = setInterval(checkCompanion, 7000);
    return () => clearInterval(timer);
  }, []);

  // Update Gemini Auth API
  const handleUpdateAuth = async (apiKey?: string, model?: string) => {
    try {
      const res = await fetch('/api/auth/gemini/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, model }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status) {
          setAuthStatus(data.status);
        }
      }
    } catch (e) {
      console.error('Failed to configure auth', e);
    }
  };

  // Save Settings
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('omnicode_settings', JSON.stringify(newSettings));
  };

  // Sync workspacePath when user changes or selects a primary folder
  const handleSelectWorkspacePath = (newPath: string) => {
    setWorkspacePath(newPath);
  };

  // Handler for files loaded directly from user's hard drive via File System Access API
  const handleLocalDiskFilesLoaded = (folderName: string, diskFiles: any[]) => {
    const formatted: WorkspaceFile[] = diskFiles.map((df) => ({
      name: df.name,
      path: df.relativePath,
      type: 'file',
      content: df.content,
      language: df.language,
      size: typeof df.size === 'number' ? df.size : 1024,
      updatedAt: 'Just now (Disk)',
    }));

    setFiles((prev) => {
      const existingPaths = new Set(formatted.map((f) => f.path));
      const filtered = prev.filter((f) => !existingPaths.has(f.path));
      return [...formatted, ...filtered];
    });
  };

  // Quick mount directory helper for wizard
  const handleMountDirectoryFromWizard = async (type: MountedFolder['type']) => {
    setIsDirectoryMountModalOpen(true);
  };

  const handleMountDirectoryFromPath = (targetPath: string, name?: string) => {
    const newFolder: MountedFolder = {
      id: `mount-${Date.now()}`,
      name: name || targetPath,
      path: targetPath,
      type: 'working_dir',
      isLocalDiskMounted: true,
    };
    setMountedFolders((prev) => [...prev, newFolder]);
    setWorkspacePath(targetPath);
  };

  // Save/Create file (writes to local disk if companion or directory handle is available, and persists to backend)
  const handleSaveFile = async (filePath: string, content: string) => {
    try {
      if (isCompanionConnected) {
        await writeLocalHostFile(filePath, content).catch(() => null);
      }

      for (const folder of mountedFolders) {
        if (folder.handle && folder.isLocalDiskMounted) {
          await writeLocalFileViaHandle(folder.handle, filePath, content).catch(() => null);
        }
      }

      const res = await fetch('/api/workspace/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: filePath, content }),
      });
      if (res.ok) {
        await fetchFiles();
      }
    } catch (e) {
      console.error('Failed to save file', e);
    }
  };

  const handleCreateFile = async (filePath: string, content: string = '') => {
    await handleSaveFile(filePath, content);
  };

  // Execute shell command (routes to local host daemon if connected, otherwise backend emulator)
  const handleExecuteCommand = async (command: string, shell: ShellType = 'powershell') => {
    try {
      if (isCompanionConnected) {
        const localRes = await executeOnLocalMachine(command, workspacePath, shell);
        return {
          exitCode: localRes.exitCode ?? (localRes.success ? 0 : 1),
          stdout: localRes.output || '',
          stderr: localRes.error || '',
          command,
          timestamp: new Date().toLocaleTimeString(),
        };
      }

      // Fallback to server execution
      const res = await fetch('/api/terminal/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, shell }),
      });
      if (res.ok) {
        return await res.json();
      }
      return {
        exitCode: 1,
        stdout: '',
        stderr: `Failed to execute: HTTP ${res.status}`,
        command,
        timestamp: new Date().toLocaleTimeString(),
      };
    } catch (e: any) {
      return {
        exitCode: 1,
        stdout: '',
        stderr: e.message || 'Execution error',
        command,
        timestamp: new Date().toLocaleTimeString(),
      };
    }
  };

  // Run autonomous agent loop with multi-folder context
  const handleSendMessage = async (promptText: string) => {
    const userMsg: AgentChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: promptText,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          workspacePath,
          mountedFolders,
          history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();

      const assistantMsg: AgentChatMessage = {
        id: `agent-${Date.now()}`,
        role: 'assistant',
        content: data.finalResponse || 'Executed autonomous actions.',
        thought: data.thought,
        toolCalls: data.toolCalls,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      await fetchFiles();
    } catch (err: any) {
      const errorMsg: AgentChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Agent execution error: ${err.message || 'Failed to communicate with agent service.'}`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Application Chrome */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        workspacePath={workspacePath}
        setWorkspacePath={setWorkspacePath}
        mountedFolders={mountedFolders}
        onOpenDirectoryMountModal={() => setIsDirectoryMountModalOpen(true)}
        onOpenCompanionModal={() => setIsCompanionModalOpen(true)}
        isCompanionConnected={isCompanionConnected}
        onOpenWindowsAppModal={() => setIsWindowsAppModalOpen(true)}
        onOpenSetupWizardModal={() => setIsSetupWizardModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenGeminiAuthModal={() => setIsGeminiAuthModalOpen(true)}
        onOpenAutoSetupModal={() => setIsAutoSetupModalOpen(true)}
        authStatus={authStatus}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Explorer & Toolchain Sidebar */}
        <Sidebar
          files={files}
          activeFile={activeFile}
          onSelectFile={(f) => setActiveFile(f)}
          onCreateFile={handleCreateFile}
          toolchains={toolchains}
          mountedFolders={mountedFolders}
          activeWorkspacePath={workspacePath}
          onSelectWorkspacePath={handleSelectWorkspacePath}
          onOpenDirectoryMountModal={() => setIsDirectoryMountModalOpen(true)}
          onPromptAgent={(prompt) => {
            setActiveTab('agent');
            handleSendMessage(prompt);
          }}
          onRefreshFiles={fetchFiles}
        />

        {/* Center Active Workspace View */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950">
          {activeTab === 'agent' && (
            <AgentStudio
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              onClearChat={() => setMessages([])}
              workspacePath={workspacePath}
              mountedFolders={mountedFolders}
              onOpenDirectoryMountModal={() => setIsDirectoryMountModalOpen(true)}
            />
          )}

          {activeTab === 'ki_n64' && (
            <KiDecompStudio
              settings={settings}
              onSendToAgent={(prompt) => {
                setActiveTab('agent');
                handleSendMessage(prompt);
              }}
            />
          )}

          {activeTab === 'mame' && (
            <MameAutomationLab
              files={files}
              onSaveFile={handleSaveFile}
              onExecuteCommand={handleExecuteCommand}
            />
          )}

          {activeTab === 'ghidra' && (
            <GhidraStudio
              files={files}
              onExecuteCommand={handleExecuteCommand}
            />
          )}

          {activeTab === 'mingw' && (
            <MinGwBuilder
              files={files}
              onExecuteCommand={handleExecuteCommand}
            />
          )}

          {activeTab === 'git' && (
            <GitSyncStudio
              files={files}
              onExecuteCommand={handleExecuteCommand}
            />
          )}

          {activeTab === 'terminal' && (
            <TerminalDrawer
              onExecute={handleExecuteCommand}
              workspacePath={workspacePath}
            />
          )}
        </main>
      </div>

      {/* File Editor Modal */}
      <FileEditorModal
        file={activeFile}
        onClose={() => setActiveFile(null)}
        onSave={async (path, content) => {
          await handleSaveFile(path, content);
          setActiveFile(null);
        }}
      />

      {/* Directory & Workspace Mount Manager Modal */}
      <DirectoryMountModal
        isOpen={isDirectoryMountModalOpen}
        onClose={() => setIsDirectoryMountModalOpen(false)}
        mountedFolders={mountedFolders}
        setMountedFolders={setMountedFolders}
        activeWorkspacePath={workspacePath}
        setActiveWorkspacePath={setWorkspacePath}
        onLocalDiskFilesLoaded={handleLocalDiskFilesLoaded}
      />

      {/* Companion Setup Modal */}
      <CompanionModal
        isOpen={isCompanionModalOpen}
        onClose={() => setIsCompanionModalOpen(false)}
        isCompanionConnected={isCompanionConnected}
        setIsCompanionConnected={setIsCompanionConnected}
        workspacePath={workspacePath}
      />

      {/* Gemini Sign-In Modal */}
      <GeminiAuthModal
        isOpen={isGeminiAuthModalOpen}
        onClose={() => setIsGeminiAuthModalOpen(false)}
        authStatus={authStatus}
        onUpdateAuth={handleUpdateAuth}
      />

      {/* Setup Wizard Modal */}
      <SetupWizardModal
        isOpen={isSetupWizardModalOpen}
        onClose={() => setIsSetupWizardModalOpen(false)}
        workspacePath={workspacePath}
        mountedFolders={mountedFolders}
        hostStatus={{
          connected: isCompanionConnected,
          port: settings.companionPort,
          host: 'localhost',
        }}
        authStatus={authStatus}
        onMountDirectory={handleMountDirectoryFromWizard}
        onCheckHostConnection={checkCompanion}
        onOpenKiStudio={() => setActiveTab('ki_n64')}
      />

      {/* Separate Settings Window Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        authStatus={authStatus}
        onSaveSettings={handleSaveSettings}
        onUpdateAuth={handleUpdateAuth}
      />

      {/* Windows App Compilation & Launcher Modal */}
      <WindowsAppModal
        isOpen={isWindowsAppModalOpen}
        onClose={() => setIsWindowsAppModalOpen(false)}
        onOpenAutoSetup={() => setIsAutoSetupModalOpen(true)}
      />

      {/* Autonomous Setup, Toolchain Installer & ROM Finder Modal */}
      <AutonomousToolManagerModal
        isOpen={isAutoSetupModalOpen}
        onClose={() => setIsAutoSetupModalOpen(false)}
        onMountDirectory={handleMountDirectoryFromPath}
        onSetChdPath={(chdPath) => setSettings((prev) => ({ ...prev, chdPath }))}
      />
    </div>
  );
}

