import React, { useState, useEffect } from 'react';
import { X, Save, Copy, Check, FileCode } from 'lucide-react';
import { WorkspaceFile } from '../types';

interface FileEditorModalProps {
  file: WorkspaceFile | null;
  onClose: () => void;
  onSave: (path: string, content: string) => void;
}

export const FileEditorModal: React.FC<FileEditorModalProps> = ({
  file,
  onClose,
  onSave,
}) => {
  const [content, setContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (file) {
      setContent(file.content || '');
    }
  }, [file]);

  if (!file) return null;

  const handleSave = () => {
    onSave(file.path, content);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 font-sans text-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-4xl w-full h-[85vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-cyan-400" />
            <span className="font-mono font-semibold text-slate-100">{file.path}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
              {file.language || 'text'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center gap-1 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleSave}
              className="px-3 py-1 bg-cyan-700 hover:bg-cyan-600 text-white rounded flex items-center gap-1 font-medium transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saved ? 'Saved!' : 'Save Changes'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Editor Textarea */}
        <div className="flex-1 p-2 bg-slate-950">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full bg-slate-900/90 text-cyan-200 font-mono text-xs p-3 rounded border border-slate-800 focus:outline-none focus:border-cyan-600 resize-none leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
};
