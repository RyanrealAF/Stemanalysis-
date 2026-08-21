import React from 'react';
import { SpaceProject } from '../types';
import { 
  Sparkles, 
  FolderPlus, 
  Download, 
  Terminal, 
  ExternalLink, 
  Code2, 
  Play, 
  BookOpen, 
  Layers,
  ChevronDown
} from 'lucide-react';
import { exportSpaceAsZip } from '../utils/zipExport';

interface NavbarProps {
  currentProject: SpaceProject;
  projects: SpaceProject[];
  onSelectProject: (project: SpaceProject) => void;
  onOpenCreateModal: () => void;
  onOpenDeployModal: () => void;
  activeTab: 'playground' | 'code' | 'dossier' | 'deploy';
  setActiveTab: (tab: 'playground' | 'code' | 'dossier' | 'deploy') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentProject,
  projects,
  onSelectProject,
  onOpenCreateModal,
  onOpenDeployModal,
  activeTab,
  setActiveTab,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const handleDownloadZip = async () => {
    try {
      await exportSpaceAsZip(currentProject);
    } catch (e) {
      console.error('Failed to download space ZIP', e);
    }
  };

  return (
    <header className="border-b border-neutral-200 bg-white sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Branding & Space Switcher */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-amber-400/20 border border-amber-300 flex items-center justify-center text-xl shadow-xs">
                🤗
              </div>
              <div>
                <span className="font-semibold text-neutral-900 tracking-tight flex items-center gap-1.5 text-base">
                  HF Space Studio
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200">
                    Builder
                  </span>
                </span>
              </div>
            </div>

            {/* Space Dropdown Selector */}
            <div className="relative">
              <button
                id="space-selector-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 transition-colors text-sm font-medium text-neutral-800"
              >
                <span className="text-base">{currentProject.metadata.emoji}</span>
                <span className="max-w-[180px] sm:max-w-[240px] truncate">{currentProject.name}</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-700 uppercase font-mono">
                  {currentProject.metadata.sdk}
                </span>
                <ChevronDown className="w-4 h-4 text-neutral-500" />
              </button>

              {dropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setDropdownOpen(false)} 
                  />
                  <div className="absolute left-0 mt-1.5 w-80 rounded-xl bg-white border border-neutral-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-1 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      Active Spaces ({projects.length})
                    </div>
                    <div className="max-h-64 overflow-y-auto mt-1">
                      {projects.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            onSelectProject(p);
                            setDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-neutral-50 transition-colors ${
                            p.id === currentProject.id ? 'bg-amber-50/70 text-amber-950 font-medium' : 'text-neutral-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-base">{p.metadata.emoji}</span>
                            <span className="truncate">{p.name}</span>
                          </div>
                          <span className="text-[11px] text-neutral-400 capitalize">{p.category.replace('_', ' ')}</span>
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-neutral-100 mt-2 pt-2 px-2">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onOpenCreateModal();
                        }}
                        className="w-full text-left px-2 py-1.5 text-xs text-amber-700 hover:bg-amber-50 rounded-md font-medium flex items-center gap-1.5"
                      >
                        <FolderPlus className="w-3.5 h-3.5" />
                        Generate New Space (Model / Paper / Folder)
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Center: Navigation Tabs */}
          <nav className="hidden md:flex items-center bg-neutral-100 p-1 rounded-lg border border-neutral-200/80">
            <button
              id="tab-playground-btn"
              onClick={() => setActiveTab('playground')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'playground'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Play className="w-4 h-4 text-emerald-600" />
              Live Demo
            </button>
            <button
              id="tab-code-btn"
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'code'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Code2 className="w-4 h-4 text-blue-600" />
              Space Code ({currentProject.files.length})
            </button>
            <button
              id="tab-dossier-btn"
              onClick={() => setActiveTab('dossier')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'dossier'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <BookOpen className="w-4 h-4 text-purple-600" />
              {currentProject.category === 'paper' ? 'Paper Analysis' : currentProject.category === 'model' ? 'Model Specs' : 'Folder Details'}
            </button>
            <button
              id="tab-deploy-btn"
              onClick={() => setActiveTab('deploy')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'deploy'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Terminal className="w-4 h-4 text-amber-600" />
              HF Deploy & CLI
            </button>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2.5">
            <button
              id="new-space-btn"
              onClick={onOpenCreateModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Create Space</span>
            </button>

            <button
              id="download-zip-btn"
              onClick={handleDownloadZip}
              title="Download full ready-to-deploy Hugging Face Space repository ZIP"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-neutral-500" />
              <span className="hidden sm:inline">Export ZIP</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
