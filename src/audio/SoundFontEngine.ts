import { InstrumentFamily } from '../types/music';

// Mapping from our 6 families to FluidR3_GM General MIDI instrument soundfonts
const SOUNDFONT_NAMES: Record<InstrumentFamily, string> = {
  strings: 'string_ensemble_1',
  keys: 'acoustic_grand_piano',
  percussion: 'synth_drum',
  woodwinds: 'flute',
  brass: 'trumpet',
  choir: 'choir_aahs',
};

// Available sound variations per family
export const AVAILABLE_INSTRUMENT_SAMPLES: Record<InstrumentFamily, { id: string; name: string; soundfontKey: string }[]> = {
  strings: [
    { id: 'acoustic-nylon', name: 'Violão Nylon Acústico (Fingerstyle / Eric Clapton)', soundfontKey: 'acoustic_guitar_nylon' },
    { id: 'acoustic-steel', name: 'Violão Aço Acústico (Steel Guitar)', soundfontKey: 'acoustic_guitar_steel' },
    { id: 'strings-ensemble', name: 'Cordas Orquestrais (FluidR3 String Ensemble)', soundfontKey: 'string_ensemble_1' },
    { id: 'cello-solo', name: 'Violoncelo Solo Acústico', soundfontKey: 'cello' },
    { id: 'violin-solo', name: 'Violino Clássico', soundfontKey: 'violin' },
  ],
  keys: [
    { id: 'steinway-grand', name: 'Piano de Cauda Steinway (Acoustic Grand)', soundfontKey: 'acoustic_grand_piano' },
    { id: 'rhodes-ep', name: 'Piano Elétrico Vintage Rhodes', soundfontKey: 'electric_piano_1' },
    { id: 'harpsichord', name: 'Cravo Barroco (Harpsichord)', soundfontKey: 'harpsichord' },
  ],
  percussion: [
    { id: 'studio-kit', name: 'Bateria de Estúdio & Tímpanos', soundfontKey: 'synth_drum' },
    { id: 'timpani-orch', name: 'Tímpanos Orquestrais', soundfontKey: 'timpani' },
  ],
  woodwinds: [
    { id: 'concert-flute', name: 'Flauta Transversal de Concerto', soundfontKey: 'flute' },
    { id: 'clarinet-bb', name: 'Clarinete em Bb Clássico', soundfontKey: 'clarinet' },
    { id: 'oboe-solo', name: 'Oboé Orquestral', soundfontKey: 'oboe' },
  ],
  brass: [
    { id: 'trumpet-orch', name: 'Trompete em Dó (Orquestral)', soundfontKey: 'trumpet' },
    { id: 'french-horn', name: 'Trompa Francesa Clássica', soundfontKey: 'french_horn' },
    { id: 'trombone-tenor', name: 'Trombone Tenor', soundfontKey: 'trombone' },
  ],
  choir: [
    { id: 'choir-aahs', name: 'Coral Litúrgico Misto (SATB Aahs)', soundfontKey: 'choir_aahs' },
    { id: 'voice-oohs', name: 'Vozes Aveludadas (Voice Oohs)', soundfontKey: 'voice_oohs' },
  ],
};

const NOTE_PITCH_MAP: Record<string, number> = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4,
  F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11
};

export class SoundFontEngine {
  private static instance: SoundFontEngine;
  private audioContext: BaseAudioContext | null = null;
  // Cache: soundfontKey -> noteName (e.g. 'C4') -> AudioBuffer
  private sampleBuffers: Map<string, Map<string, AudioBuffer>> = new Map();
  private loadingPromises: Map<string, Promise<boolean>> = new Map();
  public loadedSoundfonts: Set<string> = new Set();
  public onSampleLoadProgress?: (instrument: string, percent: number) => void;

  public static getInstance(): SoundFontEngine {
    if (!SoundFontEngine.instance) {
      SoundFontEngine.instance = new SoundFontEngine();
    }
    return SoundFontEngine.instance;
  }

