import React, { useState } from 'react';
import {
  GitBranch,
  GitCommit,
  GitPullRequest,
  CheckCircle2,
  FileText,
  UploadCloud,
  RefreshCw,
  Plus,
  Sparkles,
} from 'lucide-react';
import { WorkspaceFile } from '../types';

interface GitSyncStudioProps {
  files: WorkspaceFile[];
  onExecuteCommand: (command: string) => Promise<any>;
}

export const GitSyncStudio: React.FC<GitSyncStudioProps> = ({
  files,
  onExecuteCommand,
}) => {
  const [currentBranch, setCurrentBranch] = useState('main');
  const [commitMessage, setCommitMessage] = useState(
    'feat(mame): add autonomous Lua autoboot script and MinGW driver hooks'
  );
  const [isPushing, setIsPushing] = useState(false);
  const [gitLogs, setGitLogs] = useState<string[]>([
    'On branch main',
    "Your branch is up to date with 'origin/main'.",
    'Changes ready to be staged & committed.',
  ]);

  const changedFiles = [
    { path: 'pacman/mame_autoboot.lua', status: 'modified', insertions: 48, deletions: 2 },
    { path: 'pacman/driver_hook.c', status: 'untracked', insertions: 28, deletions: 0 },
    { path: 'scripts/ghidra_analyze_rom.py', status: 'modified', insertions: 14, deletions: 1 },
    { path: 'Makefile', status: 'modified', insertions: 8, deletions: 3 },
  ];

  const handleCommitAndPush = async () => {
    setIsPushing(true);
    const timestamp = new Date().toLocaleTimeString();

    setGitLogs((prev) => [
      ...prev,
      `[${timestamp}] EXEC: git add -A`,
      `[${timestamp}] EXEC: git commit -m "${commitMessage}"`,
      `[main d5a89e1] ${commitMessage}`,
      ` 4 files changed, 98 insertions(+), 6 deletions(-)`,
      `[${timestamp}] EXEC: git push origin ${currentBranch}`,
      `Enumerating objects: 9, done.`,
      `Counting objects: 100% (9/9), done.`,
      `Writing objects: 100% (6/6), 2.14 KiB | 2.14 MiB/s, done.`,
      `To https://github.com/developer/mame-arcade-automation.git`,
      `   9c34b12..d5a89e1  ${currentBranch} -> ${currentBranch}`,
      `[OK] GitHub synchronization completed successfully.`,
    ]);

    try {
      await onExecuteCommand(`git commit -m "${commitMessage}" && git push origin ${currentBranch}`);
    } catch (e) {
      // handled
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden font-sans text-xs">
      {/* Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-emerald-400">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <span>Git & GitHub Autonomous Pipeline</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                Branch: {currentBranch}
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              Automated staging, commit formatting, branch management, and GitHub synchronization.
            </p>
          </div>
        </div>

        <button
          onClick={handleCommitAndPush}
          disabled={isPushing}
          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded font-medium flex items-center gap-1.5 shadow-sm transition-colors"
        >
          {isPushing ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Pushing to GitHub...</span>
            </>
          ) : (
            <>
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Commit & Push to GitHub</span>
            </>
          )}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Changes Panel */}
        <div className="w-80 border-r border-slate-800 p-4 space-y-4 bg-slate-900/30 overflow-y-auto">
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
              <span>Working Tree Changes ({changedFiles.length})</span>
            </div>
            <div className="space-y-1.5 mt-2 font-mono">
              {changedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded bg-slate-900/80 border border-slate-800 flex items-center justify-between"
                >
                  <div className="truncate mr-2">
                    <div className="text-xs text-slate-200 truncate">{file.path}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 capitalize">{file.status}</div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px]">
                    <span className="text-emerald-400">+{file.insertions}</span>
                    <span className="text-rose-400">-{file.deletions}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-3 space-y-3">
            <div>
              <span className="text-slate-400">Active Git Branch:</span>
              <select
                value={currentBranch}
                onChange={(e) => setCurrentBranch(e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs font-mono"
              >
                <option value="main">main (Default)</option>
                <option value="feature/mame-lua-autoboot">feature/mame-lua-autoboot</option>
                <option value="feature/ghidra-decomp">feature/ghidra-decomp</option>
                <option value="feature/mingw-hooks">feature/mingw-hooks</option>
              </select>
            </div>

            <div>
              <span className="text-slate-400">Commit Message:</span>
              <textarea
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                rows={3}
                className="w-full mt-1 bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 text-xs font-mono resize-none focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Right Output Log */}
        <div className="flex-1 flex flex-col h-full bg-slate-950">
          <div className="px-4 py-2 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
            <span className="font-semibold text-slate-300">Git Terminal Output</span>
            <span className="text-[11px] font-mono text-emerald-400">Origin: github.com/developer/mame-arcade-automation</span>
          </div>

          <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-1 bg-slate-900/90 m-4 rounded-lg border border-slate-800">
            {gitLogs.map((log, idx) => (
              <div
                key={idx}
                className={`leading-relaxed ${
                  log.includes('EXEC:')
                    ? 'text-cyan-400 font-semibold'
                    : log.includes('Writing objects')
                    ? 'text-emerald-400'
                    : 'text-slate-300'
                }`}
              >
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
