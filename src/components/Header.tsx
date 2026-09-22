import React from 'react';
import {
  Terminal,
  Cpu,
  Binary,
  Hammer,
  GitBranch,
  Folder,
  Radio,
  ExternalLink,
  Bot,
  Play,
  Monitor,
  HardDrive,
  FolderPlus,
  Gamepad2,
  Sliders,
  Sparkles,
  HelpCircle,
  Package,
  Zap,
} from 'lucide-react';
import { MountedFolder, GeminiAuthStatus } from '../types';

interface HeaderProps {
  activeTab: 'agent' | 'mame' | 'ghidra' | 'mingw' | 'git' | 'terminal' | 'ki_n64';
  setActiveTab: (tab: 'agent' | 'mame' | 'ghidra' | 'mingw' | 'git' | 'terminal' | 'ki_n64') => void;
  workspacePath: string;
  setWorkspacePath: (path: string) => void;
  mountedFolders: MountedFolder[];
  onOpenDirectoryMountModal: () => void;
  onOpenCompanionModal: () => void;
  isCompanionConnected: boolean;
  onOpenWindowsAppModal: () => void;
  onOpenSetupWizardModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenGeminiAuthModal: () => void;
  onOpenAutoSetupModal?: () => void;
  authStatus: GeminiAuthStatus;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  workspacePath,
  setWorkspacePath,
  mountedFolders,
  onOpenDirectoryMountModal,
  onOpenCompanionModal,
  isCompanionConnected,
  onOpenWindowsAppModal,
  onOpenSetupWizardModal,
  onOpenSettingsModal,
  onOpenGeminiAuthModal,
  onOpenAutoSetupModal,
  authStatus,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 select-none">
      {/* Native desktop window bar styling */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/80 border-b border-slate-800/60 text-xs">
        <div className="flex items-center gap-2">
          {/* Windows-like indicator dots */}
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block hover:opacity-100 cursor-pointer" title="Close" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block hover:opacity-100 cursor-pointer" title="Minimize" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block hover:opacity-100 cursor-pointer" title="Maximize" />
          </div>
          <div className="flex items-center gap-1.5 font-semibold text-slate-200">
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>OmniCode Windows Desktop Agent</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 font-mono">
              v1.5 Claude-Code Parity
            </span>
          </div>
        </div>

        {/* Local Workspace Directory Bar & Multi-Folder Mount Button */}
        <div className="flex items-center gap-2 max-w-xl w-full">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded px-2.5 py-1 text-slate-300 font-mono text-[11px] flex-1 justify-between">
            <div className="flex items-center gap-1.5 truncate">
              <Folder className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-slate-400 shrink-0">Working Dir:</span>
              <input
                type="text"
                value={workspacePath}
                onChange={(e) => setWorkspacePath(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none w-56 truncate"
                title="Click to edit local working directory"
              />
            </div>
            <span className="text-[10px] text-slate-400 bg-slate-800 px-1 rounded shrink-0">Local Disk</span>
          </div>

          <button
            onClick={onOpenDirectoryMountModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-[11px] font-medium transition-colors shrink-0 cursor-pointer"
            title="Manage mounted folders & native disk access"
          >
            <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
            <span>Folders</span>
            <span className="px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-300 text-[10px] font-mono border border-cyan-800">
              {mountedFolders.length}
            </span>
          </button>
        </div>

        {/* Window Controls, Setup, Settings, and Gemini Sign-in */}
        <div className="flex items-center gap-1.5">
          {/* Autonomous Setup & ROM Finder */}
          {onOpenAutoSetupModal && (
            <button
              onClick={onOpenAutoSetupModal}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-[11px] font-medium transition-colors cursor-pointer shadow-sm shadow-blue-950"
              title="Autonomous 1-Click Setup, Tool Installer & ROM Finder"
            >
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Auto Setup &amp; ROMs</span>
            </button>
          )}

          {/* Windows App Single Installer */}
          <button
            onClick={onOpenWindowsAppModal}
            className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-950/50 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-700/60 text-[11px] font-medium transition-colors cursor-pointer"
            title="Download Single Windows Installer (.exe) or build native app"
          >
            <Package className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Installer (.exe)</span>
          </button>

          {/* Setup Wizard */}
          <button
            onClick={onOpenSetupWizardModal}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-[11px] font-medium transition-colors cursor-pointer"
            title="Open Setup Wizard"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Setup</span>
          </button>

          {/* Settings Window */}
          <button
            onClick={onOpenSettingsModal}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-[11px] font-medium transition-colors cursor-pointer"
            title="Open Settings Window"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          {/* Gemini Sign-In Badge */}
          <button
            onClick={onOpenGeminiAuthModal}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-colors border cursor-pointer ${
              authStatus.signedIn
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900/60'
                : 'bg-amber-950/40 text-amber-300 border-amber-700/50 hover:bg-amber-900/50'
            }`}
            title="Configure Gemini Sign-In & Model"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{authStatus.signedIn ? 'Gemini Active' : 'Sign In'}</span>
          </button>

          {/* Companion Bridge Status */}
          <button
            onClick={onOpenCompanionModal}
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium transition-colors border cursor-pointer ${
              isCompanionConnected
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
            title="Host Daemon Bridge Status"
          >
            <Radio className={`w-3.5 h-3.5 ${isCompanionConnected ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            <span className="hidden md:inline">{isCompanionConnected ? 'Daemon :4040' : 'Host Bridge'}</span>
          </button>
        </div>
      </div>

      {/* Main Mode Navigation Tabs */}
      <div className="flex items-center justify-between px-3 py-1 bg-slate-900 overflow-x-auto">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('agent')}
            className={`flex items-center gap-2 px-3 py-2 rounded-t text-xs font-medium border-b-2 transition-all ${
              activeTab === 'agent'
                ? 'bg-slate-800 text-cyan-400 border-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Autonomous Agent</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
              Loop
            </span>
          </button>

          {/* Killer Instinct Arcade -> N64 Studio */}
          <button
            onClick={() => setActiveTab('ki_n64')}
            className={`flex items-center gap-2 px-3 py-2 rounded-t text-xs font-medium border-b-2 transition-all ${
              activeTab === 'ki_n64'
                ? 'bg-slate-800 text-amber-400 border-amber-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent'
            }`}
          >
            <Gamepad2 className="w-4 h-4 text-amber-400" />
            <span>KI Decomp → N64</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-950 text-amber-300 border border-amber-800 font-mono">
              MIPS
            </span>
          </button>

          <button
            onClick={() => setActiveTab('mame')}
            className={`flex items-center gap-2 px-3 py-2 rounded-t text-xs font-medium border-b-2 transition-all ${
              activeTab === 'mame'
                ? 'bg-slate-800 text-amber-400 border-amber-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>MAME Lab</span>
          </button>

          <button
            onClick={() => setActiveTab('ghidra')}
            className={`flex items-center gap-2 px-3 py-2 rounded-t text-xs font-medium border-b-2 transition-all ${
              activeTab === 'ghidra'
                ? 'bg-slate-800 text-purple-400 border-purple-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent'
            }`}
          >
            <Binary className="w-4 h-4" />
            <span>Ghidra Headless</span>
          </button>

          <button
            onClick={() => setActiveTab('mingw')}
            className={`flex items-center gap-2 px-3 py-2 rounded-t text-xs font-medium border-b-2 transition-all ${
              activeTab === 'mingw'
                ? 'bg-slate-800 text-blue-400 border-blue-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent'
            }`}
          >
            <Hammer className="w-4 h-4" />
            <span>MinGW Pipeline</span>
          </button>

          <button
            onClick={() => setActiveTab('git')}
            className={`flex items-center gap-2 px-3 py-2 rounded-t text-xs font-medium border-b-2 transition-all ${
              activeTab === 'git'
                ? 'bg-slate-800 text-emerald-400 border-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>Git &amp; GitHub</span>
          </button>

          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center gap-2 px-3 py-2 rounded-t text-xs font-medium border-b-2 transition-all ${
              activeTab === 'terminal'
                ? 'bg-slate-800 text-slate-100 border-slate-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>PowerShell / CLI</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono hidden lg:flex">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1" />
          <span className="text-slate-300">{authStatus.model}</span>
        </div>
      </div>
    </header>
  );
};