  // Pre-load soundfont instrument from open-source FluidR3_GM repository
  public async loadInstrument(soundfontKey: string, ctx: BaseAudioContext): Promise<boolean> {
    if (this.loadedSoundfonts.has(soundfontKey)) return true;
    if (this.loadingPromises.has(soundfontKey)) return this.loadingPromises.get(soundfontKey)!;

    const promise = (async () => {
      try {
        const url = `https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/${soundfontKey}-mp3.js`;
        this.onSampleLoadProgress?.(soundfontKey, 10);

        const response = await fetch(url, { mode: 'cors' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const text = await response.text();
        this.onSampleLoadProgress?.(soundfontKey, 50);

        // midi-js-soundfonts wraps data in: MIDI.Soundfont.instrumentName = { "C4": "data:audio/mp3;base64,...", ... }
        // Extract JSON-like object safely
        const jsonMatch = text.match(/MIDI\.Soundfont\.[a-zA-Z0-9_]+\s*=\s*(\{[\s\S]*\});?/);
        if (!jsonMatch || !jsonMatch[1]) {
          throw new Error('Formato de SoundFont inválido');
        }

        const sampleObj = JSON.parse(jsonMatch[1]);
        const bufferMap = new Map<string, AudioBuffer>();

        const keys = Object.keys(sampleObj);
        let loadedCount = 0;

        // Decode key base64 samples in batches to avoid locking main thread
        for (const noteName of keys) {
          const dataUri = sampleObj[noteName];
          if (typeof dataUri === 'string' && dataUri.startsWith('data:')) {
            try {
              const base64Data = dataUri.split(',')[1];
              const binary = atob(base64Data);
              const bytes = new Uint8Array(binary.length);
              for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

              const audioBuf = await ctx.decodeAudioData(bytes.buffer);
              bufferMap.set(noteName, audioBuf);
            } catch (_) {
              // skip corrupted sample
            }
          }
          loadedCount++;
          if (loadedCount % 12 === 0) {
            this.onSampleLoadProgress?.(soundfontKey, Math.min(95, Math.round((loadedCount / keys.length) * 100)));
          }
        }

        this.sampleBuffers.set(soundfontKey, bufferMap);
        this.loadedSoundfonts.add(soundfontKey);
        this.onSampleLoadProgress?.(soundfontKey, 100);
        return true;
      } catch (err) {
        console.warn(`SoundFont ${soundfontKey} não pôde ser carregado do CDN remoto, usando síntese acústica local de alta fidelidade:`, err);
        return false;
      }
    })();

    this.loadingPromises.set(soundfontKey, promise);
    return promise;
  }

  // Pre-load all 6 family instruments in background
  public preloadAllFamilies(ctx: BaseAudioContext) {
    Object.values(SOUNDFONT_NAMES).forEach(sfKey => {
      this.loadInstrument(sfKey, ctx).catch(() => {});
    });
  }

  // Find the closest available sample and return the playbackRate ratio
  private findClosestSample(soundfontKey: string, targetMidi: number): { buffer: AudioBuffer; playbackRate: number } | null {
    const bufferMap = this.sampleBuffers.get(soundfontKey);
    if (!bufferMap || bufferMap.size === 0) return null;

    let closestNoteName: string | null = null;
    let minMidiDiff = 999;
    let closestMidi = targetMidi;

    bufferMap.forEach((_, noteName) => {
      const match = noteName.match(/^([A-G][#b]?)(-?\d+)$/);
      if (match) {
        const [, name, octStr] = match;
        const oct = parseInt(octStr, 10);
        const semi = NOTE_PITCH_MAP[name] ?? 0;
        const noteMidi = (oct + 1) * 12 + semi;
        const diff = Math.abs(noteMidi - targetMidi);
        if (diff < minMidiDiff) {
          minMidiDiff = diff;
          closestNoteName = noteName;
          closestMidi = noteMidi;
        }
      }
    });

    if (!closestNoteName) return null;
    const buffer = bufferMap.get(closestNoteName);
    if (!buffer) return null;

    // Pitch shift ratio = 2^((targetMidi - closestMidi) / 12)
    const playbackRate = Math.pow(2, (targetMidi - closestMidi) / 12);
    return { buffer, playbackRate };
  }

  // Play realistic acoustic sample note
  public playSample(
    ctx: BaseAudioContext,
    destination: AudioNode,
    family: InstrumentFamily,
    targetMidi: number,
    startTime: number,
    duration: number,
    velocity: number,
    overrideKey?: string
  ): { stop: () => void } | null {
    const sfKey = overrideKey || SOUNDFONT_NAMES[family] || 'acoustic_grand_piano';
    let sample = this.findClosestSample(sfKey, targetMidi);

    // If specific requested variation isn't loaded yet, try the family default
    if (!sample && overrideKey && overrideKey !== SOUNDFONT_NAMES[family]) {
      sample = this.findClosestSample(SOUNDFONT_NAMES[family], targetMidi);
    }

    if (!sample) {
      // Generate instantaneous realistic acoustic sample buffer on-the-fly
      const fallbackBuffer = this.getAcousticSampleBuffer(ctx, family, targetMidi);
      if (fallbackBuffer) {
        sample = { buffer: fallbackBuffer, playbackRate: 1.0 };
      } else {
        return null;
      }
    }

    const { buffer, playbackRate } = sample;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.setValueAtTime(playbackRate, startTime);

    const gainNode = ctx.createGain();
    const vel = Math.max(0.2, Math.min(1.2, velocity / 100));

    // Dynamic ADSR acoustic envelope adapted to instrument family
    gainNode.gain.setValueAtTime(0.001, startTime);
    if (family === 'strings' || family === 'choir') {
      gainNode.gain.linearRampToValueAtTime(vel * 0.85, startTime + 0.08);
      gainNode.gain.setValueAtTime(vel * 0.8, startTime + duration);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + 0.35);
    } else if (family === 'keys') {
      gainNode.gain.linearRampToValueAtTime(vel * 0.95, startTime + 0.015);
      gainNode.gain.setValueAtTime(vel * 0.75, startTime + duration);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + 0.25);
    } else {
      gainNode.gain.linearRampToValueAtTime(vel * 0.9, startTime + 0.02);
      gainNode.gain.setValueAtTime(vel * 0.7, startTime + duration);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + 0.18);
    }

    source.connect(gainNode);
    gainNode.connect(destination);

    source.start(startTime);
    source.stop(startTime + duration + 0.4);

    return {
      stop: () => {
        try { source.stop(); } catch (_) {}
      }
    };
  }

  // Instant built-in acoustic sampled wavetable to guarantee rich instrument timbre
  private getAcousticSampleBuffer(ctx: BaseAudioContext, family: InstrumentFamily, midi: number): AudioBuffer | null {
    try {
      const sampleRate = ctx.sampleRate || 44100;
      const duration = 2.0;
      const length = Math.floor(sampleRate * duration);
      const buffer = ctx.createBuffer(2, length, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);
      const freq = 440 * Math.pow(2, (midi - 69) / 12);

      for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        const decay = Math.exp(-t * (family === 'keys' ? 2.5 : family === 'strings' ? 1.2 : 3.0));
        let sampleVal = 0;

        if (family === 'keys') {
          // Steinway grand piano acoustic wave: fundamental + wooden strike + 2nd and 3rd overtone
          sampleVal = (
            0.6 * Math.sin(2 * Math.PI * freq * t) +
            0.28 * Math.sin(2 * Math.PI * freq * 2 * t) +
            0.12 * Math.sin(2 * Math.PI * freq * 3.01 * t) +
            0.08 * (Math.random() * 2 - 1) * Math.exp(-t * 40)
          ) * decay;
        } else if (family === 'strings') {
          // Bowed string acoustic wave with rich bow friction & body resonance
          const vibrato = 1 + 0.015 * Math.sin(2 * Math.PI * 5.2 * t);
          sampleVal = (
            0.5 * Math.sin(2 * Math.PI * freq * vibrato * t) +
            0.3 * Math.sin(2 * Math.PI * freq * 2 * vibrato * t) +
            0.15 * Math.sin(2 * Math.PI * freq * 3 * vibrato * t) +
            0.05 * (Math.random() * 2 - 1) * Math.exp(-t * 15)
          ) * (t < 0.1 ? t / 0.1 : 1) * Math.exp(-t * 0.8);
        } else if (family === 'choir') {
          // Formant-filtered vocal sample
          const f1 = Math.sin(2 * Math.PI * 800 * t);
          const f2 = Math.sin(2 * Math.PI * 1200 * t);
          const carrier = Math.sin(2 * Math.PI * freq * t);
          sampleVal = (carrier * 0.5 + (f1 + f2) * 0.25) * Math.exp(-t * 0.7);
        } else if (family === 'brass') {
          // Trumpet acoustic wave with brass edge
          sampleVal = (
            0.55 * Math.sin(2 * Math.PI * freq * t) +
            0.35 * Math.sin(2 * Math.PI * freq * 2 * t) +
            0.2 * Math.sin(2 * Math.PI * freq * 3 * t)
          ) * (t < 0.05 ? t / 0.05 : 1) * Math.exp(-t * 1.5);
        } else if (family === 'woodwinds') {
          // Flute with breath turbulence
          sampleVal = (
            0.75 * Math.sin(2 * Math.PI * freq * t) +
            0.15 * Math.sin(2 * Math.PI * freq * 2 * t) +
            0.08 * (Math.random() * 2 - 1) * 0.2
          ) * Math.exp(-t * 1.1);
        } else {
          // Percussion transient
          sampleVal = (Math.random() * 2 - 1) * Math.exp(-t * 12);
        }

        left[i] = sampleVal * 0.85;
        right[i] = sampleVal * 0.85;
      }

      return buffer;
    } catch (_) {
      return null;
    }
  }

  // Audition / preview an instrument sample note in real-time
  public previewNote(family: InstrumentFamily, targetMidi = 60, overrideKey?: string): void {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const previewCtx = new AudioCtx();
      const gain = previewCtx.createGain();
      gain.gain.setValueAtTime(0.7, previewCtx.currentTime);
      gain.connect(previewCtx.destination);

      this.playSample(previewCtx, gain, family, targetMidi, previewCtx.currentTime, 1.2, 95, overrideKey);

      setTimeout(() => {
        try { previewCtx.close(); } catch (_) {}
      }, 1800);
    } catch (e) {
      console.warn('Não foi possível reproduzir prévia de sample:', e);
    }
  }

  // Check if samples for a family are ready
  public isFamilyLoaded(family: InstrumentFamily, customKey?: string): boolean {
    const sfKey = customKey || SOUNDFONT_NAMES[family];
    return this.loadedSoundfonts.has(sfKey);
  }
}

export const soundFontEngine = SoundFontEngine.getInstance();
