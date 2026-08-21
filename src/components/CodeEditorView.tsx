import React, { useState } from 'react';
import { SpaceProject, SpaceFile } from '../types';
import { 
  FileCode, 
  Copy, 
  Check, 
  Sparkles, 
  Plus, 
  Trash2, 
  RotateCcw,
  Download,
  Terminal,
  FileText
} from 'lucide-react';

interface CodeEditorViewProps {
  project: SpaceProject;
  onUpdateFiles: (newFiles: SpaceFile[]) => void;
}

export const CodeEditorView: React.FC<CodeEditorViewProps> = ({ project, onUpdateFiles }) => {
  const [selectedFilePath, setSelectedFilePath] = useState<string>(
    project.files[0]?.path || 'app.py'
  );
  const [copied, setCopied] = useState<boolean>(false);
  const [refactorPrompt, setRefactorPrompt] = useState<string>('');
  const [isRefactoring, setIsRefactoring] = useState<boolean>(false);
  const [newFileName, setNewFileName] = useState<string>('');
  const [showAddFile, setShowAddFile] = useState<boolean>(false);

  const activeFile = project.files.find((f) => f.path === selectedFilePath) || project.files[0];

  const handleContentChange = (newContent: string) => {
    if (!activeFile) return;
    const updated = project.files.map((f) =>
      f.path === activeFile.path ? { ...f, content: newContent } : f
    );
    onUpdateFiles(updated);
  };

  const handleCopyFile = () => {
    if (!activeFile) return;
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddFile = () => {
    if (!newFileName.trim()) return;
    const cleanPath = newFileName.trim();
    if (project.files.some((f) => f.path === cleanPath)) {
      alert('File with this name already exists.');
      return;
    }
    const ext = cleanPath.split('.').pop() || '';
    const lang = ext === 'py' ? 'python' : ext === 'md' ? 'markdown' : ext === 'json' ? 'json' : 'text';
    const newFile: SpaceFile = {
      path: cleanPath,
      content: `# ${cleanPath}\n`,
      language: lang,
    };
    onUpdateFiles([...project.files, newFile]);
    setSelectedFilePath(cleanPath);
    setNewFileName('');
    setShowAddFile(false);
  };

  const handleDeleteFile = (pathToDelete: string) => {
    if (project.files.length <= 1) {
      alert('Space must have at least one file.');
      return;
    }
    if (pathToDelete === 'app.py' || pathToDelete === 'README.md') {
      if (!confirm(`Are you sure you want to delete ${pathToDelete}? It is a primary Space configuration file.`)) {
        return;
      }
    }
    const updated = project.files.filter((f) => f.path !== pathToDelete);
    onUpdateFiles(updated);
    if (selectedFilePath === pathToDelete) {
      setSelectedFilePath(updated[0]?.path || '');
    }
  };

  const handleAiRefactor = async (customInstruction?: string) => {
    const instruction = customInstruction || refactorPrompt;
    if (!instruction.trim() || !activeFile) return;

    setIsRefactoring(true);
    try {
      const res = await fetch('/api/refactor-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: activeFile.content,
          filename: activeFile.path,
          instruction,
        }),
      });

      const data = await res.json();
      if (res.ok && data.updatedCode) {
        handleContentChange(data.updatedCode);
        setRefactorPrompt('');
      } else {
        alert(data.error || 'Failed to refactor file.');
      }
    } catch (e: any) {
      alert('Network error during AI refactoring: ' + e.message);
    } finally {
      setIsRefactoring(false);
    }
  };

  const lineCount = activeFile ? activeFile.content.split('\n').length : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* AI Assistant Quick Actions Bar */}
      <div className="bg-white rounded-xl border border-neutral-200/80 p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-neutral-900">AI Space Code Assistant</span>
              <p className="text-[11px] text-neutral-500">Refactor, enhance UI components, or add features with 1 click</p>
            </div>
          </div>

          <div className="flex-1 max-w-xl flex items-center gap-2">
            <input
              id="ai-refactor-input"
              type="text"
              value={refactorPrompt}
              onChange={(e) => setRefactorPrompt(e.target.value)}
              placeholder={`Instruct AI to edit ${activeFile?.path || 'code'} (e.g., "Add custom CSS styling" or "Add batch input")...`}
              className="flex-1 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              onKeyDown={(e) => e.key === 'Enter' && handleAiRefactor()}
            />
            <button
              onClick={() => handleAiRefactor()}
              disabled={isRefactoring || !refactorPrompt.trim()}
              className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 text-white text-xs font-medium shadow-xs transition-colors shrink-0 flex items-center gap-1"
            >
              {isRefactoring ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>Apply</span>
            </button>
          </div>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2.5 border-t border-neutral-100">
          <span className="text-[11px] text-neutral-400 font-medium">Quick Enhancements:</span>
          {[
            'Add custom CSS soft theme',
            'Add error handling try-except block',
            'Add live streaming response handler',
            'Add Hugging Face Hub token authentication helper',
          ].map((pill, i) => (
            <button
              key={i}
              onClick={() => handleAiRefactor(pill)}
              disabled={isRefactoring}
              className="text-[11px] px-2 py-0.5 rounded-md bg-neutral-50 hover:bg-amber-50 text-neutral-700 hover:text-amber-900 border border-neutral-200 transition-colors"
            >
              + {pill}
            </button>
          ))}
        </div>
      </div>

      {/* Main Code Editor Box */}
      <div className="bg-white rounded-xl border border-neutral-200/80 shadow-xs overflow-hidden">
        {/* File Tabs Strip */}
        <div className="flex items-center justify-between bg-neutral-50 border-b border-neutral-200 px-3 py-2">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {project.files.map((file) => {
              const isSelected = file.path === selectedFilePath;
              return (
                <div
                  key={file.path}
                  className={`group flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                    isSelected
                      ? 'bg-white text-neutral-900 font-semibold shadow-2xs border border-neutral-200/80'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <button
                    onClick={() => setSelectedFilePath(file.path)}
                    className="flex items-center gap-1.5"
                  >
                    {file.path.endsWith('.py') ? (
                      <FileCode className="w-3.5 h-3.5 text-blue-600" />
                    ) : file.path.endsWith('.md') ? (
                      <FileText className="w-3.5 h-3.5 text-amber-600" />
                    ) : (
                      <Terminal className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                    <span>{file.path}</span>
                  </button>

                  {file.path !== 'app.py' && file.path !== 'README.md' && (
                    <button
                      onClick={() => handleDeleteFile(file.path)}
                      className="opacity-0 group-hover:opacity-100 hover:text-red-600 transition-opacity p-0.5 ml-1"
                      title="Delete file"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}

            {/* Add File Button */}
            <button
              onClick={() => setShowAddFile(true)}
              className="p-1 rounded-md hover:bg-neutral-200 text-neutral-500 hover:text-neutral-800 transition-colors"
              title="Add new file"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-neutral-400 hidden sm:inline">
              {lineCount} lines • {activeFile?.language || 'text'}
            </span>

            <button
              onClick={handleCopyFile}
              className="inline-flex items-center gap-1 text-xs text-neutral-600 hover:text-neutral-900 px-2.5 py-1 rounded bg-white hover:bg-neutral-100 border border-neutral-200 transition-colors font-medium shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Add File Modal / Input */}
        {showAddFile && (
          <div className="p-3 bg-neutral-100/70 border-b border-neutral-200 flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-700">New File:</span>
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="e.g. utils.py or config.json"
              className="px-2.5 py-1 text-xs rounded border border-neutral-300 bg-white font-mono"
              onKeyDown={(e) => e.key === 'Enter' && handleAddFile()}
            />
            <button
              onClick={handleAddFile}
              className="px-2.5 py-1 text-xs font-medium bg-neutral-900 text-white rounded hover:bg-neutral-800"
            >
              Create
            </button>
            <button
              onClick={() => setShowAddFile(false)}
              className="px-2 py-1 text-xs text-neutral-500 hover:text-neutral-800"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Code Textarea with line numbers */}
        <div className="relative font-mono text-xs bg-neutral-950 text-neutral-100 p-4 min-h-[480px]">
          <textarea
            id="code-editor-textarea"
            value={activeFile?.content || ''}
            onChange={(e) => handleContentChange(e.target.value)}
            spellCheck={false}
            className="w-full h-full min-h-[460px] bg-transparent text-neutral-100 font-mono text-xs leading-relaxed resize-y focus:outline-none selection:bg-amber-500/30 selection:text-white"
          />
        </div>
      </div>
    </div>
  );
};
