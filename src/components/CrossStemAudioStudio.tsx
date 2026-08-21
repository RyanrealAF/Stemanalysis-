import React, { useState, useEffect, useRef } from 'react';
import { SpaceProject } from '../types';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Activity, 
  Music, 
  FileJson, 
  Download, 
  Layers, 
  Sliders, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Cpu, 
  RefreshCw,
  FolderOpen,
  FileAudio,
  Radio,
  FileCode,
  Share2
} from 'lucide-react';

interface StemData {
  id: string;
  name: string;
  category: 'vocals' | 'bass' | 'drums' | 'keys';
  color: string;
  volume: number; // 0 to 1
  isMuted: boolean;
  isSolo: boolean;
  baseFreq: number;
  rms: number;
  spectralCentroid: number; // in Hz
  chroma: number[]; // 12 pitch classes C, C#, D, D#, E, F, F#, G, G#, A, A#, B
  maskingRiskWith: string[];
}

const PRESET_TRACKS: { name: string; bpm: number; key: string; description: string; stems: StemData[] }[] = [
  {
    name: 'Neo-Soul Groove (4 Stems)',
    bpm: 92,
    key: 'E Minor / G Major',
    description: 'Pre-separated multi-track stems: Melodic Vocals, 808 Sub-Bass, Crisp Trap Drums, and Rhodes Electric Piano.',
    stems: [
      {
        id: 'vocals',
        name: 'vocals.wav',
        category: 'vocals',
        color: '#ec4899', // pink
        volume: 0.85,
        isMuted: false,
        isSolo: false,
        baseFreq: 440,
        rms: 0.224,
        spectralCentroid: 2450,
        chroma: [0.12, 0.05, 0.25, 0.78, 0.95, 0.32, 0.15, 0.88, 0.22, 0.65, 0.40, 0.18],
        maskingRiskWith: ['keys'],
      },
      {
        id: 'bass',
        name: 'bass.wav',
        category: 'bass',
        color: '#8b5cf6', // purple
        volume: 0.90,
        isMuted: false,
        isSolo: false,
        baseFreq: 82.4,
        rms: 0.310,
        spectralCentroid: 185,
        chroma: [0.08, 0.02, 0.15, 0.92, 0.10, 0.05, 0.04, 0.85, 0.02, 0.20, 0.05, 0.03],
        maskingRiskWith: ['drums'],
      },
      {
        id: 'drums',
        name: 'drums.wav',
        category: 'drums',
        color: '#f59e0b', // amber
        volume: 0.80,
        isMuted: false,
        isSolo: false,
        baseFreq: 120,
        rms: 0.285,
        spectralCentroid: 3820,
        chroma: [0.20, 0.18, 0.22, 0.21, 0.19, 0.23, 0.17, 0.24, 0.20, 0.19, 0.21, 0.18],
        maskingRiskWith: ['bass'],
      },
      {
        id: 'keys',
        name: 'keys.wav',
        category: 'keys',
        color: '#06b6d4', // cyan
        volume: 0.75,
        isMuted: false,
        isSolo: false,
        baseFreq: 330,
        rms: 0.180,
        spectralCentroid: 1650,
        chroma: [0.35, 0.10, 0.42, 0.85, 0.88, 0.40, 0.20, 0.91, 0.15, 0.72, 0.55, 0.25],
        maskingRiskWith: ['vocals'],
      },
    ],
  },
  {
    name: 'Synthwave Midnight (4 Stems)',
    bpm: 118,
    key: 'A Minor / C Major',
    description: 'Analog sawtooth bassline, 80s gated snare drums, vocal lead, and polysynth arpeggios.',
    stems: [
      {
        id: 'vocals',
        name: 'lead_vocals.wav',
        category: 'vocals',
        color: '#ec4899',
        volume: 0.9,
        isMuted: false,
        isSolo: false,
        baseFreq: 520,
        rms: 0.26,
        spectralCentroid: 2900,
        chroma: [0.85, 0.08, 0.22, 0.10, 0.78, 0.25, 0.05, 0.65, 0.12, 0.95, 0.18, 0.32],
        maskingRiskWith: ['keys'],
      },
      {
        id: 'bass',
        name: 'analog_bass.wav',
        category: 'bass',
        color: '#8b5cf6',
        volume: 0.95,
        isMuted: false,
        isSolo: false,
        baseFreq: 110,
        rms: 0.38,
        spectralCentroid: 320,
        chroma: [0.90, 0.02, 0.05, 0.04, 0.82, 0.03, 0.02, 0.15, 0.02, 0.98, 0.01, 0.04],
        maskingRiskWith: ['drums'],
      },
      {
        id: 'drums',
        name: 'retro_drums.wav',
        category: 'drums',
        color: '#f59e0b',
        volume: 0.85,
        isMuted: false,
        isSolo: false,
        baseFreq: 140,
        rms: 0.32,
        spectralCentroid: 4100,
        chroma: [0.15, 0.14, 0.16, 0.15, 0.18, 0.15, 0.14, 0.17, 0.15, 0.16, 0.15, 0.14],
        maskingRiskWith: ['bass'],
      },
      {
        id: 'keys',
        name: 'synth_arp.wav',
        category: 'keys',
        color: '#06b6d4',
        volume: 0.70,
        isMuted: false,
        isSolo: false,
        baseFreq: 440,
        rms: 0.21,
        spectralCentroid: 2100,
        chroma: [0.92, 0.05, 0.18, 0.08, 0.88, 0.12, 0.04, 0.75, 0.09, 0.90, 0.11, 0.20],
        maskingRiskWith: ['vocals'],
      },
    ],
  },
];

