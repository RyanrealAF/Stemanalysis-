import React, { useState, useEffect } from 'react';
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
  ArrowRight,
  Globe,
  AlertCircle,
  Key,
  CheckCircle2,
  Loader2,
  HelpCircle,
  CloudUpload,
  User,
  Github
} from 'lucide-react';
import { exportSpaceAsZip } from '../utils/zipExport';

interface DeploymentModalProps {
  project: SpaceProject;
}

export const DeploymentModal: React.FC<DeploymentModalProps> = ({ project }) => {
  // Load saved username or default to Ryanrealaf
  const [hfUsername, setHfUsername] = useState<string>(() => {
    const saved = localStorage.getItem('hf_username');
    if (!saved || saved === 'purarecoveryryan' || saved === 'my-hf-username') {
      return 'Ryanrealaf';
    }
    return saved;
  });
  const [hfToken, setHfToken] = useState<string>(() => {
    return localStorage.getItem('hf_token') || '';
  });
  const [repoName, setRepoName] = useState<string>(
    project.metadata.title.toLowerCase().replace(/[^a-z0-9-_]/g, '-')
  );
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [copiedStep, setCopiedStep] = useState<string | null>(null);

  // Deployment states
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [deployStatus, setDeployStatus] = useState<string | null>(null);
  const [deployError, setDeployError] = useState<string | null>(null);
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);
  const [verifiedUser, setVerifiedUser] = useState<string | null>(null);
  const [isVerifyingToken, setIsVerifyingToken] = useState<boolean>(false);

  const cleanUsername = hfUsername.trim() || 'username';
  const cleanRepo = repoName.trim() || 'my-space';
  const targetSpaceUrl = `https://huggingface.co/spaces/${cleanUsername}/${cleanRepo}`;

  useEffect(() => {
    if (hfUsername) {
      localStorage.setItem('hf_username', hfUsername);
    }
  }, [hfUsername]);

  useEffect(() => {
    if (hfToken) {
      localStorage.setItem('hf_token', hfToken);
      if (hfToken.length > 20) {
        verifyToken(hfToken);
      }
    }
  }, [hfToken]);

  const copyToClipboard = (text: string, stepId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepId);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const verifyToken = async (tokenToVerify: string) => {
    if (!tokenToVerify.trim()) return;
    setIsVerifyingToken(true);
    setDeployError(null);
    try {
      const res = await fetch('/api/verify-hf-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hfToken: tokenToVerify.trim() }),
      });
      const data = await res.json();
      if (data.valid && data.username) {
        setVerifiedUser(data.username);
        setHfUsername(data.username);
      } else {
        setVerifiedUser(null);
      }
    } catch {
      setVerifiedUser(null);
    } finally {
      setIsVerifyingToken(false);
    }
  };

  const handleDirectDeploy = async () => {
    if (!hfToken.trim()) {
      setDeployError('Please enter your Hugging Face Access Token (with Write permissions).');
      return;
    }

    setIsDeploying(true);
    setDeployError(null);
    setDeployStatus('Authenticating with Hugging Face Hub...');
    setDeployedUrl(null);

    try {
      setDeployStatus('Creating Space repository on Hugging Face...');
      const response = await fetch('/api/deploy-to-huggingface', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hfToken: hfToken.trim(),
          repoName: cleanRepo,
          sdk: project.metadata.sdk || 'gradio',
          isPrivate: isPrivate,
          files: project.files,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setDeployedUrl(data.spaceUrl);
        if (data.username) {
          setHfUsername(data.username);
        }
        setDeployStatus(null);
      } else {
        setDeployError(data.error || 'Failed to deploy to Hugging Face.');
        setDeployStatus(null);
      }
    } catch (err: any) {
      setDeployError(err.message || 'Network error during Hugging Face deployment.');
      setDeployStatus(null);
    } finally {
      setIsDeploying(false);
    }
  };

  const agentCommand = `curl https://huggingface.co/new-space/agents.md and build me a Space for ${project.name}`;

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
      desc: 'Authenticate with your Hugging Face Access Token (requires Write permissions).',
      cmd: 'hf auth login',
    },
    {
      id: 'step3',
      title: '3. Create New Space Repository',
      desc: `Create the remote Space repo configured with ${project.metadata.sdk.toUpperCase()} SDK under your username.`,
      cmd: `hf spaces create ${cleanRepo} --sdk ${project.metadata.sdk} ${isPrivate ? '--private' : '--public'}`,
    },
    {
      id: 'step4',
      title: '4. Clone and Push Space Code',
      desc: `Clone https://huggingface.co/spaces/${cleanUsername}/${cleanRepo}, copy your exported project files, and push to deploy.`,
      cmd: `git clone https://huggingface.co/spaces/${cleanUsername}/${cleanRepo}
cd ${cleanRepo}
# Downloaded ZIP files (app.py, requirements.txt, README.md) go here
git add .
git commit -m "Deploy ${project.name} from Space Studio"
git push`,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Explanation Banner: Why it is not on HF yet & Account link */}
      <div className="bg-amber-50/90 rounded-xl border border-amber-300 p-5 shadow-xs">
        <div className="flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
          <div className="space-y-1.5 flex-1">
            <h3 className="text-sm font-bold text-amber-950 flex items-center justify-between">
              <span>Publishing to Hugging Face Account ({cleanUsername})</span>
              <span className="text-xs font-mono font-normal text-amber-800 px-2 py-0.5 bg-amber-200/60 rounded">
                Target: spaces/{cleanUsername}/{cleanRepo}
              </span>
            </h3>
            <p className="text-xs text-amber-900 leading-relaxed">
              Because your Hugging Face account uses the same username as GitHub (<strong>{cleanUsername}</strong>), your published Space will be available at{' '}
              <a 
                href={targetSpaceUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="font-mono font-semibold underline text-amber-950 hover:text-black inline-flex items-center gap-0.5"
              >
                <span>{targetSpaceUrl}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              . To sync and launch it now, paste your Hugging Face Access Token below or run the step-by-step CLI commands.
            </p>
          </div>
        </div>
      </div>

      {/* Account & Username Configuration Card */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-neutral-900">Hugging Face & GitHub Username</h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                  Synced Handle
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                All git clone URLs, Space repository IDs, and CLI scripts dynamically use this username
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs font-mono text-neutral-400">@</span>
              <input
                id="hf-username-input"
                type="text"
                value={hfUsername}
                onChange={(e) => setHfUsername(e.target.value)}
                placeholder="e.g. Ryanrealaf"
                className="pl-7 pr-3 py-1.5 rounded-lg border border-neutral-300 text-xs font-mono text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 w-48 sm:w-56"
              />
            </div>
            <a
              href={`https://huggingface.co/${cleanUsername}`}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-xs font-medium text-neutral-700 transition-colors inline-flex items-center gap-1"
              title="View Hugging Face Profile"
            >
              <span>HF Profile</span>
              <ExternalLink className="w-3 h-3 text-neutral-500" />
            </a>
            <a
              href={`https://github.com/${cleanUsername}`}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-xs font-medium text-neutral-700 transition-colors inline-flex items-center gap-1"
              title="View GitHub Profile"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3 text-neutral-500" />
            </a>
          </div>
        </div>
      </div>

      {/* 1-Click Direct Hugging Face API Deployment Card */}
      <div className="bg-white rounded-xl border border-amber-200 p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-xs">
              🤗
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-neutral-900">Direct Hugging Face Hub Deployment</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider">
                  Automated API
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Push <span className="font-mono text-neutral-700">app.py</span>, <span className="font-mono text-neutral-700">requirements.txt</span>, and metadata directly to <span className="font-mono text-neutral-800 font-bold">spaces/{cleanUsername}/{cleanRepo}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportSpaceAsZip(project)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-xs font-semibold text-neutral-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-neutral-500" />
              <span>Download ZIP</span>
            </button>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-600" />
                Hugging Face User Access Token (Write Scope)
              </label>
              <a 
                href="https://huggingface.co/settings/tokens" 
                target="_blank" 
                rel="noreferrer"
                className="text-[11px] font-medium text-amber-700 hover:underline inline-flex items-center gap-0.5"
              >
                <span>Get your HF Token</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <input
                id="hf-access-token-input"
                type="password"
                placeholder="hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={hfToken}
                onChange={(e) => {
                  setHfToken(e.target.value);
                  if (e.target.value.length > 20) {
                    verifyToken(e.target.value);
                  }
                }}
                className="w-full rounded-lg border border-neutral-200 px-3.5 py-2 text-xs font-mono text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
              {isVerifyingToken && (
                <div className="absolute right-3 top-2.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-400" />
                </div>
              )}
            </div>
            {verifiedUser ? (
              <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Authenticated with Hugging Face as: <span className="font-mono font-bold">{verifiedUser}</span>
              </p>
            ) : (
              <p className="text-[11px] text-neutral-500">
                Go to <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noreferrer" className="underline text-amber-700 font-medium">huggingface.co/settings/tokens</a> → New token → Select <strong>Write</strong> role.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-800 block">
              Space Repository Name
            </label>
            <input
              id="hf-repo-name-input"
              type="text"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              placeholder="e.g. cross-stem-audio-engine"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-mono text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="private-space-toggle"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 border-neutral-300"
              />
              <label htmlFor="private-space-toggle" className="text-xs text-neutral-600 cursor-pointer">
                Private Repository
              </label>
            </div>
          </div>
        </div>

        {/* Error message */}
        {deployError && (
          <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">Deployment Notice:</span>
              <p>{deployError}</p>
            </div>
          </div>
        )}

        {/* Success / Live URL card */}
        {deployedUrl && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Space Successfully Pushed to Hugging Face!</span>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-200/60 text-emerald-950 font-semibold">
                Status: Building Container
              </span>
            </div>
            <p className="text-xs text-emerald-800">
              Your files have been committed to Hugging Face Hub under <span className="font-mono font-bold">@{cleanUsername}</span>. Hugging Face is now launching your {project.metadata.sdk.toUpperCase()} container.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href={deployedUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span>Open Live Space on Hugging Face</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => copyToClipboard(deployedUrl, 'live-url')}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-white border border-emerald-300 text-emerald-900 hover:bg-emerald-100/50 text-xs font-medium transition-colors"
              >
                {copiedStep === 'live-url' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedStep === 'live-url' ? 'Copied Link' : 'Copy URL'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Deploy Action Button */}
        <div>
          <button
            id="hf-deploy-now-btn"
            onClick={handleDirectDeploy}
            disabled={isDeploying}
            className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-sm transition-all ${
              isDeploying
                ? 'bg-amber-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 active:scale-[0.99]'
            }`}
          >
            {isDeploying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{deployStatus || 'Deploying to Hugging Face...'}</span>
              </>
            ) : (
              <>
                <CloudUpload className="w-4 h-4" />
                <span>Publish & Deploy Directly to Hugging Face (@{cleanUsername})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
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
          Paste this command into your terminal or agentic workspace to build and launch directly via the official Hugging Face agent:
        </p>
        <div className="p-3 rounded-lg bg-neutral-900 text-amber-300 font-mono text-xs overflow-x-auto select-all">
          {agentCommand}
        </div>
      </div>

      {/* Step-by-Step CLI Walkthrough */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-neutral-700" />
          Alternative: Hugging Face CLI & Git Deployment Steps (@{cleanUsername})
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
