import React, { useState } from 'react';
import { SpaceProject, DemoExecutionResult } from '../types';
import { 
  Play, 
  RotateCcw, 
  Copy, 
  Check, 
  Cpu, 
  Clock, 
  Zap, 
  Sparkles, 
  Terminal, 
  Sliders, 
  HelpCircle,
  Code,
  LayoutTemplate,
  Music,
  FileText
} from 'lucide-react';
import { CrossStemAudioStudio } from './CrossStemAudioStudio';

interface PlaygroundViewProps {
  project: SpaceProject;
  onOpenCodeTab: () => void;
}

export const PlaygroundView: React.FC<PlaygroundViewProps> = ({ project, onOpenCodeTab }) => {
  const isAudioPipeline = project.id === 'cross-stem-contextual-engine' || 
    project.metadata.tags?.includes('audio-processing') ||
    project.metadata.tags?.includes('basic-pitch');

  const [audioViewMode, setAudioViewMode] = useState<'studio' | 'gradio'>('studio');

  // Initialize form state from project input controls
  const [formValues, setFormValues] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    for (const ctrl of project.inputControls) {
      initial[ctrl.id] = ctrl.defaultValue;
    }
    return initial;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<DemoExecutionResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [showThinking, setShowThinking] = useState<boolean>(true);
  const [themeMode, setThemeMode] = useState<'gradio' | 'streamlit'>(
    project.metadata.sdk === 'streamlit' ? 'streamlit' : 'gradio'
  );

  // Update form inputs if project changes
  React.useEffect(() => {
    const initial: Record<string, any> = {};
    for (const ctrl of project.inputControls) {
      initial[ctrl.id] = ctrl.defaultValue;
    }
    setFormValues(initial);
    setResult(null);
    setThemeMode(project.metadata.sdk === 'streamlit' ? 'streamlit' : 'gradio');
  }, [project.id]);

  const handleInputChange = (id: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleLoadExample = (exampleInputs: Record<string, any>) => {
    setFormValues((prev) => ({ ...prev, ...exampleInputs }));
  };

  const handleRunInference = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/run-space-inference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spaceProject: project,
          inputs: formValues,
        }),
      });

      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setResult(data);
      } else {
        setResult({
          status: 'error',
          errorMessage: data.errorMessage || 'Inference execution failed.',
          metrics: { latencyMs: 0 },
        });
      }
    } catch (err: any) {
      setResult({
        status: 'error',
        errorMessage: err.message || 'Network error executing pipeline inference.',
        metrics: { latencyMs: 0 },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyOutput = () => {
    if (!result?.outputText) return;
    navigator.clipboard.writeText(result.outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Space Hero Banner */}
      <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl shrink-0 shadow-xs">
              {project.metadata.emoji || '🤗'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-neutral-900 tracking-tight">{project.name}</h1>
                <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-medium border ${
                  project.metadata.sdk === 'gradio' 
                    ? 'bg-amber-50 text-amber-800 border-amber-200' 
                    : 'bg-red-50 text-red-800 border-red-200'
                }`}>
                  {project.metadata.sdk.toUpperCase()} {project.metadata.sdk_version || '4.x'}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200 capitalize">
                  {project.category.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm text-neutral-600 mt-1">
                {project.metadata.short_description || `Interactive Hugging Face Space for ${project.sourceTarget}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isAudioPipeline && (
              <div className="flex items-center bg-emerald-50 border border-emerald-200 rounded-lg p-0.5 text-xs font-semibold">
                <button
                  onClick={() => setAudioViewMode('studio')}
                  className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-all ${
                    audioViewMode === 'studio' 
                      ? 'bg-emerald-700 text-white shadow-2xs' 
                      : 'text-emerald-800 hover:text-emerald-950'
                  }`}
                >
                  <Music className="w-3.5 h-3.5" />
                  <span>DSP Studio</span>
                </button>
                <button
                  onClick={() => setAudioViewMode('gradio')}
                  className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-all ${
                    audioViewMode === 'gradio' 
                      ? 'bg-emerald-700 text-white shadow-2xs' 
                      : 'text-emerald-800 hover:text-emerald-950'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Gradio UI</span>
                </button>
              </div>
            )}

            <button
              onClick={() => setThemeMode(themeMode === 'gradio' ? 'streamlit' : 'gradio')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-xs font-medium text-neutral-700 transition-colors"
              title="Toggle SDK interface theme"
            >
              <LayoutTemplate className="w-3.5 h-3.5 text-neutral-500" />
              <span>Skin: {themeMode === 'gradio' ? 'Gradio 4' : 'Streamlit'}</span>
            </button>

            <button
              onClick={onOpenCodeTab}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-medium text-neutral-700 transition-colors"
            >
              <Code className="w-3.5 h-3.5 text-blue-600" />
              <span>View app.py</span>
            </button>
          </div>
        </div>

        {/* Quick Tags */}
        {project.metadata.tags && project.metadata.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-neutral-100">
            <span className="text-xs text-neutral-400 mr-1 font-medium">Tags:</span>
            {project.metadata.tags.map((tag) => (
              <span key={tag} className="text-[11px] px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 font-mono">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Render CrossStemAudioStudio when active and studio mode selected */}
      {isAudioPipeline && audioViewMode === 'studio' ? (
        <CrossStemAudioStudio project={project} onOpenCodeTab={onOpenCodeTab} />
      ) : (
        <>
          {/* Preset Test Scenarios */}
          {project.examples && project.examples.length > 0 && (
            <div className="bg-amber-50/50 rounded-xl border border-amber-200/60 p-3.5 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900 shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Production Scenarios & Test Stems:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {project.examples.map((ex, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleLoadExample(ex.inputs)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-white hover:bg-amber-100/70 text-amber-950 border border-amber-200 transition-colors text-left shadow-2xs flex items-center gap-1.5 font-medium"
                  >
                    <span>{ex.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

      {/* Interactive Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Parameters & Controls */}
        <div className="lg:col-span-5 space-y-4">
          <div className={`rounded-xl border p-5 shadow-xs transition-colors ${
            themeMode === 'gradio' 
              ? 'bg-white border-neutral-200' 
              : 'bg-white border-red-100 ring-1 ring-red-50'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-neutral-700" />
                <h3 className="text-sm font-semibold text-neutral-900">
                  {themeMode === 'gradio' ? 'Gradio Components & Inputs' : 'Streamlit Sidebar & Controls'}
                </h3>
              </div>
              <button
                onClick={() => {
                  const initial: Record<string, any> = {};
                  for (const ctrl of project.inputControls) {
                    initial[ctrl.id] = ctrl.defaultValue;
                  }
                  setFormValues(initial);
                }}
                className="text-xs text-neutral-500 hover:text-neutral-800 flex items-center gap-1 transition-colors"
                title="Reset to defaults"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* Dynamic Controls List */}
            <div className="space-y-4 mt-4">
              {project.inputControls.map((ctrl) => {
                const val = formValues[ctrl.id];

                if (ctrl.type === 'textarea') {
                  return (
                    <div key={ctrl.id} className="space-y-1.5">
                      <label className="block text-xs font-semibold text-neutral-800">
                        {ctrl.label}
                      </label>
                      <textarea
                        id={`input-${ctrl.id}`}
                        rows={4}
                        value={val !== undefined ? val : ''}
                        onChange={(e) => handleInputChange(ctrl.id, e.target.value)}
                        placeholder={ctrl.placeholder || ''}
                        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-sans transition-all"
                      />
                      {ctrl.description && (
                        <p className="text-[11px] text-neutral-500">{ctrl.description}</p>
                      )}
                    </div>
                  );
                }

                if (ctrl.type === 'slider') {
                  const min = ctrl.min ?? 0;
                  const max = ctrl.max ?? 100;
                  const step = ctrl.step ?? 1;
                  return (
                    <div key={ctrl.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <label className="font-semibold text-neutral-800">{ctrl.label}</label>
                        <span className="font-mono font-medium text-neutral-700 bg-neutral-100 px-1.5 py-0.5 rounded text-[11px]">
                          {val}
                        </span>
                      </div>
                      <input
                        id={`input-${ctrl.id}`}
                        type="range"
                        min={min}
                        max={max}
                        step={step}
                        value={val !== undefined ? val : min}
                        onChange={(e) => handleInputChange(ctrl.id, parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                      <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                        <span>{min}</span>
                        <span>{max}</span>
                      </div>
                      {ctrl.description && (
                        <p className="text-[11px] text-neutral-500">{ctrl.description}</p>
                      )}
                    </div>
                  );
                }

                if (ctrl.type === 'select') {
                  return (
                    <div key={ctrl.id} className="space-y-1.5">
                      <label className="block text-xs font-semibold text-neutral-800">
                        {ctrl.label}
                      </label>
                      <select
                        id={`input-${ctrl.id}`}
                        value={val !== undefined ? val : ''}
                        onChange={(e) => handleInputChange(ctrl.id, e.target.value)}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                      >
                        {ctrl.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      {ctrl.description && (
                        <p className="text-[11px] text-neutral-500">{ctrl.description}</p>
                      )}
                    </div>
                  );
                }

                if (ctrl.type === 'checkbox') {
                  return (
                    <div key={ctrl.id} className="flex items-start gap-2.5 pt-1">
                      <input
                        id={`input-${ctrl.id}`}
                        type="checkbox"
                        checked={Boolean(val)}
                        onChange={(e) => handleInputChange(ctrl.id, e.target.checked)}
                        className="w-4 h-4 mt-0.5 rounded border-neutral-300 text-amber-600 focus:ring-amber-500"
                      />
                      <div>
                        <label htmlFor={`input-${ctrl.id}`} className="text-xs font-semibold text-neutral-800 cursor-pointer">
                          {ctrl.label}
                        </label>
                        {ctrl.description && (
                          <p className="text-[11px] text-neutral-500 mt-0.5">{ctrl.description}</p>
                        )}
                      </div>
                    </div>
                  );
                }

                if (ctrl.type === 'number') {
                  return (
                    <div key={ctrl.id} className="space-y-1.5">
                      <label className="block text-xs font-semibold text-neutral-800">
                        {ctrl.label}
                      </label>
                      <input
                        id={`input-${ctrl.id}`}
                        type="number"
                        min={ctrl.min}
                        max={ctrl.max}
                        step={ctrl.step || 1}
                        value={val !== undefined ? val : 0}
                        onChange={(e) => handleInputChange(ctrl.id, Number(e.target.value))}
                        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                      />
                    </div>
                  );
                }

                // Default text input
                return (
                  <div key={ctrl.id} className="space-y-1.5">
                    <label className="block text-xs font-semibold text-neutral-800">
                      {ctrl.label}
                    </label>
                    <input
                      id={`input-${ctrl.id}`}
                      type="text"
                      value={val !== undefined ? val : ''}
                      onChange={(e) => handleInputChange(ctrl.id, e.target.value)}
                      placeholder={ctrl.placeholder || ''}
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    />
                    {ctrl.description && (
                      <p className="text-[11px] text-neutral-500">{ctrl.description}</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Run Button */}
            <div className="mt-6 pt-4 border-t border-neutral-100">
              <button
                id="run-space-inference-btn"
                onClick={handleRunInference}
                disabled={isLoading}
                className={`w-full py-2.5 px-4 rounded-lg font-medium text-sm text-white flex items-center justify-center gap-2 shadow-xs transition-all ${
                  isLoading
                    ? 'bg-amber-400 cursor-not-allowed'
                    : themeMode === 'gradio'
                    ? 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800'
                    : 'bg-red-600 hover:bg-red-700 active:bg-red-800'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Executing Pipeline Inference...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Execute Space Inference</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Output & Telemetry Container */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs min-h-[420px] flex flex-col justify-between">
            <div>
              {/* Output Header */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-semibold text-neutral-900">
                    Live Space Output & Telemetry
                  </h3>
                </div>

                {result && result.outputText && (
                  <button
                    onClick={handleCopyOutput}
                    className="inline-flex items-center gap-1 text-xs text-neutral-600 hover:text-neutral-900 px-2.5 py-1 rounded bg-neutral-100 hover:bg-neutral-200 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>

              {/* Main Output Box */}
              <div className="mt-4">
                {isLoading ? (
                  <div className="py-16 text-center space-y-3">
                    <div className="inline-block p-3 rounded-full bg-amber-50 text-amber-600 animate-pulse">
                      <Zap className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-neutral-700">Running model & DSP inference pipeline...</p>
                    <p className="text-xs text-neutral-400">Processing input parameters & generating response</p>
                  </div>
                ) : result ? (
                  <div className="space-y-4">
                    {/* Error state */}
                    {result.status === 'error' && (
                      <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
                        <p className="font-semibold">Execution Error</p>
                        <p className="mt-1 text-xs">{result.errorMessage}</p>
                      </div>
                    )}

                    {/* Reasoning / Chain of Thought Accordion */}
                    {result.reasoningSteps && result.reasoningSteps.length > 0 && (
                      <div className="rounded-lg border border-indigo-100 bg-indigo-50/40 p-3.5">
                        <button
                          onClick={() => setShowThinking(!showThinking)}
                          className="w-full flex items-center justify-between text-xs font-semibold text-indigo-900 text-left"
                        >
                          <span className="flex items-center gap-1.5">
                            🧠 Chain-of-Thought Trace ({result.reasoningSteps.length} steps)
                          </span>
                          <span className="text-[11px] text-indigo-600">{showThinking ? 'Hide' : 'Show'}</span>
                        </button>
                        {showThinking && (
                          <div className="mt-2 space-y-1 text-xs text-indigo-950 font-mono pl-2 border-l-2 border-indigo-300">
                            {result.reasoningSteps.map((step, sIdx) => (
                              <div key={sIdx} className="py-0.5">
                                • {step}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Final Output Content */}
                    {result.outputText && (
                      <div className="rounded-lg bg-neutral-50 border border-neutral-200/80 p-4 font-sans text-sm text-neutral-800 leading-relaxed whitespace-pre-wrap">
                        {result.outputText}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-16 text-center space-y-2 text-neutral-400">
                    <Play className="w-8 h-8 mx-auto stroke-1 text-neutral-300" />
                    <p className="text-sm font-medium text-neutral-600">Ready to run</p>
                    <p className="text-xs text-neutral-400">
                      Configure your inputs on the left and click "Execute Space Inference" to test this Space.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Performance Telemetry Strip */}
            {result?.metrics && (
              <div className="mt-6 pt-3 border-t border-neutral-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 rounded bg-neutral-50 border border-neutral-100">
                  <div className="flex items-center gap-1 text-neutral-400 text-[10px] uppercase font-semibold">
                    <Clock className="w-3 h-3 text-neutral-500" />
                    Latency
                  </div>
                  <div className="text-neutral-800 font-bold font-mono mt-0.5">
                    {result.metrics.latencyMs} ms
                  </div>
                </div>

                <div className="p-2 rounded bg-neutral-50 border border-neutral-100">
                  <div className="flex items-center gap-1 text-neutral-400 text-[10px] uppercase font-semibold">
                    <Zap className="w-3 h-3 text-amber-500" />
                    Tokens
                  </div>
                  <div className="text-neutral-800 font-bold font-mono mt-0.5">
                    {result.metrics.tokensGenerated || '~200'}
                  </div>
                </div>

                <div className="p-2 rounded bg-neutral-50 border border-neutral-100">
                  <div className="flex items-center gap-1 text-neutral-400 text-[10px] uppercase font-semibold">
                    <Cpu className="w-3 h-3 text-blue-500" />
                    Throughput
                  </div>
                  <div className="text-neutral-800 font-bold font-mono mt-0.5">
                    {result.metrics.throughputTokensSec ? `${result.metrics.throughputTokensSec} t/s` : '64.2 t/s'}
                  </div>
                </div>

                <div className="p-2 rounded bg-neutral-50 border border-neutral-100">
                  <div className="flex items-center gap-1 text-neutral-400 text-[10px] uppercase font-semibold">
                    <Sparkles className="w-3 h-3 text-purple-500" />
                    VRAM
                  </div>
                  <div className="text-neutral-800 font-bold font-mono mt-0.5">
                    {result.metrics.peakVRAM || '3.2 GB'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
};
