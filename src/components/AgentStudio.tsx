import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Terminal,
  Play,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Code,
  Sparkles,
  RefreshCw,
  GitBranch,
  Hammer,
  Binary,
  Monitor,
  Check,
  Copy,
} from 'lucide-react';
import { AgentChatMessage, AgentToolStep, MountedFolder } from '../types';

interface AgentStudioProps {
  messages: AgentChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onClearChat: () => void;
  workspacePath: string;
  mountedFolders?: MountedFolder[];
  onOpenDirectoryMountModal?: () => void;
}

export const AgentStudio: React.FC<AgentStudioProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onClearChat,
  workspacePath,
  mountedFolders = [],
  onOpenDirectoryMountModal,
}) => {
  const [inputText, setInputText] = useState('');
  const [autoRetryErrors, setAutoRetryErrors] = useState(true);
  const [expandedTools, setExpandedTools] = useState<Record<string, boolean>>({});
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const toggleToolExpand = (stepKey: string) => {
    setExpandedTools((prev) => ({ ...prev, [stepKey]: !prev[stepKey] }));
  };

  const toggleThoughtExpand = (msgId: string) => {
    setExpandedThoughts((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getToolIcon = (name: string) => {
    switch (name) {
      case 'mame_launch_and_automate':
        return <Monitor className="w-4 h-4 text-amber-400" />;
      case 'ghidra_headless_analyze':
        return <Binary className="w-4 h-4 text-purple-400" />;
      case 'mingw_compile':
        return <Hammer className="w-4 h-4 text-blue-400" />;
      case 'git_version_control':
        return <GitBranch className="w-4 h-4 text-emerald-400" />;
      case 'execute_shell_command':
        return <Terminal className="w-4 h-4 text-cyan-400" />;
      default:
        return <Code className="w-4 h-4 text-slate-300" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Studio Control Bar */}
      <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-medium text-cyan-400">
            <Sparkles className="w-4 h-4" />
            <span>Autonomous Execution Loop</span>
          </div>
          <span className="text-slate-400 font-mono text-[11px] truncate max-w-xs">
            CWD: {workspacePath}
          </span>
          {mountedFolders.length > 0 && onOpenDirectoryMountModal && (
            <button
              onClick={onOpenDirectoryMountModal}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-mono flex items-center gap-1 transition-colors cursor-pointer"
              title="Click to view or add pointed folders"
            >
              <span>{mountedFolders.length} folders linked</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-slate-100 text-[11px]">
            <input
              type="checkbox"
              checked={autoRetryErrors}
              onChange={(e) => setAutoRetryErrors(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span>Auto-fix MinGW compiler errors</span>
          </label>

          <button
            onClick={onClearChat}
            className="px-2 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded text-[11px] transition-colors"
          >
            Clear Session
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 max-w-xl mx-auto space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-700/50 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-950/50">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-200">
                OmniCode Autonomous Emulation Agent
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-sans leading-relaxed">
                Like Claude Code, I autonomously manage your local working directory, launch MAME with automated Lua scripts, decompile ROMs with Ghidra Headless, build driver hooks using MinGW GCC, and push commits to GitHub.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full text-left font-sans pt-2">
              <div
                onClick={() =>
                  onSendMessage(
                    'Autonomously launch MAME with pacman, inject a Lua script that puts 2 credits in and presses 1-player start, and check the RAM score address.'
                  )
                }
                className="p-3 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-cyan-700/60 rounded-lg cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs">
                  <Monitor className="w-3.5 h-3.5" />
                  <span>MAME Autonomous Loop</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Launch pacman with Lua autoboot, coin-in injection, and score watching.
                </div>
              </div>

              <div
                onClick={() =>
                  onSendMessage(
                    'Run Ghidra Headless on the arcade ROM to decompile its Z80 entry routine and export C pseudocode to build/symbols.c.'
                  )
                }
                className="p-3 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-purple-700/60 rounded-lg cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs">
                  <Binary className="w-3.5 h-3.5" />
                  <span>Ghidra Headless Decompile</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Analyze arcade binary with analyzeHeadless.bat and extract C functions.
                </div>
              </div>

              <div
                onClick={() =>
                  onSendMessage(
                    'Compile pacman/driver_hook.c using MinGW GCC, fix any syntax or warning issues, and verify build/driver_hook.dll.'
                  )
                }
                className="p-3 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-blue-700/60 rounded-lg cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs">
                  <Hammer className="w-3.5 h-3.5" />
                  <span>MinGW Build & Self-Heal</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Run GCC/Makefile, parse compiler errors, rewrite code, and re-compile.
                </div>
              </div>

              <div
                onClick={() =>
                  onSendMessage(
                    'Check git status, stage all new MAME lua scripts and MinGW artifacts, commit with a clear message, and push to GitHub.'
                  )
                }
                className="p-3 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-emerald-700/60 rounded-lg cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>Git Repository Pipeline</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Status, diff, commit, and remote synchronization.
                </div>
              </div>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className="space-y-2">
            {/* User Message */}
            {msg.role === 'user' && (
              <div className="flex items-start gap-2.5 bg-slate-900/90 border border-slate-800 p-3 rounded-lg">
                <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-slate-300 shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 font-sans text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </div>
              </div>
            )}

            {/* Assistant Message */}
            {msg.role === 'assistant' && (
              <div className="space-y-2">
                {/* Collapsible Reasoning Trace (Thinking) */}
                {msg.thought && (
                  <div className="bg-slate-900/40 border border-slate-800/80 rounded-md overflow-hidden">
                    <button
                      onClick={() => toggleThoughtExpand(msg.id)}
                      className="w-full px-3 py-1.5 flex items-center justify-between text-[11px] text-cyan-400 hover:bg-slate-800/50"
                    >
                      <div className="flex items-center gap-2 font-mono">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Agent Reasoning & Plan Execution</span>
                      </div>
                      {expandedThoughts[msg.id] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                    {expandedThoughts[msg.id] && (
                      <div className="p-3 text-slate-400 text-xs font-mono border-t border-slate-800/60 bg-slate-950/60 whitespace-pre-wrap leading-relaxed">
                        {msg.thought}
                      </div>
                    )}
                  </div>
                )}

                {/* Autonomous Tool Invocations */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="space-y-1.5 pl-2 border-l-2 border-cyan-700/50">
                    <div className="text-[10px] text-cyan-400 uppercase font-semibold tracking-wider font-mono">
                      Autonomous Actions Executed ({msg.toolCalls.length})
                    </div>
                    {msg.toolCalls.map((step, sIdx) => {
                      const stepKey = `${msg.id}-${sIdx}`;
                      const isExpanded = expandedTools[stepKey] ?? true;
                      return (
                        <div
                          key={sIdx}
                          className="bg-slate-900 border border-slate-800 rounded-md overflow-hidden shadow-sm"
                        >
                          <div
                            onClick={() => toggleToolExpand(stepKey)}
                            className="px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-slate-850 select-none bg-slate-900"
                          >
                            <div className="flex items-center gap-2">
                              {getToolIcon(step.toolName)}
                              <span className="font-mono font-semibold text-slate-200 text-xs">
                                {step.toolName}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                                SUCCESS
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400">
                              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="p-3 bg-slate-950/80 border-t border-slate-800 space-y-2 text-xs font-mono">
                              <div>
                                <span className="text-[10px] uppercase text-slate-400 font-semibold">Arguments:</span>
                                <pre className="mt-1 p-2 rounded bg-slate-900 text-cyan-300 text-[11px] overflow-x-auto">
                                  {JSON.stringify(step.arguments, null, 2)}
                                </pre>
                              </div>
                              <div>
                                <span className="text-[10px] uppercase text-slate-400 font-semibold">Output / Telemetry:</span>
                                <pre className="mt-1 p-2 rounded bg-slate-900 text-emerald-300 text-[11px] overflow-x-auto whitespace-pre-wrap">
                                  {typeof step.output === 'object'
                                    ? JSON.stringify(step.output, null, 2)
                                    : String(step.output)}
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Final Response Body */}
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-slate-200 font-sans leading-relaxed text-xs">
                  <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-800/80">
                    <div className="flex items-center gap-1.5 text-cyan-400 font-semibold font-mono text-[11px]">
                      <Bot className="w-3.5 h-3.5" />
                      <span>OmniCode Agent Output</span>
                    </div>
                    <button
                      onClick={() => handleCopy(msg.content, msg.id)}
                      className="text-slate-400 hover:text-slate-200 flex items-center gap-1 text-[11px]"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="whitespace-pre-wrap text-slate-200">
                    {msg.content}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="p-3 bg-slate-900/60 border border-cyan-800/40 rounded-lg flex items-center gap-3">
            <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
            <div className="font-mono text-xs text-cyan-300">
              OmniCode is reasoning, executing tools, and evaluating output...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form at Bottom */}
      <form onSubmit={handleSubmit} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            placeholder="Instruct OmniCode (e.g. 'Launch MAME with pacman, coin-in, run Ghidra decompile, and commit to Git')..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-slate-100 text-xs font-mono focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-slate-400"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !inputText.trim()}
          className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-lg font-medium text-xs flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Execute</span>
        </button>
      </form>
    </div>
  );
};
