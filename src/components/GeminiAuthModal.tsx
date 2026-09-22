import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, AlertCircle, Key, ShieldCheck, Cpu, RefreshCw, ExternalLink } from 'lucide-react';
import { GeminiAuthStatus } from '../types';

interface GeminiAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  authStatus: GeminiAuthStatus;
  onUpdateAuth: (apiKey?: string, model?: string) => Promise<void>;
}

export const GeminiAuthModal: React.FC<GeminiAuthModalProps> = ({
  isOpen,
  onClose,
  authStatus,
  onUpdateAuth,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [selectedModel, setSelectedModel] = useState(authStatus.model || 'gemini-3.8-flash');
  const [testing, setTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setStatusMessage(null);
    try {
      await onUpdateAuth(apiKeyInput ? apiKeyInput.trim() : undefined, selectedModel);
      setStatusMessage('Gemini authentication and model preferences successfully updated!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setStatusMessage(`Error updating configuration: ${err.message || 'Network error'}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">Gemini AI Sign-In & Settings</h2>
              <p className="text-xs text-slate-400">Configure your autonomous reasoning engine</p>
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
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Current Auth Status Card */}
          <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Authentication State</span>
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="h-3 w-3" />
                {authStatus.signedIn ? 'Connected & Active' : 'Offline'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-1 border-t border-slate-800/80">
              <div>
                <span className="text-slate-500 block">Active Account / Role:</span>
                <span className="font-mono text-slate-300 font-medium">{authStatus.email || 'developer@aistudio'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Auth Source:</span>
                <span className="font-mono text-emerald-400 font-medium">
                  {authStatus.authMethod === 'cloud_env' ? 'AI Studio Cloud Key' : authStatus.authMethod === 'custom_key' ? 'Custom Session Key' : 'Default'}
                </span>
              </div>
            </div>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-emerald-400" />
              Active Autonomous Model
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedModel('gemini-3.8-flash')}
                className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all ${
                  selectedModel === 'gemini-3.8-flash'
                    ? 'border-emerald-500 bg-emerald-950/20 text-slate-100 ring-1 ring-emerald-500/50'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold text-xs text-emerald-300 flex items-center gap-1">
                  Gemini 3.8 Flash
                  <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 rounded">Recommended</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">High-speed reasoning, multi-tool emulation loops</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedModel('gemini-2.5-pro')}
                className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all ${
                  selectedModel === 'gemini-2.5-pro'
                    ? 'border-emerald-500 bg-emerald-950/20 text-slate-100 ring-1 ring-emerald-500/50'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold text-xs text-slate-200">Gemini 2.5 Pro</div>
                <div className="text-[11px] text-slate-400 mt-1">Deep reverse engineering & complex decompilation</div>
              </button>
            </div>
          </div>

          {/* Custom API Key Input (Optional override) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Key className="h-4 w-4 text-emerald-400" />
                Custom Gemini API Key (Optional)
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
              >
                Get API Key <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <input
              type="password"
              placeholder="Leave blank to use pre-configured Google AI Studio key"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <p className="text-[11px] text-slate-500">
              Keys are strictly routed through backend server routes and never exposed to the client browser.
            </p>
          </div>

          {statusMessage && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                statusMessage.includes('Error')
                  ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                  : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              }`}
            >
              {statusMessage.includes('Error') ? <AlertCircle className="h-4 w-4 shrink-0" /> : <ShieldCheck className="h-4 w-4 shrink-0" />}
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={testing}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors shadow-sm shadow-emerald-950"
            >
              {testing ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Saving & Verifying...
                </>
              ) : (
                'Save Connection'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
