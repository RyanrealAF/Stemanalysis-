export type SpaceSDK = 'gradio' | 'streamlit' | 'docker' | 'static';

export type SpaceCategory = 'model' | 'paper' | 'local_folder';

export interface SpaceFile {
  path: string;
  content: string;
  language: string;
}

export interface SpaceMetadata {
  title: string;
  emoji: string;
  colorFrom: string;
  colorTo: string;
  sdk: SpaceSDK;
  sdk_version?: string;
  app_file: string;
  pinned?: boolean;
  short_description?: string;
  license?: string;
  tags?: string[];
  sourceReference?: string; // Model ID, Paper arXiv ID/title, or Folder name
}

export interface SpaceInputControl {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'slider' | 'select' | 'checkbox' | 'number';
  defaultValue: any;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  description?: string;
  placeholder?: string;
}

export interface SpaceExample {
  title: string;
  inputs: Record<string, any>;
  description?: string;
}

export interface SpaceProject {
  id: string;
  name: string;
  category: SpaceCategory;
  sourceTarget: string; // e.g. "meta-llama/Llama-3.2-1B-Instruct" or "LoRA (arXiv:2106.09685)" or "Custom Audio Classifier"
  metadata: SpaceMetadata;
  files: SpaceFile[];
  inputControls: SpaceInputControl[];
  examples: SpaceExample[];
  overviewMarkdown: string;
  paperDetails?: {
    arxivId?: string;
    authors?: string[];
    year?: string;
    abstract?: string;
    keyContributions?: string[];
    equations?: { name: string; formula: string; explanation: string }[];
  };
  modelDetails?: {
    modelId: string;
    architecture: string;
    parameters: string;
    contextLength?: string;
    pipelineTag: string;
    license: string;
  };
}

export interface DemoExecutionResult {
  outputText?: string;
  outputJson?: any;
  reasoningSteps?: string[];
  metrics?: {
    latencyMs: number;
    tokensGenerated?: number;
    throughputTokensSec?: number;
    memoryUsedMb?: number;
    peakVRAM?: string;
  };
  status: 'success' | 'error';
  errorMessage?: string;
}
