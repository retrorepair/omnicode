import React, { useState, useEffect } from 'react';
import {
  X,
  Wrench,
  Search,
  Download,
  CheckCircle2,
  AlertCircle,
  FolderSearch,
  RefreshCw,
  Cpu,
  Terminal,
  ShieldCheck,
  Zap,
  FolderOpen,
  ArrowRight,
  HardDrive
} from 'lucide-react';

interface ToolStatus {
  id: string;
  name: string;
  status: 'installed' | 'missing' | 'installing';
  version: string;
  path: string;
}

interface RomSearchResult {
  name: string;
  path: string;
  sizeMB: number;
  type: string;
  verified?: boolean;
}

interface AutonomousToolManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMountDirectory: (path: string, name?: string) => void;
  onSetChdPath?: (path: string) => void;
}

export const AutonomousToolManagerModal: React.FC<AutonomousToolManagerModalProps> = ({
  isOpen,
  onClose,
  onMountDirectory,
  onSetChdPath,
}) => {
  const [activeTab, setActiveTab] = useState<'project_tools' | 'auto_setup' | 'search' | 'tools'>('project_tools');
  
  // Project-based tools resolution state
  const [selectedProjectProfile, setSelectedProjectProfile] = useState<string>('kinst_n64');
  const [projectResolveLoading, setProjectResolveLoading] = useState(false);
  const [projectRequirements, setProjectRequirements] = useState<{
    projectType: string;
    requiredTools: Array<{ id: string; name: string; neededFor: string }>;
    missingTools: string[];
    actionsExecuted: string[];
  }>({
    projectType: 'Killer Instinct Arcade to N64 Port / VR4300 Decompilation',
    requiredTools: [
      { id: 'splat', name: 'Splat MIPS Disassembler', neededFor: 'Binary Disassembly & Section Splitting' },
      { id: 'n64toolchain', name: 'MIPS64-ELF GCC (VR4300)', neededFor: 'N64 Native Cross-Compilation' },
      { id: 'chdman', name: 'MAME CHDMAN', neededFor: 'Arcade Disk Image Extraction (.chd)' },
      { id: 'mame', name: 'MAME Arcade Emulator', neededFor: 'Arcade Baseline Emulation & Lua Hooking' },
      { id: 'python', name: 'Python 3.11', neededFor: 'Splat64 Disassembly Scripts' },
      { id: 'git', name: 'Git for Windows', neededFor: 'Repository Management & Asset Tracking' },
      { id: 'mingw', name: 'MinGW-w64 GCC', neededFor: 'Local Asset Conversion & Utilities' },
    ],
    missingTools: ['splat', 'n64toolchain'],
    actionsExecuted: [],
  });
  
  // Tools state
  const [tools, setTools] = useState<ToolStatus[]>([
    { id: 'git', name: 'Git for Windows', status: 'installed', version: '2.44.0', path: 'C:\\Program Files\\Git\\cmd\\git.exe' },
    { id: 'mingw', name: 'MinGW-w64 GCC', status: 'installed', version: '13.2.0', path: 'C:\\msys64\\ucrt64\\bin\\gcc.exe' },
    { id: 'mame', name: 'MAME Arcade Emulator', status: 'installed', version: '0.264', path: 'C:\\mame\\mame.exe' },
    { id: 'python', name: 'Python 3.11', status: 'installed', version: '3.11.8', path: 'C:\\Python311\\python.exe' },
    { id: 'splat', name: 'Splat MIPS Disassembler', status: 'installed', version: '0.22.0', path: 'C:\\Python311\\Scripts\\splat.exe' },
    { id: 'chdman', name: 'MAME CHDMAN Tool', status: 'installed', version: '0.264', path: 'C:\\mame\\chdman.exe' },
    { id: 'mips64', name: 'MIPS64-ELF GCC (N64)', status: 'installed', version: '10.2.0-vr4300', path: 'C:\\tools\\n64chain\\bin\\mips64-elf-gcc.exe' },
    { id: 'ghidra', name: 'NSA Ghidra SRE', status: 'installed', version: '11.0 PUBLIC', path: 'C:\\tools\\ghidra\\support\\analyzeHeadless.bat' },
  ]);
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [installLogs, setInstallLogs] = useState<string[]>([]);

  // ROM search state
  const [searchQuery, setSearchQuery] = useState('kinst');
  const [searchRoot, setSearchRoot] = useState('C:\\');
  const [isSearching, setIsSearching] = useState(false);
  const [foundFiles, setFoundFiles] = useState<RomSearchResult[]>([
    {
      name: 'kinst.chd',
      path: 'D:\\arcade\\roms\\kinst\\kinst.chd',
      sizeMB: 104.8,
      type: 'MAME CHD Disk Image v4',
      verified: true,
    },
    {
      name: 'u98-l10.bin',
      path: 'D:\\arcade\\roms\\kinst\\u98-l10.bin',
      sizeMB: 0.5,
      type: 'Killer Instinct Boot EPROM v1.5d',
      verified: true,
    },
    {
      name: 'kinst.zip',
      path: 'D:\\arcade\\roms\\kinst.zip',
      sizeMB: 6.2,
      type: 'MAME Arcade ROM Archive',
      verified: true,
    },
    {
      name: 'kinst2.chd',
      path: 'D:\\arcade\\roms\\kinst2\\kinst2.chd',
      sizeMB: 142.1,
      type: 'Killer Instinct 2 Arcade CHD Image',
      verified: true,
    },
  ]);

  // Auto setup state
  const [autoSetupWorkingDir, setAutoSetupWorkingDir] = useState('C:\\dev\\kinst_n64');
  const [autoSetupRunning, setAutoSetupRunning] = useState(false);
  const [autoSetupSteps, setAutoSetupSteps] = useState<string[]>([]);
  const [autoSetupDone, setAutoSetupDone] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchToolStatuses();
    }
  }, [isOpen]);

  const fetchToolStatuses = async () => {
    try {
      const res = await fetch('/api/tools/status');
      if (res.ok) {
        const data = await res.json();
        if (data.tools) setTools(data.tools);
      }
    } catch (e) {
      console.warn('Could not fetch tools status', e);
    }
  };

  const handleInstallTool = async (toolId: string) => {
    setInstallingId(toolId);
    setInstallLogs((prev) => [...prev, `[Installing] Requesting autonomous provision of ${toolId} via winget/PowerShell...`]);
    try {
      const res = await fetch('/api/tools/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolId }),
      });
      const data = await res.json();
      if (data.success) {
        setInstallLogs((prev) => [
          ...prev,
          `[OK] Executed: ${data.commandExecuted}`,
          `[OK] ${data.message || 'Tool provisioned successfully.'}`,
        ]);
        setTools((prev) =>
          prev.map((t) => (t.id === toolId ? { ...t, status: 'installed' } : t))
        );
      } else {
        setInstallLogs((prev) => [...prev, `[Error] Failed to install ${toolId}: ${data.error || 'Unknown error'}`]);
      }
    } catch (err: any) {
      setInstallLogs((prev) => [...prev, `[Error] Network error during tool installation: ${err.message}`]);
    } finally {
      setInstallingId(null);
    }
  };

  const handleSearchRoms = async () => {
    setIsSearching(true);
    try {
      const res = await fetch('/api/roms/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: searchQuery, searchRoot }),
      });
      const data = await res.json();
      if (data.filesFound) {
        setFoundFiles(data.filesFound);
      }
    } catch (e) {
      console.warn('Search error', e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResolveProjectTools = async (profileKey: string, autoInstall: boolean = false) => {
    setProjectResolveLoading(true);
    try {
      const pathToScan = profileKey === 'kinst_n64' 
        ? 'C:\\dev\\kinst_n64' 
        : profileKey === 'mame_arcade' 
        ? 'C:\\dev\\mame-arcade' 
        : 'C:\\dev\\gameboy_z80';

      const res = await fetch('/api/tools/resolve-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectPath: pathToScan, autoInstall }),
      });
      const data = await res.json();
      if (data.success) {
        setProjectRequirements({
          projectType: data.projectType,
          requiredTools: data.requiredTools || [],
          missingTools: autoInstall ? [] : (data.missingTools || []),
          actionsExecuted: data.actionsExecuted || [],
        });
        if (autoInstall) {
          // refresh general tools list as well
          fetchToolStatuses();
        }
      }
    } catch (err: any) {
      console.warn('Error resolving project requirements', err);
    } finally {
      setProjectResolveLoading(false);
    }
  };

  const handleRunAutoSetup = async () => {
    setAutoSetupRunning(true);
    setAutoSetupDone(false);
    setAutoSetupSteps([
      'Probing Windows x64 Native System Environment...',
      'Checking toolchain prerequisites (Git, MinGW, Python, MAME, Ghidra, Splat, N64 VR4300 GCC)...',
    ]);

    try {
      const res = await fetch('/api/setup/auto-configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workingDirectory: autoSetupWorkingDir }),
      });
      const data = await res.json();
      if (data.actionsCompleted) {
        setAutoSetupSteps(data.actionsCompleted);
        setAutoSetupDone(true);
        onMountDirectory(autoSetupWorkingDir, 'Killer Instinct N64 Project');
      }
    } catch (err: any) {
      setAutoSetupSteps((prev) => [...prev, `Error during auto setup: ${err.message}`]);
    } finally {
      setAutoSetupRunning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/90">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                Autonomous Workstation Setup &amp; ROM Finder
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  x64 Native
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Self-installs required tools, scans PC drives for ROMs/CHDs, and configures the workspace with zero manual friction
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-6">
          <button
            onClick={() => setActiveTab('project_tools')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 text-xs font-medium transition-colors ${
              activeTab === 'project_tools'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="h-4 w-4" />
            Project Required Tools
            {projectRequirements.missingTools.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {projectRequirements.missingTools.length} missing
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('auto_setup')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 text-xs font-medium transition-colors ${
              activeTab === 'auto_setup'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="h-4 w-4" />
            Autonomous 1-Click Setup
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 text-xs font-medium transition-colors ${
              activeTab === 'search'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderSearch className="h-4 w-4" />
            Scan PC for ROMs &amp; Files
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 text-xs font-medium transition-colors ${
              activeTab === 'tools'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wrench className="h-4 w-4" />
            All Tools ({tools.filter((t) => t.status === 'installed').length}/{tools.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 0: Project Required Tools */}
          {activeTab === 'project_tools' && (
            <div className="space-y-5">
              <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-blue-200">
                      Dynamic Project Dependency Resolver &amp; On-Demand Toolchain
                    </h3>
                    <p className="text-xs text-blue-300/80 mt-1">
                      OmniCode automatically analyzes your current project files (Makefiles, disassembler configs, ROMs, target CPU architecture) and identifies exactly which tools are needed. If any tool is missing from your PC, OmniCode can autonomously download and install it via <code>winget</code> or portable toolchains without manual setup.
                    </p>
                  </div>
                </div>
              </div>

              {/* Project Selector & Actions */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Active Project Profile
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedProjectProfile}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSelectedProjectProfile(val);
                          handleResolveProjectTools(val, false);
                        }}
                        className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-blue-500"
                      >
                        <option value="kinst_n64">Killer Instinct Arcade → N64 Port (VR4300 / MIPS)</option>
                        <option value="mame_arcade">MAME Arcade Automation &amp; Driver Dev</option>
                        <option value="gameboy_z80">Game Boy / Z80 Assembly Decompilation</option>
                      </select>
                      <button
                        onClick={() => handleResolveProjectTools(selectedProjectProfile, false)}
                        disabled={projectResolveLoading}
                        className="p-2 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs"
                        title="Re-scan project requirements"
                      >
                        <RefreshCw className={`h-4 w-4 ${projectResolveLoading ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 sm:pt-0">
                    {projectRequirements.missingTools.length > 0 ? (
                      <button
                        onClick={() => handleResolveProjectTools(selectedProjectProfile, true)}
                        disabled={projectResolveLoading}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs shadow-lg shadow-amber-950 transition-all cursor-pointer"
                      >
                        <Download className="h-4 w-4" />
                        Auto-Install {projectRequirements.missingTools.length} Missing Tools for This Project
                      </button>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-medium">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        All Project Requirements Satisfied
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-xs text-slate-400 flex items-center gap-2 border-t border-slate-800/80 pt-3">
                  <span className="font-semibold text-slate-300">Detected Profile:</span>
                  <span className="text-blue-300 font-medium">{projectRequirements.projectType}</span>
                </div>
              </div>

              {/* Required Tools Grid for this Project */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-blue-400" />
                    Project-Specific Toolchain Dependencies ({projectRequirements.requiredTools.length})
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Missing: {projectRequirements.missingTools.length}
                  </span>
                </div>

                <div className="divide-y divide-slate-800/80">
                  {projectRequirements.requiredTools.map((req) => {
                    const isMissing = projectRequirements.missingTools.includes(req.id);
                    return (
                      <div key={req.id} className="flex items-center justify-between p-3.5 hover:bg-slate-900/40 transition-colors">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-200">{req.name}</span>
                            {isMissing ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                Missing from Host
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                <CheckCircle2 className="h-3 w-3" />
                                Available
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                            <span className="text-slate-500">Needed for:</span>
                            <span className="text-slate-300 font-mono text-[10px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                              {req.neededFor}
                            </span>
                          </div>
                        </div>

                        <div>
                          {isMissing ? (
                            <button
                              onClick={() => handleInstallTool(req.id)}
                              disabled={installingId === req.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
                            >
                              {installingId === req.id ? (
                                <RefreshCw className="h-3 w-3 animate-spin" />
                              ) : (
                                <Download className="h-3 w-3" />
                              )}
                              Auto-Install Tool
                            </button>
                          ) : (
                            <span className="text-xs text-slate-500 font-mono">Ready</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Auto Install Log */}
              {projectRequirements.actionsExecuted.length > 0 && (
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 font-mono text-[11px] text-slate-300 space-y-1.5">
                  <div className="text-xs font-semibold text-slate-200 border-b border-slate-800 pb-1.5 mb-2">
                    Dependency Resolution Activity
                  </div>
                  {projectRequirements.actionsExecuted.map((act, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-300">
                      <span className="text-emerald-400">✓</span>
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 1: Autonomous 1-Click Setup */}
          {activeTab === 'auto_setup' && (
            <div className="space-y-5">
              <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-blue-200">Zero-Friction Autonomous Workstation Configuration</h3>
                    <p className="text-xs text-blue-300/80 mt-1">
                      You only need to specify your desired working folder (or leave the default). The autonomous agent will automatically verify or install MinGW, Splat, Python, MIPS64 GCC, initialize your repository, and map all pipeline paths automatically.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Target Working Directory on your PC
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={autoSetupWorkingDir}
                      onChange={(e) => setAutoSetupWorkingDir(e.target.value)}
                      placeholder="e.g. C:\dev\kinst_n64 or D:\EmulationDev"
                      className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => setAutoSetupWorkingDir('D:\\dev\\kinst_n64')}
                      className="px-3 py-2 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-xs text-slate-400"
                    >
                      D:\ Drive
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-400">
                    Will auto-install missing packages using <code>winget</code> and <code>pip</code>.
                  </span>
                  <button
                    onClick={handleRunAutoSetup}
                    disabled={autoSetupRunning}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-xs shadow-lg shadow-blue-950 transition-all"
                  >
                    {autoSetupRunning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                    {autoSetupRunning ? 'Configuring System...' : 'Run Autonomous Setup Now'}
                  </button>
                </div>
              </div>

              {/* Progress and Execution Steps */}
              {autoSetupSteps.length > 0 && (
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                      <Terminal className="h-3.5 w-3.5 text-blue-400" />
                      Autonomous Configuration Log
                    </span>
                    {autoSetupDone && (
                      <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Setup Complete
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    {autoSetupSteps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-slate-300">
                        <span className="text-blue-400 shrink-0">✓</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Scan PC for ROMs & Files */}
          {activeTab === 'search' && (
            <div className="space-y-5">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      ROM / File Search Keyword
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for 'kinst', 'arcade', 'chd', 'roms', etc."
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 pl-9 pr-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Search Drive / Root
                    </label>
                    <select
                      value={searchRoot}
                      onChange={(e) => setSearchRoot(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      <option value="C:\">C:\ (Main System)</option>
                      <option value="D:\">D:\ (Secondary / Storage)</option>
                      <option value="E:\">E:\ (External / Flash)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-xs text-slate-400">
                    Recursively indexes disk images (.chd), boot EPROMs (.bin), and arcade archives (.zip).
                  </span>
                  <button
                    onClick={handleSearchRoms}
                    disabled={isSearching}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-medium transition-colors"
                  >
                    {isSearching ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                    {isSearching ? 'Scanning Local Drives...' : 'Scan Drives'}
                  </button>
                </div>
              </div>

              {/* Found Files List */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/60">
                  <span className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-cyan-400" />
                    Found ROM &amp; Disk Files ({foundFiles.length})
                  </span>
                </div>
                <div className="divide-y divide-slate-800/80">
                  {foundFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 hover:bg-slate-900/40 transition-colors">
                      <div className="min-w-0 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-200">{file.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {file.sizeMB} MB
                          </span>
                          <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                            {file.type}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 truncate mt-1">
                          {file.path}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {file.name.endsWith('.chd') && onSetChdPath && (
                          <button
                            onClick={() => {
                              onSetChdPath(file.path);
                              onClose();
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
                          >
                            Set as KI Input
                          </button>
                        )}
                        <button
                          onClick={() => {
                            const parentDir = file.path.substring(0, file.path.lastIndexOf('\\'));
                            onMountDirectory(parentDir, file.name);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs transition-colors"
                        >
                          <FolderOpen className="h-3.5 w-3.5" />
                          Mount Folder
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Toolchain Manager */}
          {activeTab === 'tools' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Native Windows packages managed autonomously through <code>winget</code> and portable zip extraction.
                </p>
                <button
                  onClick={() => handleInstallTool('all')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  Auto-Install All Missing
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tools.map((tool) => (
                  <div
                    key={tool.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-950"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-200">{tool.name}</span>
                        {tool.status === 'installed' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            <CheckCircle2 className="h-3 w-3" />
                            Installed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            Missing
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-1 truncate max-w-xs">
                        {tool.path}
                      </div>
                    </div>

                    <div>
                      {tool.status === 'installed' ? (
                        <span className="text-[11px] font-mono text-slate-500">{tool.version}</span>
                      ) : (
                        <button
                          onClick={() => handleInstallTool(tool.id)}
                          disabled={installingId === tool.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/90 hover:bg-blue-500 text-white text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          {installingId === tool.id ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <Download className="h-3 w-3" />
                          )}
                          Install
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Install Terminal Logs */}
              {installLogs.length > 0 && (
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] text-slate-300 space-y-1">
                  <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">
                    Installation Output
                  </div>
                  {installLogs.map((log, i) => (
                    <div key={i}>{log}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 px-6 py-4 bg-slate-950/90">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Native Windows Process &amp; Winget Integration Active
          </div>
          <button
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
