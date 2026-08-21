import React, { useState } from 'react';
import { SpaceProject } from '../types';
import { 
  Terminal, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  GitBranch, 
  ShieldCheck, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { exportSpaceAsZip } from '../utils/zipExport';

interface DeploymentModalProps {
  project: SpaceProject;
}

export const DeploymentModal: React.FC<DeploymentModalProps> = ({ project }) => {
  const [hfUsername, setHfUsername] = useState<string>('my-hf-username');
  const [repoName, setRepoName] = useState<string>(
    project.metadata.title.toLowerCase().replace(/[^a-z0-9-_]/g, '-')
  );
  const [copiedStep, setCopiedStep] = useState<string | null>(null);

  const cleanRepo = repoName || 'my-space-demo';

  const copyToClipboard = (text: string, stepId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepId);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const agentCommand = `curl https://huggingface.co/new-space/agents.md and build me a Space with a demo for ${project.name}`;

  const cliWorkflow = [
    {
      id: 'step1',
      title: '1. Install & Verify Hugging Face CLI',
      desc: 'Ensure the latest Hugging Face CLI tool is installed in your terminal.',
      cmd: 'curl -LsSf https://hf.co/cli/install.sh | bash\nhf --version',
    },
    {
      id: 'step2',
      title: '2. Login to Hugging Face',
      desc: 'Authenticate with your Hugging Face Access Token (read/write permissions).',
      cmd: 'hf auth login',
    },
    {
      id: 'step3',
      title: '3. Create New Space Repository',
      desc: `Create the remote Space repo configured with ${project.metadata.sdk.toUpperCase()} SDK.`,
      cmd: `hf spaces create ${cleanRepo} --sdk ${project.metadata.sdk} --public`,
    },
    {
      id: 'step4',
      title: '4. Clone and Push Space Code',
      desc: 'Clone the created space, copy your exported project files, and push to deploy.',
      cmd: `git clone https://huggingface.co/spaces/${hfUsername}/${cleanRepo}
cd ${cleanRepo}
# Place your app.py, requirements.txt, and README.md here
git add .
git commit -m "Deploy ${project.name} from Hugging Face Space Studio"
git push`,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-neutral-200/80 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono font-semibold">
                HF SPACES DEPLOYMENT
              </span>
              <span className="text-xs text-neutral-500">SDK: {project.metadata.sdk}</span>
            </div>
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight mt-1">
              Deploy "{project.name}" to Hugging Face
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              Export your project files or run step-by-step Hugging Face CLI commands to go live in seconds.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => exportSpaceAsZip(project)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Download Space ZIP Archive</span>
            </button>
          </div>
        </div>

        {/* Space Configurations Input Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-5 border-t border-neutral-100">
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1">
              Your Hugging Face Username / Organization
            </label>
            <input
              type="text"
              value={hfUsername}
              onChange={(e) => setHfUsername(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-neutral-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1">
              Hugging Face Space Repository Name
            </label>
            <input
              type="text"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-neutral-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Hugging Face Agent Instruction Box */}
      <div className="bg-amber-50/70 rounded-xl border border-amber-200/80 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-700" />
            <h3 className="text-sm font-bold text-amber-950">
              One-Click Hugging Face Agent Prompt
            </h3>
          </div>
          <button
            onClick={() => copyToClipboard(agentCommand, 'agent-prompt')}
            className="inline-flex items-center gap-1 text-xs text-amber-900 bg-white hover:bg-amber-100/70 border border-amber-300 px-2.5 py-1 rounded font-medium transition-colors shadow-2xs"
          >
            {copiedStep === 'agent-prompt' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedStep === 'agent-prompt' ? 'Copied' : 'Copy Prompt'}</span>
          </button>
        </div>
        <p className="text-xs text-amber-900/80">
          Paste this command into your terminal or agentic workspace to build and launch directly via the official Hugging Face agent skill:
        </p>
        <div className="p-3 rounded-lg bg-neutral-900 text-amber-300 font-mono text-xs overflow-x-auto select-all">
          {agentCommand}
        </div>
      </div>

      {/* Step-by-Step CLI Walkthrough */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-neutral-700" />
          Hugging Face CLI Step-by-Step Deployment
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {cliWorkflow.map((step) => (
            <div key={step.id} className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">{step.title}</h4>
                  <p className="text-[11px] text-neutral-500">{step.desc}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(step.cmd, step.id)}
                  className="inline-flex items-center gap-1 text-xs text-neutral-700 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 px-2.5 py-1 rounded font-medium transition-colors"
                >
                  {copiedStep === step.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedStep === step.id ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <pre className="p-3 rounded-lg bg-neutral-950 text-neutral-200 font-mono text-xs overflow-x-auto leading-relaxed">
                {step.cmd}
              </pre>
            </div>
          ))}
        </div>
      </div>

      {/* Hugging Face Space Metadata YAML Preview */}
      <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-neutral-700" />
            <h4 className="text-xs font-bold text-neutral-900">Space Metadata Configuration (README.md Frontmatter)</h4>
          </div>
          <span className="text-[11px] font-mono text-neutral-400">Hugging Face Space Spec</span>
        </div>

        <pre className="p-3 rounded-lg bg-neutral-900 text-amber-200 font-mono text-xs overflow-x-auto leading-relaxed">
{`---
title: ${project.metadata.title}
emoji: ${project.metadata.emoji}
colorFrom: ${project.metadata.colorFrom}
colorTo: ${project.metadata.colorTo}
sdk: ${project.metadata.sdk}
sdk_version: ${project.metadata.sdk_version || '4.44.0'}
app_file: ${project.metadata.app_file}
pinned: ${project.metadata.pinned || false}
license: ${project.metadata.license || 'mit'}
short_description: ${project.metadata.short_description || ''}
---`}
        </pre>
      </div>
    </div>
  );
};
