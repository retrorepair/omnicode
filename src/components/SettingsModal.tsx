import React, { useState } from 'react';
import {
  X,
  Sliders,
  Sparkles,
  Server,
  Wrench,
  Gamepad2,
  Check,
  RotateCcw,
  ShieldCheck,
  FolderOpen
} from 'lucide-react';
import { AppSettings, GeminiAuthStatus } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  authStatus: GeminiAuthStatus;
  onSaveSettings: (newSettings: AppSettings) => void;
  onUpdateAuth: (apiKey?: string, model?: string) => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  authStatus,
  onSaveSettings,
  onUpdateAuth,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'gemini' | 'host' | 'toolchains' | 'ki'>('general');
  const [localSettings, setLocalSettings] = useState<AppSettings>({ ...settings });
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(localSettings);
    if (apiKeyInput.trim() || localSettings.preferredModel !== authStatus.model) {
      await onUpdateAuth(apiKeyInput ? apiKeyInput.trim() : undefined, localSettings.preferredModel);
    }
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 1000);
  };

  const handleReset = () => {
    setLocalSettings({
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
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden flex flex-col h-[78vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-200 border border-slate-700">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">OmniCode Settings</h2>
              <p className="text-xs text-slate-400">Configure global workstation, toolchains, and AI execution</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body with Sidebar Tabs */}
        <div className="flex flex-1 overflow-hidden">
          {/* Settings Tabs Sidebar */}
          <div className="w-56 border-r border-slate-800 bg-slate-950/50 p-3 space-y-1 overflow-y-auto">
            {[
              { id: 'general', label: 'General & UI', icon: Sliders },
              { id: 'gemini', label: 'Gemini AI Engine', icon: Sparkles },
              { id: 'host', label: 'Local PC Bridge', icon: Server },
              { id: 'toolchains', label: 'Toolchain Paths', icon: Wrench },
              { id: 'ki', label: 'Killer Instinct N64', icon: Gamepad2 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Settings Tab Content */}
          <form onSubmit={handleSave} className="flex-1 p-6 overflow-y-auto space-y-5 bg-slate-900">
            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-2">
                  <h3 className="text-sm font-semibold text-slate-100">General Workspace &amp; Runtime</h3>
                  <p className="text-xs text-slate-400">Configure theme, automation loops, and notifications</p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950/60">
                    <div>
                      <div className="font-semibold text-slate-200">Autonomous Compiler Error Auto-Fix</div>
                      <div className="text-[11px] text-slate-400">When GCC or Make yields compilation errors, agent automatically inspects and corrects code</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={localSettings.autoRetryCompilerErrors}
                      onChange={(e) => setLocalSettings({ ...localSettings, autoRetryCompilerErrors: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950/60">
                    <div>
                      <div className="font-semibold text-slate-200">Default Terminal Shell</div>
                      <div className="text-[11px] text-slate-400">Shell used for executing native host command line tasks</div>
                    </div>
                    <select
                      value={localSettings.defaultShell}
                      onChange={(e) => setLocalSettings({ ...localSettings, defaultShell: e.target.value as any })}
                      className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="powershell">Windows PowerShell</option>
                      <option value="cmd">Command Prompt (cmd.exe)</option>
                      <option value="bash">Git Bash / MSYS2</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950/60">
                    <div>
                      <div className="font-semibold text-slate-200">Desktop Notifications</div>
                      <div className="text-[11px] text-slate-400">Notify upon MAME test run completion or N64 ROM build success</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={localSettings.desktopNotifications}
                      onChange={(e) => setLocalSettings({ ...localSettings, desktopNotifications: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Gemini AI Tab */}
            {activeTab === 'gemini' && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-2">
                  <h3 className="text-sm font-semibold text-slate-100">Gemini AI Configuration</h3>
                  <p className="text-xs text-slate-400">Manage autonomous intelligence model and authentication</p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-200 block mb-1">Reasoning Model</label>
                    <select
                      value={localSettings.preferredModel}
                      onChange={(e) => setLocalSettings({ ...localSettings, preferredModel: e.target.value })}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none font-mono"
                    >
                      <option value="gemini-3.8-flash">gemini-3.8-flash (Recommended - High Speed Multi-Tool)</option>
                      <option value="gemini-2.5-pro">gemini-2.5-pro (Deep Disassembly &amp; Complex Decomp)</option>
                      <option value="gemini-2.5-flash">gemini-2.5-flash (Fast Lightweight Testing)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-200 block mb-1">Custom Gemini API Key Override (Optional)</label>
                    <input
                      type="password"
                      placeholder="Leave blank to use pre-configured Google AI Studio key"
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-200 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block">Active Status:</span>
                      <span className="font-medium text-emerald-400">{authStatus.signedIn ? 'Connected' : 'Offline'} ({authStatus.authMethod})</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block">Quota Tier:</span>
                      <span className="font-medium text-slate-200">{authStatus.tier}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Local Host Bridge Tab */}
            {activeTab === 'host' && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-2">
                  <h3 className="text-sm font-semibold text-slate-100">Local PC Host Bridge (Companion)</h3>
                  <p className="text-xs text-slate-400">Settings for communicating with the background daemon on port 4040</p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-200 block mb-1">Companion Port</label>
                    <input
                      type="number"
                      value={localSettings.companionPort}
                      onChange={(e) => setLocalSettings({ ...localSettings, companionPort: parseInt(e.target.value) || 4040 })}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-200 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950/60">
                    <div>
                      <div className="font-semibold text-slate-200">Auto-Connect on Startup</div>
                      <div className="text-[11px] text-slate-400">Automatically probe http://localhost:4040 when the application opens</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={localSettings.companionAutoConnect}
                      onChange={(e) => setLocalSettings({ ...localSettings, companionAutoConnect: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Toolchain Paths Tab */}
            {activeTab === 'toolchains' && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-2">
                  <h3 className="text-sm font-semibold text-slate-100">Toolchain &amp; Binary Executable Paths</h3>
                  <p className="text-xs text-slate-400">Explicit file locations on your Windows machine</p>
                </div>

                <div className="space-y-3 text-xs">
                  {[
                    { key: 'mamePath', label: 'MAME Emulator Executable', placeholder: 'C:\\tools\\mame\\mame.exe' },
                    { key: 'ghidraPath', label: 'Ghidra analyzeHeadless.bat', placeholder: 'C:\\tools\\ghidra\\support\\analyzeHeadless.bat' },
                    { key: 'mingwPath', label: 'MinGW-w64 GCC Compiler', placeholder: 'C:\\tools\\mingw64\\bin\\gcc.exe' },
                    { key: 'gitPath', label: 'Git Executable', placeholder: 'C:\\Program Files\\Git\\bin\\git.exe' },
                    { key: 'mips64Path', label: 'N64 MIPS64 GCC (mips64-elf-gcc)', placeholder: 'C:\\tools\\n64chain\\bin\\mips64-elf-gcc.exe' },
                    { key: 'splatPath', label: 'Splat Disassembly Script', placeholder: 'C:\\tools\\splat\\split.py' },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="font-semibold text-slate-200 block mb-1">{field.label}</label>
                      <input
                        type="text"
                        value={(localSettings as any)[field.key]}
                        onChange={(e) => setLocalSettings({ ...localSettings, [field.key]: e.target.value })}
                        placeholder={field.placeholder}
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-mono text-cyan-300 focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Killer Instinct & N64 Pipeline Tab */}
            {activeTab === 'ki' && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-2">
                  <h3 className="text-sm font-semibold text-slate-100">Killer Instinct Arcade &amp; N64 Pipeline Settings</h3>
                  <p className="text-xs text-slate-400">Configure CHD extraction, boot ROM, and target N64 ROM parameters</p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-200 block mb-1">Killer Instinct Arcade CHD Path</label>
                    <input
                      type="text"
                      value={localSettings.chdPath}
                      onChange={(e) => setLocalSettings({ ...localSettings, chdPath: e.target.value })}
                      placeholder="D:\arcade\roms\kinst\kinst.chd"
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-mono text-amber-300 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-200 block mb-1">Boot EPROM (u98-l10.bin) Path</label>
                    <input
                      type="text"
                      value={localSettings.bootRomPath}
                      onChange={(e) => setLocalSettings({ ...localSettings, bootRomPath: e.target.value })}
                      placeholder="D:\arcade\roms\kinst\u98-l10.bin"
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-mono text-amber-300 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-200 block mb-1">N64 ROM Format</label>
                      <select
                        value={localSettings.n64RomFormat}
                        onChange={(e) => setLocalSettings({ ...localSettings, n64RomFormat: e.target.value as any })}
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="z64">.z64 (Big Endian - Native N64 standard)</option>
                        <option value="n64">.n64 (Little Endian / PC byte order)</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-200 block mb-1">Output Directory</label>
                      <input
                        type="text"
                        value={localSettings.n64OutputPath}
                        onChange={(e) => setLocalSettings({ ...localSettings, n64OutputPath: e.target.value })}
                        placeholder="C:\dev\kinst_n64\build"
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-mono text-slate-200 focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {savedNotice && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Settings saved successfully!
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Defaults
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500 transition-colors shadow-sm shadow-cyan-950"
                >
                  <Check className="h-4 w-4" />
                  Save Settings
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
