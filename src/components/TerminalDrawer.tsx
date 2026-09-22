import React, { useState, useRef, useEffect } from 'react';
import {
  Terminal,
  Send,
  Trash2,
  Maximize2,
  Minimize2,
  ChevronRight,
  Code,
} from 'lucide-react';
import { ShellType } from '../types';

interface TerminalDrawerProps {
  onExecute: (cmd: string, shell: ShellType) => Promise<any>;
  workspacePath: string;
}

export const TerminalDrawer: React.FC<TerminalDrawerProps> = ({
  onExecute,
  workspacePath,
}) => {
  const [shell, setShell] = useState<ShellType>('powershell');
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [lines, setLines] = useState<Array<{ text: string; type: 'cmd' | 'out' | 'err' }>>([
    { text: 'Windows PowerShell v7.4.1 [OmniCode Shell Engine]', type: 'out' },
    { text: `PS ${workspacePath}> # Ready to accept MAME, Ghidra, MinGW, Git, and system commands`, type: 'out' },
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isRunning) return;

    const cmd = inputVal.trim();
    setInputVal('');
    setHistory((prev) => [...prev, cmd]);
    setHistoryIdx(-1);

    const promptPrefix = shell === 'powershell' ? `PS ${workspacePath}> ` : `C:${workspacePath}> `;
    setLines((prev) => [...prev, { text: `${promptPrefix}${cmd}`, type: 'cmd' }]);
    setIsRunning(true);

    try {
      const res = await onExecute(cmd, shell);
      if (res && res.output) {
        setLines((prev) => [...prev, { text: res.output, type: 'out' }]);
      } else if (res && res.error) {
        setLines((prev) => [...prev, { text: res.error, type: 'err' }]);
      } else {
        setLines((prev) => [...prev, { text: `Command completed with exit code 0.`, type: 'out' }]);
      }
    } catch (err: any) {
      setLines((prev) => [...prev, { text: err.message || 'Error executing command', type: 'err' }]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      if (history.length === 0) return;
      const nextIdx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(nextIdx);
      setInputVal(history[nextIdx]);
    } else if (e.key === 'ArrowDown') {
      if (historyIdx === -1) return;
      const nextIdx = historyIdx + 1;
      if (nextIdx >= history.length) {
        setHistoryIdx(-1);
        setInputVal('');
      } else {
        setHistoryIdx(nextIdx);
        setInputVal(history[nextIdx]);
      }
    }
  };

  const quickCommands = [
    'mame pacman -window -autoboot_script pacman/mame_autoboot.lua',
    'make all',
    'git status',
    'analyzeHeadless C:\\dev\\ghidra_projects pacman_test -import roms/pacman/pacman.6e',
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 font-mono text-xs overflow-hidden">
      {/* Terminal Title Bar */}
      <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <div className="flex items-center gap-1.5 font-semibold text-slate-200">
            <span>Terminal</span>
            <span className="text-slate-500 font-normal">|</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 rounded p-0.5 border border-slate-800 text-[11px]">
            <button
              onClick={() => setShell('powershell')}
              className={`px-2 py-0.5 rounded transition-colors ${
                shell === 'powershell' ? 'bg-cyan-900 text-cyan-200 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              PowerShell
            </button>
            <button
              onClick={() => setShell('cmd')}
              className={`px-2 py-0.5 rounded transition-colors ${
                shell === 'cmd' ? 'bg-cyan-900 text-cyan-200 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Command Prompt
            </button>
            <button
              onClick={() => setShell('bash')}
              className={`px-2 py-0.5 rounded transition-colors ${
                shell === 'bash' ? 'bg-cyan-900 text-cyan-200 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Git Bash
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLines([])}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-colors"
            title="Clear Terminal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Output */}
      <div className="flex-1 p-4 overflow-y-auto space-y-1 bg-slate-950 font-mono text-xs">
        {lines.map((item, idx) => (
          <div
            key={idx}
            className={`whitespace-pre-wrap leading-relaxed ${
              item.type === 'cmd'
                ? 'text-cyan-400 font-semibold'
                : item.type === 'err'
                ? 'text-rose-400'
                : 'text-slate-300'
            }`}
          >
            {item.text}
          </div>
        ))}
        {isRunning && (
          <div className="text-cyan-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Executing command...</span>
          </div>
        )}
        <div ref={terminalEndRef} />
      </div>

      {/* Quick Snippets Bar */}
      <div className="px-4 py-1.5 bg-slate-900/60 border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-[10px]">
        <span className="text-slate-400 shrink-0">Quick Presets:</span>
        {quickCommands.map((cmd, idx) => (
          <button
            key={idx}
            onClick={() => setInputVal(cmd)}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 truncate max-w-xs transition-colors shrink-0"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Input Prompt */}
      <form onSubmit={handleSubmit} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
        <div className="text-cyan-400 font-bold shrink-0">
          {shell === 'powershell' ? 'PS>' : '>'}
        </div>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isRunning}
          placeholder="Type command (e.g. mame pacman -window, git push origin main, make all)..."
          className="flex-1 bg-transparent text-slate-100 focus:outline-none text-xs font-mono"
        />
        <button
          type="submit"
          disabled={isRunning || !inputVal.trim()}
          className="px-3 py-1 bg-cyan-700 hover:bg-cyan-600 disabled:opacity-40 text-white rounded font-medium text-xs flex items-center gap-1 transition-colors shrink-0"
        >
          <Send className="w-3 h-3" />
          <span>Run</span>
        </button>
      </form>
    </div>
  );
};
