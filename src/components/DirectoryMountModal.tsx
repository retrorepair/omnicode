import React, { useState } from 'react';
import {
  X,
  FolderPlus,
  Folder,
  HardDrive,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Laptop,
  Terminal,
  Cpu,
  FileCode,
  Sparkles,
} from 'lucide-react';
import { MountedFolder } from '../types';
import { isFileSystemAccessSupported, pickLocalDirectory, scanDirectoryHandle } from '../services/localFileSystem';

interface DirectoryMountModalProps {
  isOpen: boolean;
  onClose: () => void;
  mountedFolders: MountedFolder[];
  setMountedFolders: React.Dispatch<React.SetStateAction<MountedFolder[]>>;
  activeWorkspacePath: string;
  setActiveWorkspacePath: (path: string) => void;
  onLocalDiskFilesLoaded: (folderName: string, files: any[]) => void;
}

export const DirectoryMountModal: React.FC<DirectoryMountModalProps> = ({
  isOpen,
  onClose,
  mountedFolders,
  setMountedFolders,
  activeWorkspacePath,
  setActiveWorkspacePath,
  onLocalDiskFilesLoaded,
}) => {
  const [newAlias, setNewAlias] = useState('');
  const [newPath, setNewPath] = useState('');
  const [newType, setNewType] = useState<MountedFolder['type']>('custom');
  const [isScanningDisk, setIsScanningDisk] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPath.trim()) return;

    const newFolder: MountedFolder = {
      id: `folder-${Date.now()}`,
      name: newAlias.trim() || newPath.split(/[\\/]/).filter(Boolean).pop() || 'Custom Folder',
      path: newPath.trim(),
      type: newType,
    };

    setMountedFolders((prev) => [...prev, newFolder]);
    setNewAlias('');
    setNewPath('');
    setScanMessage(`Mounted path "${newFolder.path}" for autonomous agent access.`);
    setTimeout(() => setScanMessage(null), 3500);
  };

  const handleRemoveFolder = (id: string) => {
    setMountedFolders((prev) => prev.filter((f) => f.id !== id));
  };

  const handleNativeDirectoryPicker = async () => {
    setIsScanningDisk(true);
    setScanMessage(null);
    try {
      const picked = await pickLocalDirectory();
      if (!picked) {
        setIsScanningDisk(false);
        return;
      }

      setScanMessage(`Scanning files in local directory "${picked.name}"...`);
      const diskFiles = await scanDirectoryHandle(picked.handle);

      const nativeFolder: MountedFolder = {
        id: `native-${Date.now()}`,
        name: picked.name,
        path: `C:\\local\\${picked.name}`,
        type: 'working_dir',
        isLocalDiskMounted: true,
        fileCount: diskFiles.length,
        handle: picked.handle,
      };

      setMountedFolders((prev) => [nativeFolder, ...prev]);
      setActiveWorkspacePath(nativeFolder.path);
      onLocalDiskFilesLoaded(picked.name, diskFiles);
      setScanMessage(
        `Successfully mounted local folder "${picked.name}" with ${diskFiles.length} files. OmniCode can now read and write directly to your hard drive!`
      );
    } catch (err: any) {
      setScanMessage(`Error mounting local folder: ${err.message}`);
    } finally {
      setIsScanningDisk(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 text-xs font-sans">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-700/60 flex items-center justify-center text-cyan-400">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                Local Directories & Workspace Mounts
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                  Claude Code Parity
                </span>
              </h2>
              <p className="text-slate-400 text-[11px]">
                Point OmniCode to any folder on your machine (ROMs, Ghidra, toolchains, build output).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Quick Notice Banner */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5 text-xs">
                <Laptop className="w-3.5 h-3.5 text-cyan-400" />
                Dual Direct-Access Engine
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-1.5 py-0.5 rounded">
                Active
              </span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              OmniCode can access your local machine using two complementary methods:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div className="bg-slate-900 border border-slate-800/80 rounded p-2.5">
                <div className="font-medium text-slate-200 text-[11px] flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                  Browser Native Disk I/O
                </div>
                <p className="text-slate-400 text-[10px] leading-normal">
                  Click below to open Windows Explorer / Finder and grant direct read/write permission to any local folder right in your browser.
                </p>
              </div>
              <div className="bg-slate-900 border border-slate-800/80 rounded p-2.5">
                <div className="font-medium text-slate-200 text-[11px] flex items-center gap-1.5 mb-1">
                  <Terminal className="w-3 h-3 text-amber-400" />
                  Host Daemon / CLI Bridge
                </div>
                <p className="text-slate-400 text-[10px] leading-normal">
                  Run the companion daemon or <code className="text-amber-300">omnicode-cli.mjs</code> to execute local MAME, MinGW GCC, and Ghidra with unrestricted OS access.
                </p>
              </div>
            </div>

            {/* Native Directory Picker Button */}
            {isFileSystemAccessSupported() && (
              <button
                type="button"
                onClick={handleNativeDirectoryPicker}
                disabled={isScanningDisk}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                <FolderPlus className="w-4 h-4" />
                <span>
                  {isScanningDisk ? 'Scanning Local Directory...' : 'Open Local Folder on Disk (Native Directory Picker)'}
                </span>
              </button>
            )}

            {scanMessage && (
              <div className="p-2.5 rounded bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 text-[11px]">
                {scanMessage}
              </div>
            )}
          </div>

          {/* Mounted Directories List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-amber-400" />
                Active Pointed & Mounted Folders ({mountedFolders.length})
              </h3>
              <span className="text-[10px] text-slate-400">OmniCode operates across all listed paths</span>
            </div>

            <div className="space-y-2">
              {mountedFolders.map((folder) => {
                const isPrimary = folder.path === activeWorkspacePath;
                return (
                  <div
                    key={folder.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                      isPrimary
                        ? 'bg-cyan-950/30 border-cyan-700/70 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${
                          folder.type === 'roms'
                            ? 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                            : folder.type === 'ghidra'
                            ? 'bg-purple-950/80 text-purple-400 border border-purple-800/60'
                            : folder.type === 'mingw'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                            : 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                        }`}
                      >
                        {folder.type === 'roms' ? (
                          <Cpu className="w-3.5 h-3.5" />
                        ) : folder.type === 'ghidra' ? (
                          <FileCode className="w-3.5 h-3.5" />
                        ) : (
                          <Folder className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-200 text-[11px] truncate">
                            {folder.name}
                          </span>
                          <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                            {folder.type}
                          </span>
                          {folder.isLocalDiskMounted && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                              Direct Disk I/O
                            </span>
                          )}
                          {isPrimary && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                              Primary Working Dir
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                          {folder.path}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {!isPrimary && (
                        <button
                          type="button"
                          onClick={() => setActiveWorkspacePath(folder.path)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 text-[10px] font-medium transition-colors"
                          title="Set as primary working directory"
                        >
                          Make Primary
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveFolder(folder.id)}
                        className="p-1 rounded hover:bg-rose-950/80 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Unmount folder"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form to Add New Pointed Folder */}
          <form onSubmit={handleAddFolder} className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 space-y-3">
            <h4 className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
              <FolderPlus className="w-3.5 h-3.5 text-cyan-400" />
              Point OmniCode to an Additional Folder
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <label className="block text-[10px] text-slate-400 mb-1">Local Directory Path (Host PC)</label>
                <input
                  type="text"
                  placeholder="e.g. D:\arcade\roms or C:\tools\ghidra_11.0"
                  value={newPath}
                  onChange={(e) => setNewPath(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Folder Category</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                >
                  <option value="roms">ROMs Directory</option>
                  <option value="ghidra">Ghidra Project</option>
                  <option value="mingw">MinGW / Toolchain</option>
                  <option value="working_dir">Working Directory</option>
                  <option value="custom">Custom Folder</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex-1 mr-2">
                <input
                  type="text"
                  placeholder="Alias label (optional e.g. 'Arcade ROMs Dump')"
                  value={newAlias}
                  onChange={(e) => setNewAlias(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
              <button
                type="submit"
                disabled={!newPath.trim()}
                className="px-3.5 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 font-semibold text-xs transition-colors shrink-0 cursor-pointer"
              >
                Add Folder
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-slate-400">
          <span className="text-[11px]">
            {mountedFolders.length} folders active in agent context
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
