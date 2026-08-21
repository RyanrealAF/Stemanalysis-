import React, { useState } from 'react';
import { SpaceProject, SpaceFile } from './types';
import { TEMPLATE_PROJECTS } from './data/templates';
import { Navbar } from './components/Navbar';
import { PlaygroundView } from './components/PlaygroundView';
import { CodeEditorView } from './components/CodeEditorView';
import { PaperModelDossier } from './components/PaperModelDossier';
import { DeploymentModal } from './components/DeploymentModal';
import { CreateSpaceModal } from './components/CreateSpaceModal';

export default function App() {
  const [projects, setProjects] = useState<SpaceProject[]>(TEMPLATE_PROJECTS);
  const [currentProjectId, setCurrentProjectId] = useState<string>(TEMPLATE_PROJECTS[0].id);
  const [activeTab, setActiveTab] = useState<'playground' | 'code' | 'dossier' | 'deploy'>('playground');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const currentProject = projects.find((p) => p.id === currentProjectId) || projects[0];

  const handleSelectProject = (project: SpaceProject) => {
    setCurrentProjectId(project.id);
  };

  const handleSpaceCreated = (newProject: SpaceProject) => {
    setProjects((prev) => [newProject, ...prev]);
    setCurrentProjectId(newProject.id);
    setActiveTab('playground');
  };

  const handleUpdateFiles = (newFiles: SpaceFile[]) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === currentProject.id ? { ...p, files: newFiles } : p))
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans text-neutral-900 antialiased selection:bg-amber-400/30 selection:text-neutral-900">
      {/* Top Application Header */}
      <Navbar
        currentProject={currentProject}
        projects={projects}
        onSelectProject={handleSelectProject}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenDeployModal={() => setActiveTab('deploy')}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main View Port */}
      <main className="flex-1 pb-16">
        {activeTab === 'playground' && (
          <PlaygroundView
            project={currentProject}
            onOpenCodeTab={() => setActiveTab('code')}
          />
        )}

        {activeTab === 'code' && (
          <CodeEditorView
            project={currentProject}
            onUpdateFiles={handleUpdateFiles}
          />
        )}

        {activeTab === 'dossier' && (
          <PaperModelDossier project={currentProject} />
        )}

        {activeTab === 'deploy' && (
          <DeploymentModal project={currentProject} />
        )}
      </main>

      {/* Create Space Wizard Modal */}
      <CreateSpaceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSpaceCreated={handleSpaceCreated}
      />
    </div>
  );
}
