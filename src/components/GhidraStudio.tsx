import React, { useState } from 'react';
import {
  Binary,
  Play,
  FileCode,
  FolderOpen,
  RefreshCw,
  Search,
  Code2,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';
import { GHIDRA_ARCHITECTURES } from '../data/presets';
import { GhidraArch, WorkspaceFile } from '../types';

interface GhidraStudioProps {
  files: WorkspaceFile[];
  onExecuteCommand: (command: string) => Promise<any>;
}

export const GhidraStudio: React.FC<GhidraStudioProps> = ({
  files,
  onExecuteCommand,
}) => {
  const [selectedArch, setSelectedArch] = useState<GhidraArch>(GHIDRA_ARCHITECTURES[0]);
  const [targetBinary, setTargetBinary] = useState('roms/pacman/pacman.6e');
  const [projectName, setProjectName] = useState('arcade_pacman');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'decomp' | 'symbols' | 'script'>('decomp');

  const [discoveredFunctions, setDiscoveredFunctions] = useState([
    { name: 'entry_main', address: '0x0000', size: 124, params: 0, calls: 8 },
    { name: 'irq_vblank_handler', address: '0x0038', size: 68, params: 0, calls: 3 },
    { name: 'init_hardware_video', address: '0x0114', size: 210, params: 2, calls: 5 },
    { name: 'ghost_ai_scatter_chase', address: '0x02AB', size: 450, params: 1, calls: 12 },
    { name: 'player_collision_check', address: '0x0540', size: 180, params: 2, calls: 4 },
    { name: 'update_score_bcd', address: '0x08A2', size: 96, params: 2, calls: 2 },
  ]);

  const [decompiledC, setDecompiledC] = useState(`// Ghidra Headless Decompiler Output
// Binary: pacman.6e (Z80 16-bit)
// Function: ghost_ai_scatter_chase (0x02AB)

void ghost_ai_scatter_chase(uint8_t ghost_index) {
    uint8_t mode = mem_read(0x4D00 + ghost_index);
    uint16_t target_x = 0;
    uint16_t target_y = 0;

    if (mode == MODE_CHASE) {
        // Red Ghost (Blinky): Targets Pac-Man's exact tile
        if (ghost_index == BLINKY) {
            target_x = mem_read(PACMAN_X_TILE);
            target_y = mem_read(PACMAN_Y_TILE);
        }
        // Pink Ghost (Pinky): 4 tiles ahead of Pac-Man's orientation
        else if (ghost_index == PINKY) {
            uint8_t dir = mem_read(PACMAN_DIR);
            target_x = mem_read(PACMAN_X_TILE) + (dir_offset_x[dir] * 4);
            target_y = mem_read(PACMAN_Y_TILE) + (dir_offset_y[dir] * 4);
        }
    } else {
        // Scatter Mode: Return to home corner
        target_x = home_corner_x[ghost_index];
        target_y = home_corner_y[ghost_index];
    }

    calculate_next_tile_direction(ghost_index, target_x, target_y);
}
`);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    const cmd = `analyzeHeadless C:\\dev\\ghidra_projects ${projectName} -import ${targetBinary} -processor ${selectedArch.id} -postScript scripts/ghidra_analyze_rom.py`;
    try {
      await onExecuteCommand(cmd);
    } catch (e) {
      // handled
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden font-sans text-xs">
      {/* Top Bar */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-950/80 border border-purple-700/60 text-purple-400">
            <Binary className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <span>Ghidra Headless Station</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800 font-mono">
                analyzeHeadless.bat
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              Autonomous ROM reverse engineering, function decompilation, and symbol recovery.
            </p>
          </div>
        </div>

        <button
          onClick={handleRunAnalysis}
          disabled={isAnalyzing}
          className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded font-medium flex items-center gap-1.5 shadow-sm transition-colors"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing ROM...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Decompile ROM Headlessly</span>
            </>
          )}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Config Panel */}
        <div className="w-80 border-r border-slate-800 p-4 space-y-4 overflow-y-auto bg-slate-900/30">
          <div>
            <label className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
              Target Architecture (Sleigh)
            </label>
            <div className="space-y-1.5 mt-2">
              {GHIDRA_ARCHITECTURES.map((arch) => (
                <div
                  key={arch.id}
                  onClick={() => setSelectedArch(arch)}
                  className={`p-2 rounded-lg border cursor-pointer transition-all ${
                    selectedArch.id === arch.id
                      ? 'bg-purple-950/50 border-purple-600 text-purple-200'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="font-semibold text-slate-100 text-xs">{arch.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{arch.description}</div>
                  <div className="font-mono text-[9px] text-purple-400 mt-1">ID: {arch.id}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-3 space-y-3">
            <div>
              <span className="text-slate-400">Target Binary / ROM:</span>
              <input
                type="text"
                value={targetBinary}
                onChange={(e) => setTargetBinary(e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs font-mono"
              />
            </div>

            <div>
              <span className="text-slate-400">Ghidra Project Name:</span>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Right Output View */}
        <div className="flex-1 flex flex-col h-full bg-slate-950">
          <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('decomp')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  activeTab === 'decomp'
                    ? 'bg-purple-950 text-purple-300 border border-purple-800'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                C Pseudocode Output
              </button>

              <button
                onClick={() => setActiveTab('symbols')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  activeTab === 'symbols'
                    ? 'bg-purple-950 text-purple-300 border border-purple-800'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Recovered Functions ({discoveredFunctions.length})
              </button>

              <button
                onClick={() => setActiveTab('script')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  activeTab === 'script'
                    ? 'bg-purple-950 text-purple-300 border border-purple-800'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Headless Python Script
              </button>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-hidden">
            {activeTab === 'decomp' && (
              <textarea
                value={decompiledC}
                onChange={(e) => setDecompiledC(e.target.value)}
                className="w-full h-full bg-slate-900/90 border border-slate-800 rounded-lg p-3 text-purple-300 font-mono text-xs focus:outline-none focus:border-purple-600 resize-none leading-relaxed"
              />
            )}

            {activeTab === 'symbols' && (
              <div className="h-full bg-slate-900/90 border border-slate-800 rounded-lg overflow-hidden flex flex-col">
                <div className="p-2 border-b border-slate-800 bg-slate-950/60 grid grid-cols-5 text-[11px] font-semibold text-slate-400 font-mono">
                  <span>FUNCTION</span>
                  <span>ADDRESS</span>
                  <span>BYTES</span>
                  <span>PARAMS</span>
                  <span>CALLS</span>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 font-mono text-xs">
                  {discoveredFunctions.map((fn, idx) => (
                    <div key={idx} className="p-2 grid grid-cols-5 hover:bg-slate-800/50 items-center">
                      <span className="text-purple-300 font-medium">{fn.name}</span>
                      <span className="text-cyan-400">{fn.address}</span>
                      <span className="text-slate-400">{fn.size} B</span>
                      <span className="text-slate-400">{fn.params}</span>
                      <span className="text-emerald-400">{fn.calls}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'script' && (
              <div className="h-full bg-slate-900/90 border border-slate-800 rounded-lg p-3 font-mono text-xs overflow-y-auto text-slate-300 whitespace-pre-wrap leading-relaxed">
                {files.find((f) => f.path.includes('ghidra_analyze_rom.py'))?.content ||
                  '# Ghidra Python Script (scripts/ghidra_analyze_rom.py)'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
