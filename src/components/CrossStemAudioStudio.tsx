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
  Share2,
  Flame,
  Disc,
  SlidersHorizontal,
  Clock,
  Gauge
} from 'lucide-react';

export type HipHopSubGenre = 'trap' | 'boombap';

export interface StemData {
  id: string;
  name: string;
  category: '808' | 'kick' | 'bass' | 'drums' | 'hats' | 'melody' | 'vocals';
  color: string;
  volume: number; // 0 to 1
  isMuted: boolean;
  isSolo: boolean;
  baseFreq: number;
  rms: number;
  spectralCentroid: number; // in Hz
  chroma: number[]; // 12 pitch classes C, C#, D, D#, E, F, F#, G, G#, A, A#, B
  maskingRiskWith: string[];
  transientPunch: number; // 0 to 100
  harmonicSaturate: number; // 0 to 100
  swingOffsetMs?: number;
}

export interface PresetTrack {
  id: string;
  name: string;
  genre: HipHopSubGenre;
  bpm: number;
  key: string;
  swingPct: number;
  description: string;
  subAnalysis: {
    lowEndBalance: string;
    subClashScore: number; // 0 to 100
    rhythmGrid: string;
    sampleCharacter: string;
  };
  stems: StemData[];
}

export const PRESET_TRACKS: PresetTrack[] = [
  {
    id: 'atlanta-808-trap',
    name: 'Atlanta 808 Trap Anthem',
    genre: 'trap',
    bpm: 142,
    key: 'F Minor (Dark Trap Scale)',
    swingPct: 50, // Straight quantized with high-speed triplets
    description: 'Deep saturated 808 sub-bass with pitch slides, sharp clipped kick punch, rolling 1/32 triplet hi-hats, and eerie minor bell melody.',
    subAnalysis: {
      lowEndBalance: '808 Dominant (38Hz Fundamental) with Tight Kick Punch (58Hz)',
      subClashScore: 78,
      rhythmGrid: '1/32 Triplet Rolls + Syncopated Claps',
      sampleCharacter: 'Modern High-Res Digital Sizzle + Saturated Lows',
    },
    stems: [
      {
        id: '808_sub',
        name: '808_sub_glide.wav',
        category: '808',
        color: '#dc2626', // red
        volume: 0.95,
        isMuted: false,
        isSolo: false,
        baseFreq: 43.65, // F1
        rms: 0.440,
        spectralCentroid: 115,
        chroma: [0.05, 0.02, 0.04, 0.08, 0.12, 0.95, 0.03, 0.15, 0.85, 0.08, 0.04, 0.70],
        maskingRiskWith: ['kick_punch.wav'],
        transientPunch: 65,
        harmonicSaturate: 88,
      },
      {
        id: 'kick',
        name: 'kick_punch.wav',
        category: 'kick',
        color: '#ea580c', // orange
        volume: 0.88,
        isMuted: false,
        isSolo: false,
        baseFreq: 60.0,
        rms: 0.360,
        spectralCentroid: 240,
        chroma: [0.08, 0.02, 0.04, 0.05, 0.10, 0.80, 0.02, 0.10, 0.75, 0.04, 0.02, 0.60],
        maskingRiskWith: ['808_sub_glide.wav'],
        transientPunch: 96,
        harmonicSaturate: 60,
      },
      {
        id: 'hats_snare',
        name: 'trap_hats_snare.wav',
        category: 'hats',
        color: '#eab308', // amber
        volume: 0.82,
        isMuted: false,
        isSolo: false,
        baseFreq: 4800,
        rms: 0.280,
        spectralCentroid: 7950,
        chroma: [0.15, 0.14, 0.15, 0.16, 0.15, 0.15, 0.14, 0.15, 0.16, 0.15, 0.14, 0.15],
        maskingRiskWith: ['dark_bell_melody.wav'],
        transientPunch: 92,
        harmonicSaturate: 40,
      },
      {
        id: 'bell_melody',
        name: 'dark_bell_melody.wav',
        category: 'melody',
        color: '#8b5cf6', // purple
        volume: 0.76,
        isMuted: false,
        isSolo: false,
        baseFreq: 698.46, // F5
        rms: 0.210,
        spectralCentroid: 2150,
        chroma: [0.10, 0.04, 0.06, 0.12, 0.15, 0.98, 0.05, 0.20, 0.92, 0.12, 0.06, 0.82],
        maskingRiskWith: ['trap_hats_snare.wav', 'autotune_vocals.wav'],
        transientPunch: 45,
        harmonicSaturate: 52,
      },
      {
        id: 'vocals',
        name: 'autotune_vocals.wav',
        category: 'vocals',
        color: '#ec4899', // pink
        volume: 0.85,
        isMuted: false,
        isSolo: false,
        baseFreq: 349.23, // F4
        rms: 0.260,
        spectralCentroid: 2850,
        chroma: [0.12, 0.05, 0.08, 0.10, 0.18, 0.94, 0.04, 0.18, 0.88, 0.10, 0.08, 0.78],
        maskingRiskWith: ['dark_bell_melody.wav'],
        transientPunch: 60,
        harmonicSaturate: 75,
      },
    ],
  },
  {
    id: '90s-east-coast-boombap',
    name: "90s East Coast Boom-Bap Classic",
    genre: 'boombap',
    bpm: 90,
    key: 'D Minor (Soul Sample Chop)',
    swingPct: 62, // Authentic SP-1200 / MPC60 swing
    description: '12-bit gritty acoustic vinyl drum break, warm upright jazz double-bass loop, chopped dusty Rhodes/horns, and raw center lyrical vocal.',
    subAnalysis: {
      lowEndBalance: 'Upright Bass Harmonic Warmth (73Hz) + Heavy 200Hz Snare Crack',
      subClashScore: 34,
      rhythmGrid: 'MPC 60 Heavy 16th Swing (62%) + Unquantized Vinyl Push',
      sampleCharacter: 'SP-1200 12-Bit Grime + Vinyl Crackle Floor',
    },
    stems: [
      {
        id: 'vinyl_break',
        name: 'sp1200_vinyl_break.wav',
        category: 'drums',
        color: '#f59e0b', // amber
        volume: 0.90,
        isMuted: false,
        isSolo: false,
        baseFreq: 110.0,
        rms: 0.350,
        spectralCentroid: 3100,
        chroma: [0.18, 0.16, 0.22, 0.15, 0.16, 0.20, 0.14, 0.18, 0.15, 0.21, 0.17, 0.16],
        maskingRiskWith: ['upright_jazz_bass.wav'],
        transientPunch: 88,
        harmonicSaturate: 82,
        swingOffsetMs: 24,
      },
      {
        id: 'upright_bass',
        name: 'upright_jazz_bass.wav',
        category: 'bass',
        color: '#7c3aed', // deep purple
        volume: 0.92,
        isMuted: false,
        isSolo: false,
        baseFreq: 73.42, // D2
        rms: 0.380,
        spectralCentroid: 260,
        chroma: [0.08, 0.03, 0.96, 0.05, 0.12, 0.88, 0.04, 0.18, 0.06, 0.92, 0.05, 0.14],
        maskingRiskWith: ['sp1200_vinyl_break.wav'],
        transientPunch: 70,
        harmonicSaturate: 78,
      },
      {
        id: 'soul_chop',
        name: 'soul_rhodes_horns_chop.wav',
        category: 'melody',
        color: '#0284c7', // blue
        volume: 0.78,
        isMuted: false,
        isSolo: false,
        baseFreq: 293.66, // D4
        rms: 0.240,
        spectralCentroid: 1450,
        chroma: [0.15, 0.06, 0.98, 0.08, 0.20, 0.92, 0.06, 0.22, 0.10, 0.95, 0.08, 0.25],
        maskingRiskWith: ['center_boombap_vocal.wav'],
        transientPunch: 40,
        harmonicSaturate: 85,
      },
      {
        id: 'vocal',
        name: 'center_boombap_vocal.wav',
        category: 'vocals',
        color: '#10b981', // emerald
        volume: 0.88,
        isMuted: false,
        isSolo: false,
        baseFreq: 220.0,
        rms: 0.290,
        spectralCentroid: 3250,
        chroma: [0.14, 0.08, 0.90, 0.06, 0.15, 0.86, 0.05, 0.19, 0.08, 0.91, 0.06, 0.20],
        maskingRiskWith: ['soul_rhodes_horns_chop.wav'],
        transientPunch: 74,
        harmonicSaturate: 65,
      },
    ],
  },
  {
    id: 'modern-drill-trap',
    name: 'UK/NY Drill Trap Experience',
    genre: 'trap',
    bpm: 144,
    key: 'C# Minor (Octave 808 Slides)',
    swingPct: 50,
    description: 'Sliding 808 octave jumps with heavy saturation, syncopated counter-snare patterns, dark orchestral string stabs, and drill ad-lib layers.',
    subAnalysis: {
      lowEndBalance: 'Aggressive Distorted 808 (34Hz to 138Hz Glide) + Punchy 70Hz Kick',
      subClashScore: 84,
      rhythmGrid: 'Offbeat Counter-Snares (3rd & 8th Step) + Pitch Bends',
      sampleCharacter: 'Hard Saturated Clipper + Fast Transients',
    },
    stems: [
      {
        id: 'drill_808',
        name: 'drill_sliding_808.wav',
        category: '808',
        color: '#dc2626',
        volume: 0.98,
        isMuted: false,
        isSolo: false,
        baseFreq: 34.65, // C#1
        rms: 0.460,
        spectralCentroid: 165,
        chroma: [0.04, 0.98, 0.05, 0.12, 0.85, 0.06, 0.04, 0.88, 0.05, 0.10, 0.78, 0.04],
        maskingRiskWith: ['drill_kick.wav'],
        transientPunch: 60,
        harmonicSaturate: 95,
      },
      {
        id: 'drill_kick',
        name: 'drill_kick.wav',
        category: 'kick',
        color: '#ea580c',
        volume: 0.86,
        isMuted: false,
        isSolo: false,
        baseFreq: 68.0,
        rms: 0.350,
        spectralCentroid: 290,
        chroma: [0.05, 0.85, 0.04, 0.08, 0.75, 0.04, 0.03, 0.80, 0.04, 0.08, 0.70, 0.03],
        maskingRiskWith: ['drill_sliding_808.wav'],
        transientPunch: 98,
        harmonicSaturate: 70,
      },
      {
        id: 'drill_percs',
        name: 'counter_snares_hats.wav',
        category: 'hats',
        color: '#eab308',
        volume: 0.80,
        isMuted: false,
        isSolo: false,
        baseFreq: 5200,
        rms: 0.270,
        spectralCentroid: 8400,
        chroma: [0.15, 0.15, 0.15, 0.15, 0.15, 0.15, 0.15, 0.15, 0.15, 0.15, 0.15, 0.15],
        maskingRiskWith: ['dark_strings.wav'],
        transientPunch: 94,
        harmonicSaturate: 45,
      },
      {
        id: 'dark_strings',
        name: 'dark_strings.wav',
        category: 'melody',
        color: '#8b5cf6',
        volume: 0.74,
        isMuted: false,
        isSolo: false,
        baseFreq: 554.37, // C#5
        rms: 0.220,
        spectralCentroid: 1850,
        chroma: [0.06, 0.99, 0.08, 0.15, 0.90, 0.08, 0.05, 0.92, 0.08, 0.12, 0.82, 0.06],
        maskingRiskWith: ['counter_snares_hats.wav', 'drill_vox.wav'],
        transientPunch: 50,
        harmonicSaturate: 60,
      },
      {
        id: 'drill_vox',
        name: 'drill_vox_adlibs.wav',
        category: 'vocals',
        color: '#ec4899',
        volume: 0.82,
        isMuted: false,
        isSolo: false,
        baseFreq: 277.18, // C#4
        rms: 0.250,
        spectralCentroid: 3100,
        chroma: [0.08, 0.94, 0.06, 0.12, 0.86, 0.07, 0.04, 0.88, 0.06, 0.10, 0.79, 0.05],
        maskingRiskWith: ['dark_strings.wav'],
        transientPunch: 65,
        harmonicSaturate: 72,
      },
    ],
  },
  {
    id: 'dilla-lofi-boombap',
    name: 'Dilla-Style Dusty Lo-Fi Boom-Bap',
    genre: 'boombap',
    bpm: 86,
    key: 'G Minor (Cassette Tape Flutter)',
    swingPct: 66, // Heavy unquantized swing
    description: 'MPC 3000 unquantized drunken drum swing, cassette tape flutter Rhodes, sub-sine bass pocket, and turntable scratch cuts.',
    subAnalysis: {
      lowEndBalance: 'Sub-Sine Bass Groove (49Hz) Glued Beneath Acoustic Kick',
      subClashScore: 28,
      rhythmGrid: 'Drunken MPC Swing (66%) + Micro-timing Lateness (-18ms)',
      sampleCharacter: 'Tape Warble + 8kHz High-Cut Filter Warmth',
    },
    stems: [
      {
        id: 'dilla_drums',
        name: 'mpc3000_swing_drums.wav',
        category: 'drums',
        color: '#f59e0b',
        volume: 0.88,
        isMuted: false,
        isSolo: false,
        baseFreq: 95.0,
        rms: 0.340,
        spectralCentroid: 2650,
        chroma: [0.16, 0.15, 0.18, 0.15, 0.17, 0.16, 0.15, 0.20, 0.16, 0.17, 0.19, 0.15],
        maskingRiskWith: ['sub_sine_bass.wav'],
        transientPunch: 82,
        harmonicSaturate: 90,
        swingOffsetMs: 38,
      },
      {
        id: 'sub_sine',
        name: 'sub_sine_bass.wav',
        category: 'bass',
        color: '#7c3aed',
        volume: 0.94,
        isMuted: false,
        isSolo: false,
        baseFreq: 49.0, // G1
        rms: 0.410,
        spectralCentroid: 140,
        chroma: [0.12, 0.05, 0.20, 0.10, 0.15, 0.18, 0.06, 0.98, 0.08, 0.18, 0.92, 0.15],
        maskingRiskWith: ['mpc3000_swing_drums.wav'],
        transientPunch: 55,
        harmonicSaturate: 65,
      },
      {
        id: 'tape_rhodes',
        name: 'tape_flutter_rhodes.wav',
        category: 'melody',
        color: '#0284c7',
        volume: 0.76,
        isMuted: false,
        isSolo: false,
        baseFreq: 392.0, // G4
        rms: 0.220,
        spectralCentroid: 1200,
        chroma: [0.18, 0.08, 0.25, 0.12, 0.22, 0.24, 0.08, 0.96, 0.12, 0.22, 0.94, 0.18],
        maskingRiskWith: ['scratch_sax_chops.wav'],
        transientPunch: 35,
        harmonicSaturate: 88,
      },
      {
        id: 'scratches',
        name: 'scratch_sax_chops.wav',
        category: 'melody',
        color: '#10b981',
        volume: 0.80,
        isMuted: false,
        isSolo: false,
        baseFreq: 587.33, // D5
        rms: 0.260,
        spectralCentroid: 3600,
        chroma: [0.15, 0.06, 0.28, 0.10, 0.18, 0.20, 0.07, 0.94, 0.09, 0.20, 0.90, 0.14],
        maskingRiskWith: ['tape_flutter_rhodes.wav'],
        transientPunch: 78,
        harmonicSaturate: 80,
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
  const [selectedGenreFilter, setSelectedGenreFilter] = useState<'all' | 'trap' | 'boombap'>('all');
  const [selectedPresetIdx, setSelectedPresetIdx] = useState<number>(0);
  const [stems, setStems] = useState<StemData[]>(PRESET_TRACKS[0].stems);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [stemDirectoryPath, setStemDirectoryPath] = useState<string>('/workspace/separated_stems/trap_track_01');
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'matrix' | 'lowend' | 'swing' | 'chroma' | 'midi' | 'json'>('lowend');
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [transcriptionDone, setTranscriptionDone] = useState<boolean>(true);
  const [tempo, setTempo] = useState<number>(PRESET_TRACKS[0].bpm);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Web Audio Context reference
  const audioCtxRef = useRef<AudioContext | null>(null);
  const stemNodesRef = useRef<{ [key: string]: { osc: OscillatorNode; gain: GainNode } }>({});

  const filteredPresets = PRESET_TRACKS.filter((p) => 
    selectedGenreFilter === 'all' ? true : p.genre === selectedGenreFilter
  );

  const currentPreset = PRESET_TRACKS[selectedPresetIdx] || PRESET_TRACKS[0];

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
    setStemDirectoryPath(`/workspace/separated_stems/${preset.id}`);
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

  // Audio Playback Engine using Web Audio API synthesis tailored for Trap / Boom-Bap stems
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

        if (stem.category === '808') {
          // Trap 808 Sub: pure deep sine with slight pitch dive
          osc.type = 'sine';
          osc.frequency.setValueAtTime(stem.baseFreq * 1.5, now);
          osc.frequency.exponentialRampToValueAtTime(stem.baseFreq, now + 0.15);
        } else if (stem.category === 'kick') {
          // Punchy acoustic or clipped kick
          osc.type = 'sine';
          osc.frequency.setValueAtTime(140, now);
          osc.frequency.exponentialRampToValueAtTime(stem.baseFreq, now + 0.08);
        } else if (stem.category === 'bass') {
          // Boom-bap upright or sub-sine bass
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(stem.baseFreq, now);
        } else if (stem.category === 'hats') {
          // High-frequency sizzle
          osc.type = 'square';
          osc.frequency.setValueAtTime(450, now);
        } else if (stem.category === 'melody') {
          // Minor chord or bell
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(stem.baseFreq, now);
        } else {
          // Vocals
          osc.type = 'sine';
          osc.frequency.setValueAtTime(stem.baseFreq, now);
        }

        const effectiveVol = (anySolo ? (stem.isSolo ? stem.volume : 0) : (stem.isMuted ? 0 : stem.volume)) * 0.22;
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

  // Real-time Master Waveform Canvas Rendering with Trap 808 transient pulses & Boom-Bap swing
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
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < width; x += 32) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += 16) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Center baseline
      ctx.strokeStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Draw Individual Stem Waveforms lightly
      stems.forEach((stem) => {
        const isMuted = anySolo ? !stem.isSolo : stem.isMuted;
        if (isMuted) return;

        ctx.strokeStyle = stem.color + '55'; // translucent
        ctx.lineWidth = 1.5;
        ctx.beginPath();

        for (let x = 0; x < width; x++) {
          const freqMult = stem.category === '808' || stem.category === 'bass' ? 0.3 : stem.category === 'kick' ? 0.8 : 2.5;
          const t = (x / width) * 6 * Math.PI * freqMult + phase * (stem.baseFreq / 80);
          const amp = stem.volume * (height * 0.22) * stem.rms;
          const y = height / 2 + Math.sin(t) * amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      // Draw Summed Master Waveform (Holistic In-Memory Reconstruction)
      ctx.strokeStyle = currentPreset.genre === 'trap' ? '#f59e0b' : '#38bdf8'; // amber for trap, sky for boombap
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      for (let x = 0; x < width; x++) {
        let masterY = height / 2;
        stems.forEach((stem) => {
          const isMuted = anySolo ? !stem.isSolo : stem.isMuted;
          if (!isMuted) {
            const freqMult = stem.category === '808' || stem.category === 'bass' ? 0.3 : stem.category === 'kick' ? 0.8 : 2.5;
            const t = (x / width) * 6 * Math.PI * freqMult + phase * (stem.baseFreq / 80);
            const amp = stem.volume * (height * 0.28) * stem.rms;
            masterY += Math.sin(t) * amp;
          }
        });

        if (x === 0) ctx.moveTo(x, masterY);
        else ctx.lineTo(x, masterY);
      }
      ctx.stroke();

      phase += isPlaying ? (currentPreset.genre === 'trap' ? 0.12 : 0.08) : 0.01;
      animationFrameRef.current = requestAnimationFrame(renderWaveform);
    };

    renderWaveform();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [stems, isPlaying, anySolo, currentPreset]);

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
    hip_hop_genre: currentPreset.genre.toUpperCase(),
    track_preset: currentPreset.name,
    global_metrics: {
      estimated_tempo: tempo,
      swing_factor_percent: currentPreset.swingPct,
      rhythm_subdivision: currentPreset.genre === 'trap' ? '1/32 Triplet & 16th Rolls' : 'MPC 60 Unquantized 16th Swing',
      master_rms_energy: Number(masterRms.toFixed(4)),
      active_channels_count: activeStems.length,
      headroom_db: Number((20 * Math.log10(1 / (masterRms + 1e-4))).toFixed(2)),
      low_end_clash_risk_score: currentPreset.subAnalysis.subClashScore,
    },
    genre_diagnostic: {
      low_end_architecture: currentPreset.subAnalysis.lowEndBalance,
      rhythm_grid_character: currentPreset.subAnalysis.rhythmGrid,
      analog_digital_fingerprint: currentPreset.subAnalysis.sampleCharacter,
    },
    stem_interactions: stems.reduce((acc: any, s) => {
      const effectiveRms = s.isMuted ? 0 : s.rms * s.volume;
      const energyRatio = Number((effectiveRms / (masterRms + 1e-6)).toFixed(4));
      acc[s.name] = {
        stem_category: s.category,
        energy_share_ratio: energyRatio,
        mean_spectral_centroid_hz: s.spectralCentroid,
        transient_punch_index: s.transientPunch,
        harmonic_saturation_pct: s.harmonicSaturate,
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
    downloadAnchor.setAttribute('download', `${currentPreset.id}_intelligence.json`);
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
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold border flex items-center gap-1 ${
                currentPreset.genre === 'trap'
                  ? 'bg-red-50 text-red-800 border-red-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {currentPreset.genre === 'trap' ? <Flame className="w-3 h-3 text-red-600" /> : <Disc className="w-3 h-3 text-amber-600" />}
                <span>{currentPreset.genre === 'trap' ? 'TRAP PRODUCTION PIPELINE' : 'BOOM-BAP MPC PIPELINE'}</span>
              </span>

              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-mono font-semibold border border-emerald-200">
                Gradio 4.44 + Librosa 0.10 + Basic Pitch
              </span>
              <span className="text-xs text-neutral-500 font-mono">
                Zero-Cost In-Memory Reconstruct ($0 Budget)
              </span>
            </div>

            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              <span>Trap & Boom-Bap Cross-Stem Contextual AI Engine</span>
            </h1>

            <p className="text-xs text-neutral-600 max-w-3xl leading-relaxed">
              Specialized multi-track intelligence for modern 808 Trap and golden-age 90s Boom-Bap. 
              In-memory master waveform reconstruction, 808 sub vs kick sidechain clash diagnosis, 
              SP-1200 / MPC60 swing timing extraction, CQT chroma key-center tracking, and Spotify Basic Pitch polyphonic MIDI export.
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
                  <span>Pause Mix Reconstruct</span>
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

        {/* Genre Selector and Preset Switcher */}
        <div className="mt-5 pt-4 border-t border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Genre Filter Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Genre Focus:</span>
            <div className="inline-flex rounded-lg border border-neutral-200 bg-neutral-50 p-0.5 text-xs font-semibold">
              <button
                onClick={() => setSelectedGenreFilter('all')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  selectedGenreFilter === 'all' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                All Beats ({PRESET_TRACKS.length})
              </button>
              <button
                onClick={() => {
                  setSelectedGenreFilter('trap');
                  handleSelectPreset(0); // select first trap preset
                }}
                className={`px-2.5 py-1 rounded flex items-center gap-1 transition-colors ${
                  selectedGenreFilter === 'trap' ? 'bg-red-600 text-white shadow-2xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Flame className="w-3 h-3" />
                <span>Trap (808s / Drill)</span>
              </button>
              <button
                onClick={() => {
                  setSelectedGenreFilter('boombap');
                  handleSelectPreset(1); // select first boom-bap preset
                }}
                className={`px-2.5 py-1 rounded flex items-center gap-1 transition-colors ${
                  selectedGenreFilter === 'boombap' ? 'bg-amber-600 text-white shadow-2xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Disc className="w-3 h-3" />
                <span>Boom-Bap (SP-1200 / MPC)</span>
              </button>
            </div>
          </div>

          {/* Preset Selector Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500 font-medium">Active Track:</span>
            <select
              value={selectedPresetIdx}
              onChange={(e) => handleSelectPreset(Number(e.target.value))}
              className="bg-white border border-neutral-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {PRESET_TRACKS.map((p, idx) => (
                <option key={p.id} value={idx}>
                  {p.genre === 'trap' ? '🔥 [TRAP] ' : '📼 [BOOM-BAP] '}
                  {p.name} ({p.bpm} BPM)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Preset Details Bar */}
        <div className="mt-3 p-3 rounded-lg bg-neutral-50 border border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="text-neutral-700 leading-normal">
            <span className="font-bold text-neutral-900">{currentPreset.name}: </span>
            <span>{currentPreset.description}</span>
          </div>
          <div className="flex items-center gap-3 shrink-0 font-mono text-[11px]">
            <span className="px-2 py-0.5 rounded bg-white border border-neutral-200 text-neutral-800 font-semibold">
              {currentPreset.key}
            </span>
            <span className="px-2 py-0.5 rounded bg-white border border-neutral-200 text-neutral-800 font-semibold">
              Swing: {currentPreset.swingPct}%
            </span>
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
            <div className="relative rounded-lg overflow-hidden border border-neutral-900 bg-neutral-950 h-32 flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={480}
                height={128}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[10px] text-white font-mono">
                <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-neutral-500'}`} />
                <span>{isPlaying ? 'REAL-TIME TRAP/BOOM-BAP DSP' : 'HOLDING MIX STATE'}</span>
              </div>
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-amber-300 font-mono">
                RMS: {masterRms.toFixed(3)} | {tempo} BPM | Swing {currentPreset.swingPct}%
              </div>
            </div>

            <p className="text-[11px] text-neutral-500 leading-normal">
              Dynamically accumulated in RAM via NumPy vectorization. Zero disk write bottlenecks.
            </p>
          </div>

          {/* 4-5 Channel Stem Fader Strip */}
          <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-neutral-700" />
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Stem Channels ({stems.length})
                </h3>
              </div>
              <button
                onClick={() => setStems(currentPreset.stems.map((s) => ({ ...s, volume: 0.85, isMuted: false, isSolo: false })))}
                className="text-[11px] text-neutral-500 hover:text-neutral-900 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Reset Faders
              </button>
            </div>

            <div className="space-y-3">
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
                        <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-700 font-mono">
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

                      {/* Micro Energy Bar with Transient & Saturated Tags */}
                      <div className="flex items-center justify-between text-[9px] text-neutral-400 font-mono pt-0.5">
                        <span>Punch: {stem.transientPunch}%</span>
                        <span>Sat: {stem.harmonicSaturate}%</span>
                        <span>fc: {stem.spectralCentroid}Hz</span>
                      </div>
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
                  {currentPreset.genre === 'trap' ? 'Trap Sub & Rhythm Matrix' : 'Boom-Bap MPC & Vinyl Matrix'}
                </h3>
              </div>

              {/* Navigation Pills */}
              <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg text-xs font-semibold overflow-x-auto">
                <button
                  onClick={() => setActiveAnalysisTab('lowend')}
                  className={`px-2.5 py-1 rounded transition-all flex items-center gap-1 ${
                    activeAnalysisTab === 'lowend' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  <Flame className="w-3 h-3 text-red-500" />
                  <span>808 / Low-End</span>
                </button>
                <button
                  onClick={() => setActiveAnalysisTab('swing')}
                  className={`px-2.5 py-1 rounded transition-all flex items-center gap-1 ${
                    activeAnalysisTab === 'swing' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  <Clock className="w-3 h-3 text-amber-500" />
                  <span>Swing & Grid</span>
                </button>
                <button
                  onClick={() => setActiveAnalysisTab('matrix')}
                  className={`px-2.5 py-1 rounded transition-all ${
                    activeAnalysisTab === 'matrix' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  Energy & Centroid
                </button>
                <button
                  onClick={() => setActiveAnalysisTab('chroma')}
                  className={`px-2.5 py-1 rounded transition-all ${
                    activeAnalysisTab === 'chroma' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  CQT Keys
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
                  JSON
                </button>
              </div>
            </div>

            {/* TAB 1: 808 & LOW-END SUB CLASH MATRIX */}
            {activeAnalysisTab === 'lowend' && (
              <div className="space-y-4">
                {/* Low-End Diagnostic Box */}
                <div className={`p-4 rounded-xl border space-y-2 ${
                  currentPreset.genre === 'trap'
                    ? 'bg-red-50/70 border-red-200 text-red-950'
                    : 'bg-amber-50/70 border-amber-200 text-amber-950'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xs">
                      {currentPreset.genre === 'trap' ? <Flame className="w-4 h-4 text-red-600" /> : <Disc className="w-4 h-4 text-amber-600" />}
                      <span>{currentPreset.genre === 'trap' ? '808 Sub-Bass vs Kick Frequency Allocation' : 'Sampled Upright Bass & Acoustic Kick Balance'}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white font-bold border border-neutral-200">
                      Clash Index: {currentPreset.subAnalysis.subClashScore}/100
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-neutral-700">
                    <strong className="text-neutral-900">Architecture: </strong>
                    {currentPreset.subAnalysis.lowEndBalance}
                  </p>
                </div>

                {/* Sub vs Kick Frequency Range Visualizer */}
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 border-b border-neutral-800 pb-2">
                    <span>Sub-Frequency Spectrum (20 Hz - 300 Hz)</span>
                    <span className="text-amber-400 font-bold">Cross-Stem Overlap Analysis</span>
                  </div>

                  <div className="space-y-3 pt-1">
                    {/* 808 / Sub-Bass Band */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-red-400 font-bold">
                          {currentPreset.genre === 'trap' ? '808 Sub Fundamental: 35-50 Hz (Deep Saturation)' : 'Upright Jazz Bass: 60-120 Hz (Wooden Body)'}
                        </span>
                        <span className="text-neutral-400">{currentPreset.genre === 'trap' ? 'fc: 115 Hz' : 'fc: 260 Hz'}</span>
                      </div>
                      <div className="h-4 bg-neutral-900 rounded flex items-center px-1 overflow-hidden relative">
                        <div 
                          className="h-2.5 rounded bg-red-500 transition-all duration-300"
                          style={{
                            width: currentPreset.genre === 'trap' ? '55%' : '40%',
                            marginLeft: currentPreset.genre === 'trap' ? '5%' : '15%',
                          }}
                        />
                      </div>
                    </div>

                    {/* Kick Drum Band */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-amber-400 font-bold">
                          {currentPreset.genre === 'trap' ? 'Clipped Kick Transient: 55-80 Hz + 2.5kHz Click' : 'SP-1200 Vinyl Kick: 80-140 Hz (Heavy Body)'}
                        </span>
                        <span className="text-neutral-400">{currentPreset.genre === 'trap' ? 'fc: 240 Hz' : 'fc: 310 Hz'}</span>
                      </div>
                      <div className="h-4 bg-neutral-900 rounded flex items-center px-1 overflow-hidden relative">
                        <div 
                          className="h-2.5 rounded bg-amber-500 transition-all duration-300"
                          style={{
                            width: currentPreset.genre === 'trap' ? '45%' : '50%',
                            marginLeft: currentPreset.genre === 'trap' ? '18%' : '25%',
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-800 text-[10px] text-neutral-400 flex items-center justify-between">
                    <span>Recommended Action: {currentPreset.genre === 'trap' ? 'Sidechain duck 808 attack by 25ms or notch 60Hz' : 'High-pass vinyl break at 45Hz to seat bass'}</span>
                    <span className="text-emerald-400 font-semibold">Phase Aligned</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SWING & RHYTHM QUANTIZATION */}
            {activeAnalysisTab === 'swing' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-bold flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-700" />
                      <span>Rhythm Subdivision & Micro-Timing Extraction</span>
                    </div>
                    <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-amber-300">
                      Swing: {currentPreset.swingPct}%
                    </span>
                  </div>
                  <p className="text-neutral-700 leading-relaxed">
                    {currentPreset.subAnalysis.rhythmGrid}
                  </p>
                </div>

                {/* 16-Step Pattern Grid Visualizer */}
                <div className="bg-neutral-950 rounded-xl p-4 border border-neutral-800 text-neutral-200 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 border-b border-neutral-800 pb-2">
                    <span>16-Step Quantization & Velocity Pattern</span>
                    <span className="text-amber-400">{currentPreset.bpm} BPM ({currentPreset.genre.toUpperCase()})</span>
                  </div>

                  <div className="space-y-2 py-1">
                    {/* Hi-Hats / Cymbals Row */}
                    <div className="flex items-center gap-2">
                      <span className="w-16 text-[10px] text-amber-400 font-bold">Hats/Perc:</span>
                      <div className="flex-1 grid grid-cols-16 gap-1">
                        {Array.from({ length: 16 }).map((_, i) => {
                          const isTrapRoll = currentPreset.genre === 'trap' && (i === 6 || i === 7 || i === 14 || i === 15);
                          const isBoomBapOffbeat = currentPreset.genre === 'boombap' && (i % 2 === 1);
                          return (
                            <div
                              key={i}
                              className={`h-6 rounded text-[8px] flex items-center justify-center font-bold transition-all ${
                                isTrapRoll
                                  ? 'bg-amber-400 text-neutral-950 ring-1 ring-amber-300'
                                  : isBoomBapOffbeat
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-neutral-800 text-neutral-400'
                              }`}
                            >
                              {isTrapRoll ? '1/32' : i + 1}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Snare / Clap Row */}
                    <div className="flex items-center gap-2">
                      <span className="w-16 text-[10px] text-pink-400 font-bold">Snare/Clap:</span>
                      <div className="flex-1 grid grid-cols-16 gap-1">
                        {Array.from({ length: 16 }).map((_, i) => {
                          const isSnareHit = currentPreset.genre === 'trap' 
                            ? (i === 4 || i === 12) // Half-time 3rd beat
                            : (i === 4 || i === 12);
                          return (
                            <div
                              key={i}
                              className={`h-6 rounded text-[8px] flex items-center justify-center font-bold ${
                                isSnareHit
                                  ? 'bg-pink-500 text-white shadow-xs'
                                  : 'bg-neutral-800/60 text-neutral-500'
                              }`}
                            >
                              {isSnareHit ? 'HIT' : ''}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Kick / 808 Row */}
                    <div className="flex items-center gap-2">
                      <span className="w-16 text-[10px] text-red-400 font-bold">Kick / 808:</span>
                      <div className="flex-1 grid grid-cols-16 gap-1">
                        {Array.from({ length: 16 }).map((_, i) => {
                          const isKick = i === 0 || i === 3 || i === 8 || i === 10;
                          return (
                            <div
                              key={i}
                              className={`h-6 rounded text-[8px] flex items-center justify-center font-bold ${
                                isKick
                                  ? 'bg-red-500 text-white'
                                  : 'bg-neutral-800/60 text-neutral-500'
                              }`}
                            >
                              {isKick ? 'BASS' : ''}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: ENERGY SHARE & SPECTRAL CENTROID */}
            {activeAnalysisTab === 'matrix' && (
              <div className="space-y-5">
                {/* Global Metrics Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
                    <span className="text-[10px] text-neutral-400 font-semibold uppercase">Tempo & Swing</span>
                    <div className="text-base font-bold text-neutral-900 font-mono mt-0.5">{tempo} BPM ({currentPreset.swingPct}%)</div>
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
                    <span className="text-[10px] text-neutral-400 font-semibold uppercase">Master Mix RMS</span>
                    <div className="text-base font-bold text-neutral-900 font-mono mt-0.5">{masterRms.toFixed(4)}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
                    <span className="text-[10px] text-neutral-400 font-semibold uppercase">Headroom / Ceiling</span>
                    <div className="text-base font-bold text-emerald-700 font-mono mt-0.5">
                      {(20 * Math.log10(1 / (masterRms + 1e-4))).toFixed(1)} dB
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
                    <span className="text-[10px] text-neutral-400 font-semibold uppercase">Harmonic Key Alignment</span>
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
                        <th className="pb-2">Transient Punch</th>
                        <th className="pb-2">Spectral Centroid</th>
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
                                <span className="w-10">{Math.round(ratio * 100)}%</span>
                                <div className="w-20 bg-neutral-100 h-2 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full rounded-full" 
                                    style={{ width: `${Math.min(100, ratio * 100)}%`, backgroundColor: stem.color }} 
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5">
                              <span className="px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700 font-semibold">
                                {stem.transientPunch}%
                              </span>
                            </td>
                            <td className="py-2.5 text-neutral-700">
                              <span className="font-bold">{stem.spectralCentroid} Hz</span>
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

            {/* TAB 4: CONSTANT-Q TRANSFORM (CQT) CHROMA VECTORS */}
            {activeAnalysisTab === 'chroma' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-600">
                    12-semitone pitch class energy profile derived via <code className="font-mono bg-neutral-100 px-1 py-0.5 rounded">librosa.feature.chroma_cqt</code>
                  </span>
                  <span className="text-xs font-bold text-neutral-800">Target Key: {currentPreset.key}</span>
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

            {/* TAB 5: SPOTIFY BASIC PITCH MIDI TRANSCRIPTION */}
            {activeAnalysisTab === 'midi' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                      <Music className="w-4 h-4 text-emerald-700" />
                      <span>Spotify Basic Pitch Neural Polyphonic MIDI Conversion</span>
                    </div>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      Extracts quantized note events and pitch glide curves directly from isolated Trap 808s, Boom-Bap chord chops, and vocal layers.
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
                        <span>Extracting MIDI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Transcribe All {stems.length} Stems</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Piano Roll Note Stream */}
                <div className="bg-neutral-950 rounded-xl p-4 border border-neutral-800 text-neutral-200 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                    <span className="text-amber-400 font-bold">Multi-Track MIDI Note Stream</span>
                    <span className="text-neutral-400 text-[10px]">Grid: 16th Notes | 120 Ticks/Beat</span>
                  </div>

                  <div className="space-y-2 py-2">
                    {currentPreset.genre === 'trap' ? (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="w-20 text-[10px] text-red-400 truncate">808 Glide:</span>
                          <div className="flex-1 bg-neutral-900 h-4 rounded flex items-center px-1 gap-2 overflow-hidden">
                            <span className="h-2 w-28 bg-red-500 rounded text-[8px] text-white font-bold px-1">F1 (43Hz)</span>
                            <span className="h-2 w-16 bg-red-500 rounded text-[8px] text-white font-bold px-1">G#1</span>
                            <span className="h-2 w-20 bg-red-500 rounded text-[8px] text-white font-bold px-1">C#2 (Glide)</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="w-20 text-[10px] text-purple-400 truncate">Dark Bell:</span>
                          <div className="flex-1 bg-neutral-900 h-4 rounded flex items-center px-1 gap-1 overflow-hidden">
                            <span className="h-2 w-12 bg-purple-400 rounded text-[8px] text-black font-bold px-1">F5</span>
                            <span className="h-2 w-16 bg-purple-400 rounded text-[8px] text-black font-bold px-1">Ab5</span>
                            <span className="h-2 w-10 bg-purple-400 rounded text-[8px] text-black font-bold px-1">C6</span>
                            <span className="h-2 w-14 bg-purple-400 rounded text-[8px] text-black font-bold px-1">Db6</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="w-20 text-[10px] text-purple-400 truncate">Jazz Bass:</span>
                          <div className="flex-1 bg-neutral-900 h-4 rounded flex items-center px-1 gap-2 overflow-hidden">
                            <span className="h-2 w-24 bg-purple-500 rounded text-[8px] text-white font-bold px-1">D2 (73Hz)</span>
                            <span className="h-2 w-16 bg-purple-500 rounded text-[8px] text-white font-bold px-1">F2</span>
                            <span className="h-2 w-28 bg-purple-500 rounded text-[8px] text-white font-bold px-1">A2</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="w-20 text-[10px] text-cyan-400 truncate">Rhodes Chop:</span>
                          <div className="flex-1 bg-neutral-900 h-4 rounded flex items-center px-1 gap-1 overflow-hidden">
                            <span className="h-2 w-16 bg-cyan-400 rounded text-[8px] text-black font-bold px-1">Dm7</span>
                            <span className="h-2 w-18 bg-cyan-400 rounded text-[8px] text-black font-bold px-1">Gm9</span>
                            <span className="h-2 w-20 bg-cyan-400 rounded text-[8px] text-black font-bold px-1">A7(b9)</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Generated MIDI Files Download Table */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-neutral-800">Generated Multi-Track MIDI Files:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {stems.map((s) => (
                      <div key={s.id} className="p-2.5 rounded-lg border border-neutral-200 bg-neutral-50 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 truncate mr-2">
                          <Music className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                          <span className="font-mono text-neutral-800 truncate">{s.name.replace('.wav', '')}_basic_pitch.mid</span>
                        </div>
                        <button
                          onClick={() => {
                            alert(`Downloading MIDI transcription: ${s.name.replace('.wav', '')}_basic_pitch.mid`);
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

            {/* TAB 6: JSON INTELLIGENCE REPORT */}
            {activeAnalysisTab === 'json' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-neutral-500">{currentPreset.id}_intelligence.json</span>
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
