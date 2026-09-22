import React, { useState } from 'react';
import {
  Folder,
  FileCode,
  FileText,
  File,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Terminal,
} from 'lucide-react';
import { WorkspaceFile, ToolchainStatus, MountedFolder } from '../types';

interface SidebarProps {
  files: WorkspaceFile[];
  activeFile: WorkspaceFile | null;
  onSelectFile: (file: WorkspaceFile) => void;
  onCreateFile: (path: string, content?: string) => void;
  toolchains: ToolchainStatus[];
  onPromptAgent: (promptText: string) => void;
  onRefreshFiles: () => void;
  mountedFolders: MountedFolder[];
  activeWorkspacePath: string;
  onSelectWorkspacePath: (path: string) => void;
  onOpenDirectoryMountModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  files,
  activeFile,
  onSelectFile,
  onCreateFile,
  toolchains,
  onPromptAgent,
  onRefreshFiles,
  mountedFolders,
  activeWorkspacePath,
  onSelectWorkspacePath,
  onOpenDirectoryMountModal,
}) => {
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFilePath, setNewFilePath] = useState('');
  const [showMountedFolders, setShowMountedFolders] = useState(true);
  const [showToolchains, setShowToolchains] = useState(true);
  const [showPrompts, setShowPrompts] = useState(true);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFilePath.trim()) return;
    onCreateFile(newFilePath.trim(), '// New file created in workspace\n');
    setNewFilePath('');
    setIsCreatingFile(false);
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.lua') || fileName.endsWith('.py') || fileName.endsWith('.c') || fileName.endsWith('.h')) {
      return <FileCode className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
    }
    if (fileName.endsWith('.json') || fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      return <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    }
    if (fileName.includes('Makefile')) {
      return <FileCode className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
    }
    return <File className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
  };

  const quickPrompts = [
    {
      title: 'Auto-Run MAME Pac-Man',
      prompt: 'Autonomously launch MAME with pacman, inject the Lua autoboot script to insert 2 coins and press Start, and verify RAM score byte.',
    },
    {
      title: 'Analyze ROM in Ghidra',
      prompt: 'Execute Ghidra headless analyzer on pacman.6e with Z80 architecture, recover entry vectors, and export C pseudocode.',
    },
    {
      title: 'Compile MinGW Driver Hook',
      prompt: 'Use MinGW GCC to compile pacman/driver_hook.c into build/driver_hook.dll with -Wall -O2 flags, and fix any compiler warnings.',
    },
    {
      title: 'Git Status & GitHub Push',
      prompt: 'Run git status on the workspace, stage modified MAME lua scripts and driver hooks, commit with a descriptive message, and push to GitHub.',
    },
    {
      title: 'Audit Full Toolchain',
      prompt: 'Check the version and installation status of MinGW, Ghidra, Git, and MAME, and generate the Windows PowerShell setup script.',
    },
  ];

  return (
    <aside className="w-72 bg-slate-950 border-r border-slate-800 flex flex-col h-full text-slate-300 text-xs select-none">
      {/* Workspace Header */}
      <div className="p-3 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-2">
          <Folder className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-slate-200 tracking-wide text-xs">EXPLORER</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsCreatingFile(true)}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-colors"
            title="New File"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRefreshFiles}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-colors"
            title="Refresh Files"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* New File Inline Form */}
      {isCreatingFile && (
        <form onSubmit={handleCreateSubmit} className="p-2 bg-slate-900 border-b border-slate-800 flex items-center gap-1.5">
          <input
            type="text"
            placeholder="e.g. scripts/test.lua"
            value={newFilePath}
            onChange={(e) => setNewFilePath(e.target.value)}
            autoFocus
            className="w-full bg-slate-950 text-slate-200 px-2 py-1 rounded border border-cyan-700/60 text-xs focus:outline-none font-mono"
          />
          <button type="submit" className="px-2 py-1 bg-cyan-700 hover:bg-cyan-600 text-white rounded text-[11px] font-medium">
            Add
          </button>
          <button
            type="button"
            onClick={() => setIsCreatingFile(false)}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px]"
          >
            ✕
          </button>
        </form>
      )}

      {/* Pointed Local Folders Section */}
      <div className="border-b border-slate-800/80 bg-slate-950/80">
        <div
          onClick={() => setShowMountedFolders(!showMountedFolders)}
          className="px-3 py-2 flex items-center justify-between text-[11px] font-semibold text-slate-300 hover:bg-slate-900/60 cursor-pointer"
        >
          <div className="flex items-center gap-1.5 truncate">
            {showMountedFolders ? <ChevronDown className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
            <span className="truncate">POINTED DIRECTORIES</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
              {mountedFolders.length}
            </span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDirectoryMountModal();
            }}
            className="p-0.5 rounded hover:bg-slate-800 text-cyan-400 hover:text-cyan-300"
            title="Mount or point to local folder"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {showMountedFolders && (
          <div className="px-2 pb-2 space-y-1">
            {mountedFolders.map((f) => {
              const isCurrent = f.path === activeWorkspacePath;
              return (
                <div
                  key={f.id}
                  onClick={() => onSelectWorkspacePath(f.path)}
                  className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition-colors text-[11px] ${
                    isCurrent
                      ? 'bg-cyan-950/70 border border-cyan-700/60 text-cyan-200'
                      : 'hover:bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                  title={`Path: ${f.path}\nClick to switch primary active directory`}
                >
                  <div className="flex items-center gap-1.5 truncate min-w-0">
                    <Folder className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-cyan-400' : 'text-amber-400'}`} />
                    <span className="truncate font-sans font-medium">{f.name}</span>
                  </div>
                  <span className="text-[9px] uppercase px-1 rounded bg-slate-900 text-slate-400 font-mono shrink-0 ml-1">
                    {f.type}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* File Tree List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5 font-mono">
        <div className="px-2 py-1 text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
          Workspace Files ({files.length})
        </div>
        {files.map((file) => {
          const isSelected = activeFile?.path === file.path;
          return (
            <button
              key={file.path}
              onClick={() => onSelectFile(file)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors truncate text-xs ${
                isSelected
                  ? 'bg-slate-800 text-cyan-300 border-l-2 border-cyan-400 font-medium'
                  : 'hover:bg-slate-900 text-slate-300'
              }`}
            >
              {getFileIcon(file.name)}
              <span className="truncate">{file.path}</span>
            </button>
          );
        })}
      </div>

      {/* Quick Agent Actions */}
      <div className="border-t border-slate-800/80 bg-slate-900/30">
        <button
          onClick={() => setShowPrompts(!showPrompts)}
          className="w-full px-3 py-2 flex items-center justify-between text-slate-400 hover:text-slate-200 font-semibold text-[11px]"
        >
          <div className="flex items-center gap-1.5 text-cyan-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AGENT AUTOMATION CHIPS</span>
          </div>
          {showPrompts ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        {showPrompts && (
          <div className="p-2 space-y-1.5 max-h-48 overflow-y-auto">
            {quickPrompts.map((item, idx) => (
              <button
                key={idx}
                onClick={() => onPromptAgent(item.prompt)}
                className="w-full text-left p-1.5 rounded bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-700/50 text-slate-300 hover:text-cyan-200 transition-all group"
              >
                <div className="font-medium text-[11px] text-cyan-300 group-hover:text-cyan-200">
                  {item.title}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {item.prompt}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Toolchain Health Status */}
      <div className="border-t border-slate-800/80 bg-slate-950">
        <button
          onClick={() => setShowToolchains(!showToolchains)}
          className="w-full px-3 py-2 flex items-center justify-between text-slate-400 hover:text-slate-200 font-semibold text-[11px]"
        >
          <div className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>TOOLCHAIN INTEGRATION</span>
          </div>
          {showToolchains ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        {showToolchains && (
          <div className="p-2 space-y-1.5 max-h-40 overflow-y-auto">
            {toolchains.map((tool, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-1.5 rounded bg-slate-900/50 border border-slate-800/60"
              >
                <div className="truncate mr-2">
                  <div className="font-semibold text-slate-300 text-[11px] truncate">{tool.name}</div>
                  <div className="text-[9px] text-slate-400 font-mono truncate">{tool.version}</div>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 shrink-0">
                  ACTIVE
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};
