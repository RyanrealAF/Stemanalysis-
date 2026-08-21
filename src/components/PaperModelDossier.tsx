import React from 'react';
import { SpaceProject } from '../types';
import { 
  BookOpen, 
  Cpu, 
  ExternalLink, 
  CheckCircle2, 
  Code, 
  Layers, 
  FileText, 
  FolderTree,
  Quote
} from 'lucide-react';

interface PaperModelDossierProps {
  project: SpaceProject;
}

export const PaperModelDossier: React.FC<PaperModelDossierProps> = ({ project }) => {
  const isPaper = project.category === 'paper';
  const isModel = project.category === 'model';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Paper Dossier View */}
      {isPaper && project.paperDetails && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-xl border border-neutral-200/80 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-mono font-semibold border border-purple-200">
                    RESEARCH PAPER
                  </span>
                  {project.paperDetails.arxivId && (
                    <a
                      href={`https://arxiv.org/abs/${project.paperDetails.arxivId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-mono"
                    >
                      <span>arXiv:{project.paperDetails.arxivId}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <h2 className="text-xl font-bold text-neutral-900 tracking-tight">{project.name}</h2>
                {project.paperDetails.authors && (
                  <p className="text-xs text-neutral-600">
                    <span className="font-semibold text-neutral-800">Authors:</span> {project.paperDetails.authors.join(', ')} ({project.paperDetails.year || '2023'})
                  </p>
                )}
              </div>
            </div>

            {/* Abstract */}
            {project.paperDetails.abstract && (
              <div className="mt-5 pt-4 border-t border-neutral-100">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Abstract</h3>
                <p className="text-sm text-neutral-700 leading-relaxed italic bg-neutral-50/60 p-4 rounded-lg border border-neutral-100">
                  "{project.paperDetails.abstract}"
                </p>
              </div>
            )}
          </div>

          {/* Key Contributions & Mathematical Formulations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Key Contributions */}
            <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-semibold text-neutral-900">Key Scientific Contributions</h3>
              </div>
              <ul className="space-y-2.5 text-xs text-neutral-700 leading-relaxed">
                {project.paperDetails.keyContributions?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                      {idx + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Equations / Mathematical Insights */}
            <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
                <Code className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-semibold text-neutral-900">Mathematical Formulations</h3>
              </div>
              <div className="space-y-3">
                {project.paperDetails.equations?.map((eq, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-neutral-50 border border-neutral-200/70 space-y-1.5">
                    <div className="text-xs font-semibold text-neutral-900">{eq.name}</div>
                    <div className="py-1 px-2.5 bg-white rounded border border-neutral-200 font-mono text-xs text-purple-900 overflow-x-auto">
                      {eq.formula}
                    </div>
                    <p className="text-[11px] text-neutral-500">{eq.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Model Specifications View */}
      {isModel && project.modelDetails && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-neutral-200/80 p-6 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono font-semibold border border-blue-200">
                FOUNDATION MODEL CARD
              </span>
              <a
                href={`https://huggingface.co/${project.modelDetails.modelId}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-amber-700 hover:underline flex items-center gap-1 font-mono font-medium"
              >
                <span>Hugging Face Hub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <h2 className="text-xl font-bold text-neutral-900 tracking-tight mt-2">{project.modelDetails.modelId}</h2>
            <p className="text-xs text-neutral-500 font-mono mt-0.5">Architecture: {project.modelDetails.architecture}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
                <div className="text-[10px] text-neutral-400 uppercase font-semibold">Parameters</div>
                <div className="text-sm font-bold text-neutral-900 font-mono mt-0.5">{project.modelDetails.parameters}</div>
              </div>
              <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
                <div className="text-[10px] text-neutral-400 uppercase font-semibold">Context Window</div>
                <div className="text-sm font-bold text-neutral-900 font-mono mt-0.5">{project.modelDetails.contextLength || '4k tokens'}</div>
              </div>
              <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
                <div className="text-[10px] text-neutral-400 uppercase font-semibold">Pipeline Task</div>
                <div className="text-sm font-bold text-neutral-900 font-mono mt-0.5">{project.modelDetails.pipelineTag}</div>
              </div>
              <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
                <div className="text-[10px] text-neutral-400 uppercase font-semibold">License</div>
                <div className="text-sm font-bold text-neutral-900 font-mono mt-0.5 uppercase">{project.modelDetails.license}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* General Space Markdown Documentation */}
      <div className="bg-white rounded-xl border border-neutral-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
          <FileText className="w-4 h-4 text-neutral-700" />
          <h3 className="text-sm font-semibold text-neutral-900">Space Architecture & Technical Overview</h3>
        </div>

        <div className="prose prose-sm max-w-none text-neutral-700 leading-relaxed font-sans">
          <div className="whitespace-pre-wrap">{project.overviewMarkdown}</div>
        </div>
      </div>

      {/* Files Manifest Table */}
      <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
          <FolderTree className="w-4 h-4 text-neutral-700" />
          <h3 className="text-sm font-semibold text-neutral-900">Repository File Tree</h3>
        </div>
        <div className="divide-y divide-neutral-100 text-xs font-mono">
          {project.files.map((file) => (
            <div key={file.path} className="py-2 flex items-center justify-between">
              <span className="text-neutral-800 font-semibold">{file.path}</span>
              <span className="text-neutral-400">{file.content.split('\n').length} lines ({Math.round(file.content.length / 1024 * 10) / 10} KB)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
