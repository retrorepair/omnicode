import React, { useState } from 'react';
import {
  X,
  Monitor,
  Download,
  Terminal,
  PackageCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Zap,
  HardDrive,
  FileCode2,
  Sparkles
} from 'lucide-react';

interface WindowsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAutoSetup?: () => void;
}

export const WindowsAppModal: React.FC<WindowsAppModalProps> = ({
  isOpen,
  onClose,
  onOpenAutoSetup,
}) => {
  const [copiedBatch, setCopiedBatch] = useState(false);
  const [copiedBuild, setCopiedBuild] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const buildCommand = `npm run package:win`;

  const copyToClipboard = (text: string, type: 'batch' | 'build') => {
    navigator.clipboard.writeText(text);
    if (type === 'batch') {
      setCopiedBatch(true);
      setTimeout(() => setCopiedBatch(false), 1500);
    } else {
      setCopiedBuild(true);
      setTimeout(() => setCopiedBuild(false), 1500);
    }
  };

  const handleDownloadSingleInstaller = () => {
    setDownloading(true);
    const link = document.createElement('a');
    link.href = '/api/installer/download';
    link.download = 'OmniCode-Setup-1.0.0-x64.exe';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloading(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/90">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Monitor className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                Native x64 Windows Desktop Application &amp; Installer
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Single File .EXE
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Self-contained native 64-bit Windows application with direct file system, autonomous toolchain installer, and process automation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* PRIMARY: Single Windows Installer File (.exe) */}
          <div className="rounded-xl border border-blue-500/40 bg-gradient-to-br from-blue-950/40 via-slate-950 to-slate-950 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/40">
                  ★
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">
                    Single Windows Installer File (OmniCode-Setup-1.0.0-x64.exe)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Proper native x64 Windows executable — not a web wrapper. Includes native process spawning, direct drive scanning, and autonomous self-setup.
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                NSIS Installer
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-300">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="font-semibold text-blue-400 block mb-1">✓ Autonomous Setup</span>
                Self-installs MinGW, Git, MAME, Ghidra, Python &amp; Splat via <code>winget</code>.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="font-semibold text-emerald-400 block mb-1">✓ ROM &amp; File Searcher</span>
                Recursively scans drives for Killer Instinct CHDs and arcade ROMs.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="font-semibold text-purple-400 block mb-1">✓ Native Win32 IPC</span>
                Direct background Express daemon and PowerShell subprocesses.
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={handleDownloadSingleInstaller}
                disabled={downloading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg shadow-blue-900/50 transition-all cursor-pointer"
              >
                <Download className="h-4 w-4" />
                {downloading ? 'Preparing Download...' : 'Download OmniCode-Setup-1.0.0-x64.exe'}
              </button>
              {onOpenAutoSetup && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenAutoSetup();
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-medium transition-colors"
                >
                  <Zap className="h-3.5 w-3.5 text-amber-400" />
                  Open Autonomous Tool &amp; ROM Setup
                </button>
              )}
            </div>
          </div>

          {/* METHOD 2: Build the Single Installer Locally */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold">2</span>
                <h3 className="text-xs font-semibold text-slate-200">Build the Native Installer from Source</h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">package:win</span>
            </div>
            <p className="text-xs text-slate-400">
              Run this command in the project root to compile the frontend, bundle the backend, and generate the single installer into <code>dist-installer/OmniCode-Setup-1.0.0-x64.exe</code>:
            </p>

            <div className="relative rounded-lg bg-slate-900 border border-slate-800 p-3 font-mono text-xs text-cyan-300">
              <code>{buildCommand}</code>
              <button
                onClick={() => copyToClipboard(buildCommand, 'build')}
                className="absolute top-2 right-2 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Copy command"
              >
                {copiedBuild ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* ARCHITECTURE HIGHLIGHT */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2 text-xs text-slate-400">
            <h4 className="font-semibold text-slate-200 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Native Windows Integration Details
            </h4>
            <p>
              Unlike a restricted browser page, the installed native x64 Windows app runs with full Node.js Win32 bindings (via <code>electron-main.cjs</code> and <code>preload.cjs</code>). It can execute PowerShell scripts with elevated execution policies, invoke <code>winget</code> to install development tools, and search your entire disk for ROMs and CHDs automatically.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-slate-800 px-6 py-4 bg-slate-950/90">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
