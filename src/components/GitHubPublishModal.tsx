import React, { useState, useEffect } from 'react';
import {
  X,
  Github,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Tag,
  Package,
  FileCode2,
  ArrowRight,
  Copy,
  Check,
  Key
} from 'lucide-react';

interface GitHubPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubPublishModal: React.FC<GitHubPublishModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [targetAccount, setTargetAccount] = useState('retrorepair');
  const [repoName, setRepoName] = useState('omnicode');
  const [releaseTag, setReleaseTag] = useState('v1.0.0');
  const [releaseTitle, setReleaseTitle] = useState('OmniCode v1.0.0 - Native Windows x64 Installer');
  const [isPrivate, setIsPrivate] = useState(false);
  const [customToken, setCustomToken] = useState('');
  
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [statusData, setStatusData] = useState<any>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishLogs, setPublishLogs] = useState<string[]>([]);
  const [publishResult, setPublishResult] = useState<any>(null);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const checkStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const res = await fetch(`/api/github/status?repo=${encodeURIComponent(repoName)}`);
      const data = await res.json();
      setStatusData(data);
    } catch (err: any) {
      setStatusData({ configured: false, error: err.message });
    } finally {
      setIsCheckingStatus(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkStatus();
    }
  }, [isOpen, repoName]);

  const handlePublish = async () => {
    setIsPublishing(true);
    setPublishLogs([
      `[${new Date().toLocaleTimeString()}] Initializing GitHub publishing pipeline...`,
      `[${new Date().toLocaleTimeString()}] Target repository: https://github.com/${targetAccount}/${repoName}`,
      `[${new Date().toLocaleTimeString()}] Release asset: dist-installer/OmniCode-Setup-1.0.0-x64.exe`,
    ]);
    setPublishResult(null);

    try {
      const res = await fetch('/api/github/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: customToken.trim() || undefined,
          targetAccount,
          repoName,
          releaseTag,
          releaseTitle,
          isPrivate,
        }),
      });

      const data = await res.json();
      if (data.logs) {
        setPublishLogs(data.logs);
      }
      setPublishResult(data);
      if (data.success) {
        checkStatus();
      }
    } catch (err: any) {
      setPublishLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Error: ${err.message}`,
      ]);
      setPublishResult({ success: false, error: err.message });
    } finally {
      setIsPublishing(false);
    }
  };

  const copyCliCommand = () => {
    const script = `git remote add origin https://github.com/${targetAccount}/${repoName}.git\ngit push -u origin main\ngh release create ${releaseTag} dist-installer/OmniCode-Setup-1.0.0-x64.exe --title "${releaseTitle}"`;
    navigator.clipboard.writeText(script);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  if (!isOpen) return null;

  const isConfigured = statusData?.configured || customToken.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/90">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-100 border border-slate-700">
              <Github className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                Publish Project &amp; Release to GitHub
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {targetAccount}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Creates the repository, pushes all codebase files, and releases the single installer
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Target Account & Repo Overview */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Target GitHub Account / Org
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-mono text-slate-100">
                    {targetAccount}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Repository Name
                </label>
                <input
                  type="text"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                  placeholder="omnicode"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Release Version Tag
                </label>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={releaseTag}
                    onChange={(e) => setReleaseTag(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Included Release Artifact
                </label>
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                  <Package className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="truncate">OmniCode-Setup-1.0.0-x64.exe</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center">
              <FileCode2 className="h-5 w-5 text-blue-400 mx-auto mb-1.5" />
              <div className="text-xs font-semibold text-slate-200">42 Source Files</div>
              <div className="text-[11px] text-slate-400">Complete codebase</div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center">
              <Tag className="h-5 w-5 text-purple-400 mx-auto mb-1.5" />
              <div className="text-xs font-semibold text-slate-200">Branch 'main'</div>
              <div className="text-[11px] text-slate-400">Initial commit</div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center">
              <Package className="h-5 w-5 text-emerald-400 mx-auto mb-1.5" />
              <div className="text-xs font-semibold text-slate-200">GitHub Release</div>
              <div className="text-[11px] text-slate-400">{releaseTag} with x64 EXE</div>
            </div>
          </div>

          {/* GitHub Token / Authentication Status */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                <Key className="h-4 w-4 text-amber-400" />
                GitHub Authentication Status
              </span>
              <button
                onClick={checkStatus}
                disabled={isCheckingStatus}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
              >
                <RefreshCw className={`h-3 w-3 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {statusData?.configured ? (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>
                  Authenticated as <strong>{statusData.user}</strong>. Ready to create &amp; push to{' '}
                  <code>github.com/{targetAccount}/{repoName}</code>.
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                    Environment Token (GITHUB_TOKEN) Not Detected
                  </div>
                  <p className="text-[11px] text-amber-300/80">
                    You can configure <code>GITHUB_TOKEN</code> in your environment or Secrets settings with <code>repo</code> scope, or paste a personal access token below to push immediately:
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    GitHub Personal Access Token (optional, if not in environment):
                  </label>
                  <input
                    type="password"
                    value={customToken}
                    onChange={(e) => setCustomToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Publishing Execution Logs */}
          {publishLogs.length > 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-300 font-semibold flex items-center gap-2">
                  <UploadCloud className="h-4 w-4 text-blue-400" />
                  Publish Pipeline Activity
                </span>
                {isPublishing && (
                  <span className="text-[11px] text-blue-400 flex items-center gap-1">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Working...
                  </span>
                )}
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1 text-slate-300 text-[11px]">
                {publishLogs.map((log, i) => (
                  <div key={i} className="leading-relaxed">
                    {log.includes('Successfully') || log.includes('created') ? (
                      <span className="text-emerald-400">{log}</span>
                    ) : log.includes('Error') ? (
                      <span className="text-red-400">{log}</span>
                    ) : (
                      <span>{log}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Success Link Banner */}
          {publishResult?.success && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Repository &amp; Release Published to GitHub!
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href={publishResult.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View GitHub Repository
                </a>
                <a
                  href={publishResult.releaseUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors border border-slate-700"
                >
                  <Package className="h-3.5 w-3.5 text-purple-400" />
                  View Release &amp; Download Installer
                </a>
              </div>
            </div>
          )}

          {/* Direct CLI Command Fallback */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">
                Direct Terminal / PowerShell Command:
              </span>
              <button
                onClick={copyCliCommand}
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                {copiedCmd ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copiedCmd ? 'Copied' : 'Copy Commands'}
              </button>
            </div>
            <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
{`git remote add origin https://github.com/${targetAccount}/${repoName}.git
git push -u origin main
gh release create ${releaseTag} dist-installer/OmniCode-Setup-1.0.0-x64.exe --title "${releaseTitle}"`}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-800 px-6 py-4 bg-slate-950/90 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Target: <code>https://github.com/{targetAccount}/{repoName}</code>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg shadow-blue-950 transition-all cursor-pointer disabled:opacity-50"
            >
              {isPublishing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <UploadCloud className="h-4 w-4" />
              )}
              {isPublishing
                ? 'Creating & Pushing...'
                : `Create Repo, Push Code & Release to ${targetAccount}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