const CHROMA_LABELS = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];

interface CrossStemAudioStudioProps {
  project: SpaceProject;
  onOpenCodeTab?: () => void;
}

export const CrossStemAudioStudio: React.FC<CrossStemAudioStudioProps> = ({ project, onOpenCodeTab }) => {
  const [selectedPresetIdx, setSelectedPresetIdx] = useState<number>(0);
  const [stems, setStems] = useState<StemData[]>(PRESET_TRACKS[0].stems);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [stemDirectoryPath, setStemDirectoryPath] = useState<string>('/workspace/separated_stems/track_01');
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'matrix' | 'masking' | 'chroma' | 'midi' | 'json'>('matrix');
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [transcriptionDone, setTranscriptionDone] = useState<boolean>(true);
  const [quantizationGrid, setQuantizationGrid] = useState<string>('1/16');
  const [tempo, setTempo] = useState<number>(PRESET_TRACKS[0].bpm);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Web Audio Context reference
  const audioCtxRef = useRef<AudioContext | null>(null);
  const stemNodesRef = useRef<{ [key: string]: { osc: OscillatorNode; gain: GainNode } }>({});

  const currentPreset = PRESET_TRACKS[selectedPresetIdx];

  // Reconstruct master mix stats dynamically
  const anySolo = stems.some((s) => s.isSolo);
  const activeStems = stems.filter((s) => (anySolo ? s.isSolo : !s.isMuted));
  
  const masterRms = Math.sqrt(
    activeStems.reduce((acc, s) => acc + Math.pow(s.rms * s.volume, 2), 0)
  ) || 0.001;

  // Handle preset switch
  const handleSelectPreset = (idx: number) => {
    setSelectedPresetIdx(idx);
    const preset = PRESET_TRACKS[idx];
    setStems(preset.stems.map((s) => ({ ...s })));
    setTempo(preset.bpm);
    stopAudio();
  };

  const handleVolumeChange = (id: string, vol: number) => {
    setStems((prev) =>
      prev.map((s) => (s.id === id ? { ...s, volume: vol } : s))
    );
    if (stemNodesRef.current[id] && audioCtxRef.current) {
      stemNodesRef.current[id].gain.gain.setValueAtTime(vol, audioCtxRef.current.currentTime);
    }
  };

  const handleToggleMute = (id: string) => {
    setStems((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isMuted: !s.isMuted } : s))
    );
  };

  const handleToggleSolo = (id: string) => {
    setStems((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isSolo: !s.isSolo } : s))
    );
  };

  // Audio Playback Engine using Web Audio API synthesis to represent stems
  const startAudio = () => {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtxClass();
      }

      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;

      // Create stem oscillators
      stems.forEach((stem) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        if (stem.category === 'bass') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(stem.baseFreq, now);
        } else if (stem.category === 'vocals') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(stem.baseFreq, now);
        } else if (stem.category === 'keys') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(stem.baseFreq, now);
        } else {
          osc.type = 'square';
          osc.frequency.setValueAtTime(stem.baseFreq, now);
        }

        const effectiveVol = (anySolo ? (stem.isSolo ? stem.volume : 0) : (stem.isMuted ? 0 : stem.volume)) * 0.2;
        gain.gain.setValueAtTime(effectiveVol, now);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        stemNodesRef.current[stem.id] = { osc, gain };
      });

      setIsPlaying(true);
    } catch (e) {
      console.error('Audio engine start failed', e);
    }
  };

  const stopAudio = () => {
    Object.values(stemNodesRef.current).forEach(({ osc }) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {}
    });
    stemNodesRef.current = {};
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  // Real-time Master Waveform Canvas Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const renderWaveform = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Grid background lines
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < width; x += 40) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += 20) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Center baseline
      ctx.strokeStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Draw Individual Stem Waveforms lightly
      stems.forEach((stem) => {
        const isMuted = anySolo ? !stem.isSolo : stem.isMuted;
        if (isMuted) return;

        ctx.strokeStyle = stem.color + '44'; // translucent
        ctx.lineWidth = 1.5;
        ctx.beginPath();

        for (let x = 0; x < width; x++) {
          const t = (x / width) * 4 * Math.PI + phase * (stem.baseFreq / 100);
          const amp = stem.volume * (height * 0.2) * stem.rms;
          const y = height / 2 + Math.sin(t) * amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      // Draw Summed Master Waveform (Holistic In-Memory Reconstruction)
      ctx.strokeStyle = '#0f172a'; // dark solid
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      for (let x = 0; x < width; x++) {
        let masterY = height / 2;
        stems.forEach((stem) => {
          const isMuted = anySolo ? !stem.isSolo : stem.isMuted;
          if (!isMuted) {
            const t = (x / width) * 4 * Math.PI + phase * (stem.baseFreq / 100);
            const amp = stem.volume * (height * 0.28) * stem.rms;
            masterY += Math.sin(t) * amp;
          }
        });

        if (x === 0) ctx.moveTo(x, masterY);
        else ctx.lineTo(x, masterY);
      }
      ctx.stroke();

      phase += isPlaying ? 0.08 : 0.01;
      animationFrameRef.current = requestAnimationFrame(renderWaveform);
    };

    renderWaveform();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [stems, isPlaying, anySolo]);

  // Handle Basic Pitch Transcription Trigger
  const handleRunTranscription = () => {
    setIsTranscribing(true);
    setTimeout(() => {
      setIsTranscribing(false);
      setTranscriptionDone(true);
    }, 1200);
  };

  // Build Contextual Intelligence JSON Object
  const intelligenceReport = {
    global_metrics: {
      estimated_tempo: tempo,
      master_rms_energy: Number(masterRms.toFixed(4)),
      active_channels_count: activeStems.length,
      headroom_db: Number((20 * Math.log10(1 / (masterRms + 1e-4))).toFixed(2)),
    },
    stem_interactions: stems.reduce((acc: any, s) => {
      const effectiveRms = s.isMuted ? 0 : s.rms * s.volume;
      const energyRatio = Number((effectiveRms / (masterRms + 1e-6)).toFixed(4));
      acc[s.name] = {
        stem_category: s.category,
        energy_share_ratio: energyRatio,
        mean_spectral_centroid_hz: s.spectralCentroid,
        masking_conflicts: s.maskingRiskWith,
        harmonic_cqt_chroma_profile: s.chroma,
        spotify_basic_pitch_midi: `${s.name.replace('.wav', '')}_basic_pitch.mid`,
      };
      return acc;
    }, {}),
  };

  // Download JSON Report
  const downloadReport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(intelligenceReport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'cross_stem_intelligence.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Architecture Banner */}
      <div className="bg-white rounded-xl border border-neutral-200/80 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-mono font-bold border border-emerald-200">
                HF ZERO-COST PIPELINE
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 font-mono border border-neutral-200">
                Gradio 4.44 + Librosa 0.10 + Basic Pitch 0.2.7
              </span>
              <span className="text-xs text-neutral-500 font-mono">
                Edge In-Memory Processing ($0 Cloud Budget)
              </span>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
              Cross-Stem Contextual AI Engine
            </h1>
            <p className="text-xs text-neutral-600 max-w-3xl leading-relaxed">
              Multi-channel stem ingestion, zero-write in-memory master waveform reconstruction, 
              cross-tensor RMS energy & spectral centroid masking matrices, CQT chroma harmonic alignment, 
              and Spotify Basic Pitch polyphonic MIDI transcription.
            </p>
          </div>

          {/* Action Header Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlayback}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-all ${
                isPlaying 
                  ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                  : 'bg-neutral-900 hover:bg-neutral-800 text-white'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause Master Reconstruct</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Play Reconstructed Mix</span>
                </>
              )}
            </button>

            {onOpenCodeTab && (
              <button
                onClick={onOpenCodeTab}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium border border-neutral-200 transition-colors"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>View Space Code</span>
              </button>
            )}
          </div>
        </div>

        {/* Directory Ingestion Strip */}
        <div className="mt-5 pt-4 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-neutral-500 shrink-0" />
            <span className="text-xs font-bold text-neutral-700 shrink-0">Server Stem Directory:</span>
            <input
              type="text"
              value={stemDirectoryPath}
              onChange={(e) => setStemDirectoryPath(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1 text-xs font-mono text-neutral-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-neutral-500 font-medium">Demo Track:</span>
            <select
              value={selectedPresetIdx}
              onChange={(e) => handleSelectPreset(Number(e.target.value))}
              className="bg-white border border-neutral-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {PRESET_TRACKS.map((p, idx) => (
                <option key={idx} value={idx}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Multi-Track Stem Mixer & Master Waveform */}
        <div className="lg:col-span-5 space-y-4">
          {/* Master Mix In-Memory Waveform Canvas */}
          <div className="bg-white rounded-xl border border-neutral-200/80 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  In-Memory Holistic Reconstruction
                </h3>
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
                master_y = Σ(stems)
              </span>
            </div>

            {/* Canvas */}
            <div className="relative rounded-lg overflow-hidden border border-neutral-200 bg-neutral-900 h-32 flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={480}
                height={128}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] text-white font-mono">
                <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-neutral-500'}`} />
                <span>{isPlaying ? 'ACTIVE REAL-TIME DSP' : 'HOLDING MIX STATE'}</span>
              </div>
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-[10px] text-amber-300 font-mono">
                RMS: {masterRms.toFixed(3)} | {tempo} BPM
              </div>
            </div>

            <p className="text-[11px] text-neutral-500 leading-normal">
              Dynamically accumulated in RAM using NumPy array vectorization. Zero disk write bottlenecks.
            </p>
          </div>

          {/* 4-Channel Stem Fader Strip */}
          <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-neutral-700" />
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Isolated Stem Channels ({stems.length})
                </h3>
              </div>
              <button
                onClick={() => setStems(currentPreset.stems.map((s) => ({ ...s, volume: 0.8, isMuted: false, isSolo: false })))}
                className="text-[11px] text-neutral-500 hover:text-neutral-900 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Reset Faders
              </button>
            </div>

            <div className="space-y-3.5">
              {stems.map((stem) => {
                const energySharePercent = masterRms > 0 
                  ? Math.min(100, Math.round(((stem.rms * stem.volume) / masterRms) * 100))
                  : 0;

                return (
                  <div 
                    key={stem.id}
                    className={`p-3 rounded-lg border transition-all ${
                      stem.isSolo 
                        ? 'bg-amber-50/60 border-amber-300' 
                        : stem.isMuted 
                        ? 'bg-neutral-50/50 border-neutral-200 opacity-60' 
                        : 'bg-white border-neutral-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-3 h-3 rounded-full shrink-0" 
                          style={{ backgroundColor: stem.color }} 
                        />
                        <span className="text-xs font-bold text-neutral-900 font-mono">{stem.name}</span>
                        <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-600">
                          {stem.category}
                        </span>
                      </div>

                      {/* Solo & Mute Buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleSolo(stem.id)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-colors ${
                            stem.isSolo
                              ? 'bg-amber-500 text-white border-amber-600'
                              : 'bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-200'
                          }`}
                        >
                          SOLO
                        </button>
                        <button
                          onClick={() => handleToggleMute(stem.id)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-colors ${
                            stem.isMuted
                              ? 'bg-red-500 text-white border-red-600'
                              : 'bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-200'
                          }`}
                        >
                          MUTE
                        </button>
                      </div>
                    </div>

                    {/* Volume Slider & RMS Meter */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                        <span>Gain: {Math.round(stem.volume * 100)}%</span>
                        <span>Energy Share: {energySharePercent}%</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.01}
                          value={stem.volume}
                          onChange={(e) => handleVolumeChange(stem.id, Number(e.target.value))}
                          className="w-full accent-neutral-800 h-1.5 bg-neutral-200 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Micro Energy Bar */}
                      <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden flex">
                        <div
                          className="h-full rounded-full transition-all duration-150"
                          style={{
                            width: `${energySharePercent}%`,
                            backgroundColor: stem.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 7 Cols: Contextual Intelligence Matrix & Spotify Basic Pitch */}
        <div className="lg:col-span-7 space-y-4">
          {/* Analysis View Tabs */}
          <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-neutral-900">
                  Cross-Stem Intelligence Matrix
                </h3>
              </div>

              {/* Navigation Pills */}
              <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setActiveAnalysisTab('matrix')}
                  className={`px-2.5 py-1 rounded transition-all ${
                    activeAnalysisTab === 'matrix' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  Energy & Centroid
                </button>
                <button
                  onClick={() => setActiveAnalysisTab('masking')}
                  className={`px-2.5 py-1 rounded transition-all ${
                    activeAnalysisTab === 'masking' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  Masking Conflicts
                </button>
                <button
                  onClick={() => setActiveAnalysisTab('chroma')}
                  className={`px-2.5 py-1 rounded transition-all ${
                    activeAnalysisTab === 'chroma' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  CQT Chroma
                </button>
                <button
                  onClick={() => setActiveAnalysisTab('midi')}
                  className={`px-2.5 py-1 rounded transition-all ${
                    activeAnalysisTab === 'midi' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  Basic Pitch MIDI
                </button>
                <button
                  onClick={() => setActiveAnalysisTab('json')}
                  className={`px-2.5 py-1 rounded transition-all ${
                    activeAnalysisTab === 'json' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  JSON Report
                </button>
              </div>
            </div>

            {/* TAB 1: ENERGY SHARE & SPECTRAL CENTROID */}
            {activeAnalysisTab === 'matrix' && (
              <div className="space-y-5">
                {/* Global Metrics Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
                    <span className="text-[10px] text-neutral-400 font-semibold uppercase">Estimated Tempo</span>
                    <div className="text-base font-bold text-neutral-900 font-mono mt-0.5">{tempo} BPM</div>
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
                    <span className="text-[10px] text-neutral-400 font-semibold uppercase">Master RMS Energy</span>
                    <div className="text-base font-bold text-neutral-900 font-mono mt-0.5">{masterRms.toFixed(4)}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
                    <span className="text-[10px] text-neutral-400 font-semibold uppercase">Dynamic Range Headroom</span>
                    <div className="text-base font-bold text-emerald-700 font-mono mt-0.5">
                      {(20 * Math.log10(1 / (masterRms + 1e-4))).toFixed(1)} dB
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
                    <span className="text-[10px] text-neutral-400 font-semibold uppercase">Key Center Alignment</span>
                    <div className="text-base font-bold text-purple-700 font-mono mt-0.5">{currentPreset.key}</div>
                  </div>
                </div>

                {/* Stems Comparison Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-neutral-200 text-neutral-400 font-bold uppercase text-[10px]">
                        <th className="pb-2">Stem Channel</th>
                        <th className="pb-2">Dynamic RMS Share</th>
                        <th className="pb-2">Spectral Centroid (Frequency Center)</th>
                        <th className="pb-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 font-mono">
                      {stems.map((stem) => {
                        const effectiveRms = stem.isMuted ? 0 : stem.rms * stem.volume;
                        const ratio = masterRms > 0 ? (effectiveRms / masterRms) : 0;
                        return (
                          <tr key={stem.id} className="py-2.5">
                            <td className="py-2.5 font-bold text-neutral-900 flex items-center gap-1.5 font-sans">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stem.color }} />
                              {stem.name}
                            </td>
                            <td className="py-2.5">
                              <div className="flex items-center gap-2">
                                <span className="w-12">{Math.round(ratio * 100)}%</span>
                                <div className="w-24 bg-neutral-100 h-2 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full rounded-full" 
                                    style={{ width: `${Math.min(100, ratio * 100)}%`, backgroundColor: stem.color }} 
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 text-neutral-700">
                              <span className="font-bold">{stem.spectralCentroid} Hz</span>
                              <span className="text-neutral-400 text-[10px] ml-1">
                                {stem.spectralCentroid < 300 ? '(Sub/Low)' : stem.spectralCentroid < 1500 ? '(Low-Mid)' : stem.spectralCentroid < 3500 ? '(High-Mid)' : '(High Air)'}
                              </span>
                            </td>
                            <td className="py-2.5 text-right font-sans">
                              {stem.isMuted ? (
                                <span className="text-neutral-400 text-[11px]">Muted</span>
                              ) : (
                                <span className="text-emerald-700 font-semibold text-[11px] flex items-center justify-end gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Active
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: SPECTRAL MASKING CONFLICT DETECTOR */}
            {activeAnalysisTab === 'masking' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    Cross-Tensor Frequency Masking Diagnosis:
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Spectral centroids overlapping within the same critical band produce acoustic masking.
                    The engine flags potential mud or clashing between adjacent stem channels.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                        <span className="text-xs font-bold text-neutral-900">Low-End Conflict: bass.wav vs drums.wav</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold">
                        MODERATE COLLISION (60-140 Hz)
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      Kick drum transient overlaps with 808 sub-bass fundamental. Recommended sidechain compression or dynamic ducking at 82.4 Hz.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                        <span className="text-xs font-bold text-neutral-900">Mid-Range Pocket: vocals.wav vs keys.wav</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-semibold">
                        BALANCED SEPARATION (1.6 kHz vs 2.4 kHz)
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      Rhodes keys sit comfortably at 1650 Hz spectral centroid while lead vocals dominate the upper presence pocket at 2450 Hz.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: CONSTANT-Q TRANSFORM (CQT) CHROMA VECTORS */}
            {activeAnalysisTab === 'chroma' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-600">
                    12-semitone pitch class energy profile derived via <code className="font-mono bg-neutral-100 px-1 py-0.5 rounded">librosa.feature.chroma_cqt</code>
                  </span>
                  <span className="text-xs font-bold text-neutral-800">Key: {currentPreset.key}</span>
                </div>

                <div className="space-y-3">
                  {stems.map((stem) => (
                    <div key={stem.id} className="p-3 rounded-lg border border-neutral-200 bg-neutral-50/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stem.color }} />
                          <span className="text-xs font-bold text-neutral-900 font-mono">{stem.name}</span>
                        </div>
                        <span className="text-[10px] text-neutral-500 font-mono">12-Tone Distribution</span>
                      </div>

                      {/* 12 Chroma Pitch Bars */}
                      <div className="grid grid-cols-12 gap-1 h-12 items-end pt-2">
                        {stem.chroma.map((val, pIdx) => (
                          <div key={pIdx} className="flex flex-col items-center gap-1">
                            <div 
                              className="w-full rounded-t transition-all"
                              style={{ 
                                height: `${Math.max(4, val * 36)}px`,
                                backgroundColor: val > 0.6 ? stem.color : stem.color + '66'
                              }}
                            />
                            <span className="text-[9px] font-mono text-neutral-500">
                              {CHROMA_LABELS[pIdx]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: SPOTIFY BASIC PITCH MIDI TRANSCRIPTION */}
            {activeAnalysisTab === 'midi' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                      <Music className="w-4 h-4 text-emerald-700" />
                      <span>Spotify Basic Pitch Neural Polyphonic Transcription</span>
                    </div>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      Runs <code className="font-mono bg-white/60 px-1 py-0.2 rounded">basic_pitch.inference.predict_and_save</code> over isolated stems to generate clean polyphonic MIDI tracks.
                    </p>
                  </div>

                  <button
                    onClick={handleRunTranscription}
                    disabled={isTranscribing}
                    className="shrink-0 px-3.5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 disabled:bg-emerald-400 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    {isTranscribing ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Transcribing Stems...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Re-Transcribe All Stems</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Piano Roll Mock Note Matrix */}
                <div className="bg-neutral-950 rounded-xl p-4 border border-neutral-800 text-neutral-200 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                    <span className="text-amber-400 font-bold">Polyphonic MIDI Note Stream (Multi-Track)</span>
                    <span className="text-neutral-400 text-[10px]">Grid: 16th Notes | 120 Ticks/Beat</span>
                  </div>

                  <div className="space-y-2 py-2">
                    <div className="flex items-center gap-2">
                      <span className="w-20 text-[10px] text-pink-400 truncate">Vocal Mel:</span>
                      <div className="flex-1 bg-neutral-900 h-4 rounded flex items-center px-1 gap-2 overflow-hidden">
                        <span className="h-2 w-12 bg-pink-500 rounded text-[8px] text-black font-bold px-1">E4</span>
                        <span className="h-2 w-16 bg-pink-500 rounded text-[8px] text-black font-bold px-1">G4</span>
                        <span className="h-2 w-20 bg-pink-500 rounded text-[8px] text-black font-bold px-1">B4</span>
                        <span className="h-2 w-10 bg-pink-500 rounded text-[8px] text-black font-bold px-1">A4</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-20 text-[10px] text-purple-400 truncate">Bass Note:</span>
                      <div className="flex-1 bg-neutral-900 h-4 rounded flex items-center px-1 gap-2 overflow-hidden">
                        <span className="h-2 w-28 bg-purple-500 rounded text-[8px] text-white font-bold px-1">E1 (82Hz)</span>
                        <span className="h-2 w-24 bg-purple-500 rounded text-[8px] text-white font-bold px-1">G1</span>
                        <span className="h-2 w-32 bg-purple-500 rounded text-[8px] text-white font-bold px-1">C2</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-20 text-[10px] text-cyan-400 truncate">Keys Poly:</span>
                      <div className="flex-1 bg-neutral-900 h-4 rounded flex items-center px-1 gap-1 overflow-hidden">
                        <span className="h-2 w-14 bg-cyan-400 rounded text-[8px] text-black font-bold px-1">Em7</span>
                        <span className="h-2 w-16 bg-cyan-400 rounded text-[8px] text-black font-bold px-1">Am9</span>
                        <span className="h-2 w-20 bg-cyan-400 rounded text-[8px] text-black font-bold px-1">D7</span>
                        <span className="h-2 w-24 bg-cyan-400 rounded text-[8px] text-black font-bold px-1">Gmaj7</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Generated MIDI Files Download Table */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-neutral-800">Generated Output Files:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {stems.map((s) => (
                      <div key={s.id} className="p-2.5 rounded-lg border border-neutral-200 bg-neutral-50 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 truncate mr-2">
                          <Music className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                          <span className="font-mono text-neutral-800 truncate">{s.name.replace('.wav', '')}_basic_pitch.mid</span>
                        </div>
                        <button
                          onClick={() => {
                            alert(`Downloading MIDI transcription file: ${s.name.replace('.wav', '')}_basic_pitch.mid`);
                          }}
                          className="p-1 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 rounded"
                          title="Download MIDI stem"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: JSON INTELLIGENCE REPORT */}
            {activeAnalysisTab === 'json' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-neutral-500">cross_stem_intelligence.json</span>
                  <button
                    onClick={downloadReport}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 px-2.5 py-1 rounded transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download JSON Report</span>
                  </button>
                </div>

                <pre className="p-3.5 rounded-xl bg-neutral-900 text-emerald-300 font-mono text-xs overflow-x-auto leading-relaxed max-h-80 select-all">
                  {JSON.stringify(intelligenceReport, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
