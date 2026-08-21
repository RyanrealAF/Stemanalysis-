import React, { useState } from 'react';
import { SpaceProject, SpaceCategory, SpaceSDK } from '../types';
import { 
  Sparkles, 
  X, 
  Bot, 
  FileText, 
  FolderOpen, 
  Terminal, 
  Upload, 
  Check, 
  ChevronRight,
  Zap,
  ArrowRight
} from 'lucide-react';

interface CreateSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpaceCreated: (newProject: SpaceProject) => void;
}

export const CreateSpaceModal: React.FC<CreateSpaceModalProps> = ({
  isOpen,
  onClose,
  onSpaceCreated,
}) => {
  const [activeTab, setActiveTab] = useState<SpaceCategory | 'agent_cmd'>('model');
  const [query, setQuery] = useState<string>('');
  const [sdk, setSdk] = useState<SpaceSDK>('gradio');
  const [customNotes, setCustomNotes] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; content: string }[]>([]);

  if (!isOpen) return null;

  const popularModels = [
    { name: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-8B', tag: 'Reasoning CoT' },
    { name: 'meta-llama/Llama-3.2-3B-Instruct', tag: 'Instruction LLM' },
    { name: 'openai/whisper-large-v3', tag: 'Audio Transcription' },
    { name: 'black-forest-labs/FLUX.1-schnell', tag: 'Fast Image Diffusion' },
    { name: 'sentence-transformers/all-MiniLM-L6-v2', tag: 'Embeddings' },
    { name: 'google/paligemma2-3b-pt-448', tag: 'Vision Language' },
  ];

  const popularPapers = [
    { title: 'LoRA: Low-Rank Adaptation of Large Language Models', arxiv: '2106.09685' },
    { title: 'Attention Is All You Need (Transformer)', arxiv: '1706.03762' },
    { title: 'FlashAttention: Fast and Memory-Efficient Exact Attention', arxiv: '2205.14135' },
    { title: 'Direct Preference Optimization: Your Language Model is Secretly a Reward Model (DPO)', arxiv: '2305.18290' },
    { title: 'Chain-of-Thought Prompting Elicits Reasoning in Large Language Models', arxiv: '2201.11903' },
    { title: 'Speculative Decoding for Accelerated LLM Generation', arxiv: '2211.17192' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = (event.target?.result as string) || '';
        setUploadedFiles((prev) => [...prev, { name: file.name, content }]);
      };
      reader.readAsText(file);
    });
  };

  const handleGenerate = async (targetQuery?: string, targetSdk?: SpaceSDK) => {
    const finalQuery = targetQuery || query;
    const finalSdk = targetSdk || sdk;

    if (!finalQuery.trim() && uploadedFiles.length === 0) {
      alert('Please enter a model name, paper title/arXiv ID, or upload project files.');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-space', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeTab === 'agent_cmd' ? 'model' : activeTab,
          query: finalQuery,
          sdk: finalSdk,
          customNotes,
          uploadedFiles,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.project) {
        onSpaceCreated(data.project);
        onClose();
      } else {
        alert(data.error || 'Failed to generate Space demo.');
      }
    } catch (err: any) {
      alert('Error generating space: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-lg">
              🤗
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">Create Hugging Face Space</h2>
              <p className="text-xs text-neutral-500">Generate a production-ready application for any Model, Research Paper, or Local Codebase</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-neutral-200 bg-neutral-50 px-5 pt-2 gap-2 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => { setActiveTab('model'); setQuery(''); }}
            className={`pb-2.5 px-3 flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'model'
                ? 'border-amber-500 text-amber-950 font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            AI Model Space
          </button>
          <button
            onClick={() => { setActiveTab('paper'); setQuery(''); }}
            className={`pb-2.5 px-3 flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'paper'
                ? 'border-amber-500 text-amber-950 font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Research Paper Space
          </button>
          <button
            onClick={() => { setActiveTab('local_folder'); setQuery(''); }}
            className={`pb-2.5 px-3 flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'local_folder'
                ? 'border-amber-500 text-amber-950 font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            Local Folder / Pipeline
          </button>
          <button
            onClick={() => { setActiveTab('agent_cmd'); setQuery('Build a multi-modal interactive playground with Gradio'); }}
            className={`pb-2.5 px-3 flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'agent_cmd'
                ? 'border-amber-500 text-amber-950 font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            HF Agent Command
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: AI MODEL DEMO */}
          {activeTab === 'model' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  Hugging Face Model ID or Family
                </label>
                <input
                  id="model-query-input"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. meta-llama/Llama-3.2-1B-Instruct or Qwen/Qwen2.5-Coder-7B"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono"
                />
              </div>

              {/* Popular Model Suggestions */}
              <div>
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
                  Popular Hugging Face Models:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {popularModels.map((m) => (
                    <button
                      key={m.name}
                      onClick={() => setQuery(m.name)}
                      className="text-left px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-amber-50/80 hover:border-amber-200 text-xs transition-colors flex items-center justify-between group"
                    >
                      <span className="font-mono text-neutral-800 truncate mr-2">{m.name.split('/')[1] || m.name}</span>
                      <span className="text-[10px] text-neutral-400 group-hover:text-amber-700 shrink-0 font-sans">
                        {m.tag}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RESEARCH PAPER DEMO */}
          {activeTab === 'paper' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  arXiv ID, URL, or Paper Title
                </label>
                <input
                  id="paper-query-input"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. arXiv:2106.09685 or Attention Is All You Need"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-sans"
                />
              </div>

              {/* Popular Landmark Papers */}
              <div>
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
                  Landmark Research Papers:
                </span>
                <div className="space-y-1.5">
                  {popularPapers.map((p) => (
                    <button
                      key={p.title}
                      onClick={() => setQuery(p.title + ` (arXiv:${p.arxiv})`)}
                      className="w-full text-left px-3 py-2 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-purple-50/80 hover:border-purple-200 text-xs transition-colors flex items-center justify-between group"
                    >
                      <span className="text-neutral-800 font-medium truncate mr-2">{p.title}</span>
                      <span className="text-[10px] font-mono text-neutral-400 group-hover:text-purple-700 shrink-0">
                        arXiv:{p.arxiv}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LOCAL FOLDER / CUSTOM CODE */}
          {activeTab === 'local_folder' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  Project or Folder Concept / Description
                </label>
                <input
                  id="folder-query-input"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Audio Classifier with Mel-Spectrogram Visualizer or RAG Retrieval Evaluator"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              {/* Upload Files Area */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  Attach Local Scripts & Files (Optional)
                </label>
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-neutral-300 hover:border-amber-400 rounded-xl cursor-pointer bg-neutral-50 hover:bg-amber-50/30 transition-colors">
                  <Upload className="w-5 h-5 text-neutral-400 mb-1" />
                  <span className="text-xs font-medium text-neutral-700">Click to upload .py, .txt, .json, .csv files</span>
                  <span className="text-[10px] text-neutral-400 mt-0.5">Auto-packaged into your Hugging Face Space repository</span>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {uploadedFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <span className="text-[11px] font-semibold text-neutral-500">Attached files ({uploadedFiles.length}):</span>
                    <div className="flex flex-wrap gap-1">
                      {uploadedFiles.map((f, i) => (
                        <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-200 text-neutral-800">
                          {f.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: AGENT COMMAND BUILDER */}
          {activeTab === 'agent_cmd' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                <div className="font-semibold flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-amber-700" />
                  Direct Hugging Face Space Agent Instruction:
                </div>
                <div className="p-2.5 rounded-lg bg-neutral-900 text-amber-300 font-mono text-xs overflow-x-auto select-all">
                  curl https://huggingface.co/new-space/agents.md and build me a Space with a demo for {query || '<a model, paper, or local folder>'}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  Custom Demo Goal / Agent Prompt
                </label>
                <textarea
                  rows={3}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Describe the exact demo you want to build..."
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {/* SDK Selection */}
          <div className="pt-2 border-t border-neutral-100 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">Space SDK</label>
              <select
                value={sdk}
                onChange={(e) => setSdk(e.target.value as SpaceSDK)}
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
              >
                <option value="gradio">Gradio 4.44 (Recommended for ML)</option>
                <option value="streamlit">Streamlit 1.38 (Dashboards & Metrics)</option>
                <option value="docker">Docker Space</option>
                <option value="static">Static HTML5/JS Space</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">Additional Requirements / Notes</label>
              <input
                type="text"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="e.g. Include temperature slider, dark mode, etc."
                className="w-full rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-200/60 transition-colors"
          >
            Cancel
          </button>

          <button
            id="generate-space-submit-btn"
            onClick={() => handleGenerate()}
            disabled={isGenerating || (!query.trim() && uploadedFiles.length === 0)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            {isGenerating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating Space Code & Schema...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Build Hugging Face Space</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
