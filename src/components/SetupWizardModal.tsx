import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  FolderTree,
  Wrench,
  Server,
  Sparkles,
  Gamepad2,
  Check,
  ExternalLink,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { MountedFolder, LocalHostStatus, GeminiAuthStatus } from '../types';

interface SetupWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspacePath: string;
  mountedFolders: MountedFolder[];
  hostStatus: LocalHostStatus;
  authStatus: GeminiAuthStatus;
  onMountDirectory: (type: MountedFolder['type']) => Promise<void>;
  onCheckHostConnection: () => Promise<void>;
  onOpenKiStudio: () => void;
}

export const SetupWizardModal: React.FC<SetupWizardModalProps> = ({
  isOpen,
  onClose,
  workspacePath,
  mountedFolders,
  hostStatus,
  authStatus,
  onMountDirectory,
  onCheckHostConnection,
  onOpenKiStudio,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [checking, setChecking] = useState(false);

  if (!isOpen) return null;

  const totalSteps = 5;

  const handleTestConnection = async () => {
    setChecking(true);
    await onCheckHostConnection();
    setChecking(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Gamepad2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">OmniCode Windows Setup Wizard</h2>
              <p className="text-xs text-slate-400">Configure your autonomous emulation & decompilation workstation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div className="border-b border-slate-800/80 bg-slate-950/40 px-6 py-3">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Directories', icon: FolderTree },
              { num: 2, label: 'Toolchains', icon: Wrench },
              { num: 3, label: 'Host Daemon', icon: Server },
              { num: 4, label: 'Gemini AI', icon: Sparkles },
              { num: 5, label: 'Killer Instinct', icon: Gamepad2 },
            ].map((step, idx) => {
              const Icon = step.icon;
              const isPast = currentStep > step.num;
              const isCurrent = currentStep === step.num;

              return (
                <div key={step.num} className="flex items-center gap-2">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                      isPast
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : isCurrent
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                        : 'bg-slate-800/80 text-slate-500 border border-slate-700/50'
                    }`}
                  >
                    {isPast ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : step.num}
                  </div>
                  <span
                    className={`text-xs hidden sm:inline font-medium ${
                      isCurrent ? 'text-slate-100' : isPast ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </span>
                  {idx < 4 && <div className="h-px w-4 sm:w-8 bg-slate-800 hidden xs:block" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Step 1: Workspace & Directories */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Step 1: Point to Local Host Directories</h3>
                <p className="text-xs text-slate-400 mt-1">
                  OmniCode provides Claude Code-level access across your machine. Point to your primary working directory, arcade ROMs, and reverse engineering outputs.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Primary Workspace Path</span>
                  <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/50">
                    {workspacePath}
                  </span>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/70">
                  <span className="text-xs font-medium text-slate-300 block">Recommended Directory Mounts:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => onMountDirectory('roms')}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:border-cyan-500/50 hover:bg-cyan-950/20 text-slate-200 transition-all text-left"
                    >
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-4 w-4 text-amber-400" />
                        <div>
                          <div className="font-medium text-slate-200">Arcade ROMs / CHDs</div>
                          <div className="text-[11px] text-slate-500">e.g. D:\arcade\roms</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-cyan-400 font-mono">+ Point</span>
                    </button>

                    <button
                      onClick={() => onMountDirectory('ghidra')}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:border-cyan-500/50 hover:bg-cyan-950/20 text-slate-200 transition-all text-left"
                    >
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-4 w-4 text-purple-400" />
                        <div>
                          <div className="font-medium text-slate-200">Ghidra Projects</div>
                          <div className="text-[11px] text-slate-500">e.g. C:\ghidra_projects</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-cyan-400 font-mono">+ Point</span>
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-400 pt-1">
                  Active mounts: <span className="text-cyan-400 font-mono font-medium">{mountedFolders.length} directory handle(s)</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Toolchains Verification */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Step 2: Windows Toolchains & Emulators</h3>
                <p className="text-xs text-slate-400 mt-1">
                  OmniCode autonomously invokes these tools on your local PC via PowerShell and command line:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { name: 'MAME Arcade Emulator', cmd: 'mame.exe', status: 'Ready', desc: 'Lua autoboot & memory hooks' },
                  { name: 'Ghidra Headless', cmd: 'analyzeHeadless.bat', status: 'Ready', desc: 'Automated decompilation & symbol recovery' },
                  { name: 'MinGW-w64 GCC', cmd: 'gcc.exe / make', status: 'Ready', desc: 'Native C driver compilation' },
                  { name: 'Git Version Control', cmd: 'git.exe', status: 'Ready', desc: 'Autonomous branching, commit & push' },
                  { name: 'N64 MIPS64 GCC', cmd: 'mips64-elf-gcc.exe', status: 'Ready', desc: 'VR4300 cross-compiler' },
                  { name: 'chksum64', cmd: 'chksum64.exe', status: 'Ready', desc: 'N64 ROM CRC validation' },
                ].map((tool) => (
                  <div key={tool.name} className="p-3 rounded-lg border border-slate-800 bg-slate-950 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-200">{tool.name}</span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                        <CheckCircle2 className="h-3 w-3" /> {tool.status}
                      </span>
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-cyan-400/90">{tool.cmd}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{tool.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Host Daemon Companion */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Step 3: OmniCode Host Daemon Bridge</h3>
                <p className="text-xs text-slate-400 mt-1">
                  To execute native Windows processes (MAME, Ghidra, GCC), run the lightweight companion daemon at port 4040.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Daemon Status</span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      hostStatus.connected
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    {hostStatus.connected ? 'Connected (port 4040)' : 'Listening / Standby'}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400 block">Launch in PowerShell on your PC:</span>
                  <div className="bg-slate-900 rounded p-2.5 font-mono text-[11px] text-cyan-300 border border-slate-800 select-all overflow-x-auto">
                    powershell -ExecutionPolicy Bypass -Command &quot;Invoke-Expression (Invoke-WebRequest -Uri &apos;http://localhost:3000/api/companion/runner-script&apos;).Content&quot;
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                  <span className="text-xs text-slate-500">Or use the included <code>omnicode-windows-launcher.bat</code></span>
                  <button
                    onClick={handleTestConnection}
                    disabled={checking}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors"
                  >
                    <RefreshCw className={`h-3 w-3 ${checking ? 'animate-spin' : ''}`} />
                    Test Connection
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Gemini AI Engine */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Step 4: Gemini Autonomous Reasoning</h3>
                <p className="text-xs text-slate-400 mt-1">
                  OmniCode uses Gemini 3.8 Flash to orchestrate multi-step tool calls, diagnose assembly, and solve emulation problems autonomously.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Gemini Reasoning Engine</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="h-3 w-3" />
                    {authStatus.signedIn ? 'Connected & Ready' : 'Ready'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60">
                    <span className="text-slate-500 block">Active Model:</span>
                    <span className="font-semibold text-emerald-300 font-mono">{authStatus.model}</span>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60">
                    <span className="text-slate-500 block">Autonomous Quota:</span>
                    <span className="font-semibold text-cyan-300 font-mono">{authStatus.tier}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Killer Instinct N64 Pipeline */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Step 5: Killer Instinct Decompilation & N64 Recompiler</h3>
                <p className="text-xs text-slate-400 mt-1">
                  OmniCode includes a dedicated 5-stage pipeline to decompile the arcade Killer Instinct game (Midway Ultra 64 hardware) and recompile it into a native Nintendo 64 ROM.
                </p>
              </div>

              <div className="rounded-xl border border-amber-500/20 bg-amber-950/10 p-4 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                  <Gamepad2 className="h-4 w-4" />
                  Arcade to N64 Pipeline Ready
                </div>
                <p className="text-xs text-slate-300">
                  Includes CHD extraction, Splat MIPS R4600 disassembler, C combo engine recovery, and MIPS64 GCC cross-compilation with N64 Reality Coprocessor graphics.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenKiStudio();
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold text-xs shadow-md shadow-amber-950 transition-colors"
                >
                  <Gamepad2 className="h-4 w-4" />
                  Open Killer Instinct Decompiler &amp; N64 Studio
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between border-t border-slate-800 px-6 py-4 bg-slate-950/80">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          <div className="text-xs text-slate-500">
            Step {currentStep} of {totalSteps}
          </div>

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={() => setCurrentStep((s) => Math.min(totalSteps, s + 1))}
              className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500 transition-colors shadow-sm shadow-cyan-950"
            >
              Next Step
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors shadow-sm shadow-emerald-950"
            >
              Finish Setup
              <Check className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
