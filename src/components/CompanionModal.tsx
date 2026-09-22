import React, { useState } from 'react';
import {
  X,
  Radio,
  Copy,
  Check,
  Download,
  Terminal,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Monitor,
  Folder,
  HardDrive,
  CheckCircle2,
  FileCode,
} from 'lucide-react';
import { pingLocalCompanion } from '../services/companionClient';

interface CompanionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isCompanionConnected: boolean;
  setIsCompanionConnected: (connected: boolean) => void;
  workspacePath: string;
}

export const CompanionModal: React.FC<CompanionModalProps> = ({
  isOpen,
  onClose,
  isCompanionConnected,
  setIsCompanionConnected,
  workspacePath,
}) => {
  const [activeTab, setActiveTab] = useState<'powershell' | 'node_cli' | 'toolchain'>('powershell');
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedCliScript, setCopiedCliScript] = useState(false);
  const [copiedInstallScript, setCopiedInstallScript] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<{ connected: boolean; info?: any; error?: string } | null>(null);

  if (!isOpen) return null;

  const origin = window.location.origin;

  const psDaemonScript = `# OmniCode Desktop Daemon (PowerShell)
# Gives OmniCode direct access to your local working directory and other folders (Claude Code level integration):
$script = (Invoke-WebRequest -Uri "${origin}/api/companion/runner-script").Content
Invoke-Expression $script
`;

  const nodeCliCommand = `# OmniCode Cross-Platform CLI (Node.js) - Exact Claude Code Architecture
# Run in any folder on your machine:
curl -O ${origin}/api/companion/cli-script -o omnicode.mjs
node omnicode.mjs "${workspacePath}" --roms "D:\\arcade\\roms" --ghidra "C:\\tools\\ghidra"
`;

  const toolchainScript = `# Automated Toolchain Installer for Windows (MinGW, Ghidra, Git, MAME)
Write-Host "Installing Emulation Pipeline Toolchain..." -ForegroundColor Cyan

# 1. Install Git
winget install --id Git.Git -e --source winget

# 2. Install MinGW-w64 via WinGet / MSYS2
winget install --id MSYS2.MSYS2 -e --source winget

# 3. Install MAME
winget install --id MAME.MAME -e --source winget

# 4. Install Python 3.11
winget install --id Python.Python.3.11 -e --source winget

Write-Host "Toolchain installed! Setting environment variables..." -ForegroundColor Green
[Environment]::SetEnvironmentVariable("PATH", $env:PATH + ";C:\\tools\\mingw64\\bin;C:\\tools\\mame", "User")
Write-Host "Setup complete. Launch omnicode-daemon to start autonomous operations!" -ForegroundColor Yellow
`;

  const handleCopy = (text: string, type: 'ps' | 'cli' | 'toolchain') => {
    navigator.clipboard.writeText(text);
    if (type === 'ps') {
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    } else if (type === 'cli') {
      setCopiedCliScript(true);
      setTimeout(() => setCopiedCliScript(false), 2000);
    } else {
      setCopiedInstallScript(true);
      setTimeout(() => setCopiedInstallScript(false), 2000);
    }
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleTestConnection = async () => {
    setIsPinging(true);
    setPingResult(null);
    try {
      const res = await pingLocalCompanion();
      setPingResult(res);
      if (res.connected) {
        setIsCompanionConnected(true);
      }
    } catch (e: any) {
      setPingResult({ connected: false, error: e.message });
    } finally {
      setIsPinging(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 text-xs font-sans">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            <div>
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                Local PC Host Integration
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                  Claude Code Parity
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Grant OmniCode unrestricted read/write access to your local folders and native process execution (MAME, MinGW, Ghidra).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 text-slate-300">
          <div className="p-3 bg-cyan-950/40 border border-cyan-800/60 rounded-lg flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong className="text-cyan-300">How it works: </strong>
              Much like the <strong>Claude Code</strong> CLI or Cursor background runner, the host daemon runs on your machine (<code className="text-cyan-200">http://localhost:4040</code>). OmniCode connects to it to read/write files in any folder you specify (like <code className="text-cyan-200">{workspacePath}</code>, ROM directories, or Ghidra installations) and spawn native processes with zero sandbox restrictions.
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab('powershell')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'powershell'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              Option 1: Windows PowerShell Daemon
            </button>
            <button
              onClick={() => setActiveTab('node_cli')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'node_cli'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              Option 2: Node.js CLI (Claude Code Style)
            </button>
            <button
              onClick={() => setActiveTab('toolchain')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'toolchain'
                  ? 'bg-purple-950 text-purple-300 border border-purple-700'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              Automated Toolchain Installer
            </button>
          </div>

          {/* PowerShell Daemon Tab */}
          {activeTab === 'powershell' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 text-xs">
                  Run 1-line command in Windows PowerShell:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(psDaemonScript, 'ps')}
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-mono text-[11px] cursor-pointer"
                  >
                    {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedScript ? 'Copied!' : 'Copy Script'}</span>
                  </button>
                  <button
                    onClick={() => handleDownload(psDaemonScript, 'omnicode-daemon.ps1')}
                    className="flex items-center gap-1 text-slate-300 hover:text-white font-mono text-[11px] cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .ps1</span>
                  </button>
                </div>
              </div>

              <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto">
                {psDaemonScript}
              </pre>

              <div className="text-[11px] text-slate-400">
                Supports automatic multi-directory mapping, file reads/writes, and process execution in any specified working directory.
              </div>
            </div>
          )}

          {/* Node.js CLI Tab */}
          {activeTab === 'node_cli' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 text-xs">
                  Run OmniCode CLI with custom pointed folders:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(nodeCliCommand, 'cli')}
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-mono text-[11px] cursor-pointer"
                  >
                    {copiedCliScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCliScript ? 'Copied!' : 'Copy Command'}</span>
                  </button>
                  <a
                    href="/api/companion/cli-script"
                    download="omnicode-cli.mjs"
                    className="flex items-center gap-1 text-slate-300 hover:text-white font-mono text-[11px]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download omnicode.mjs</span>
                  </a>
                </div>
              </div>

              <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-amber-300 overflow-x-auto">
                {nodeCliCommand}
              </pre>

              <div className="text-[11px] text-slate-400 leading-relaxed">
                You can pass as many folders as you need using <code className="text-amber-300">--roms &lt;path&gt;</code>, <code className="text-amber-300">--ghidra &lt;path&gt;</code>, and <code className="text-amber-300">--folder alias=&lt;path&gt;</code> flags.
              </div>
            </div>
          )}

          {/* Automated Toolchain Tab */}
          {activeTab === 'toolchain' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 text-xs">
                  One-Click Windows Winget Toolchain Script:
                </span>
                <button
                  onClick={() => handleCopy(toolchainScript, 'toolchain')}
                  className="flex items-center gap-1 text-purple-400 hover:text-purple-300 font-mono text-[11px] cursor-pointer"
                >
                  {copiedInstallScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedInstallScript ? 'Copied!' : 'Copy Script'}</span>
                </button>
              </div>

              <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-purple-300 overflow-x-auto max-h-48">
                {toolchainScript}
              </pre>
            </div>
          )}

          {/* Connection Test & Health Status */}
          <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-200 text-xs">Connection Diagnostic:</span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium font-mono ${
                    isCompanionConnected
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                      : 'bg-amber-950/60 text-amber-300 border border-amber-800'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isCompanionConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  {isCompanionConnected ? 'Active (Port 4040)' : 'Not Connected'}
                </span>
              </div>

              <button
                onClick={handleTestConnection}
                disabled={isPinging}
                className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
              >
                {isPinging ? 'Pinging Host...' : 'Test Connection (Port 4040)'}
              </button>
            </div>

            {pingResult && (
              <div
                className={`p-2.5 rounded text-[11px] border ${
                  pingResult.connected
                    ? 'bg-emerald-950/80 border-emerald-700/60 text-emerald-200'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                {pingResult.connected ? (
                  <div>
                    <div className="font-semibold text-emerald-300 mb-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Host Bridge Online!
                    </div>
                    {pingResult.info && (
                      <div className="font-mono text-[10px] space-y-0.5 text-slate-300">
                        <div>Host: {pingResult.info.hostname || pingResult.info.computer} ({pingResult.info.platform})</div>
                        <div>User: {pingResult.info.username}</div>
                        <div>Working Directory: {pingResult.info.workingDir}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="text-amber-300 font-medium mb-0.5">Could not reach daemon at port 4040</div>
                    <div className="text-slate-400 text-[10px]">
                      Ensure you ran the PowerShell daemon or Node.js CLI script on your local machine.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-slate-400">
          <span className="text-[11px]">Daemon URL: http://localhost:4040</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
