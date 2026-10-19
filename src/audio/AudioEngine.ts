import { Score, Track, Note, InstrumentFamily } from '../types/music';
import { soundFontEngine } from './SoundFontEngine';

// Converts MIDI note to Frequency (Hz)
export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// Convert pitch string like "C4", "F#5", "Bb3" to MIDI number
export function pitchToMidi(pitch: string): number {
  const noteMap: Record<string, number> = {
    C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4,
    F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11
  };
  const match = pitch.match(/^([A-G][#b]?)(-?\d+)$/);
  if (!match) return 60; // Default C4
  const [, name, octaveStr] = match;
  const octave = parseInt(octaveStr, 10);
  const semitone = noteMap[name] ?? 0;
  return (octave + 1) * 12 + semitone;
}

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private currentScore: Score | null = null;
  private playbackStartTime = 0;
  private startBeat = 0;
  private scheduledSources: { stop: () => void }[] = [];
  private animationFrameId: number | null = null;
  private masterGain: GainNode | null = null;
  private masterReverb: ConvolverNode | null = null;
  private trackGains: Map<string, GainNode> = new Map();
  private trackPanners: Map<string, StereoPannerNode> = new Map();

  // Acoustic Sample SoundFont toggle
  public useSoundFontSamples = true;

  // Callbacks
  public onPlayheadUpdate?: (beat: number, measure: number, playingNoteIds: Set<string>) => void;
  public onPlaybackStateChange?: (playing: boolean) => void;

  constructor() {
    // AudioContext will be initialized on user interaction
  }

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.setupMasterChain();
      soundFontEngine.preloadAllFamilies(this.ctx);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private setupMasterChain() {
    if (!this.ctx) return;
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

    // Create algorithmic studio reverb impulse
    this.masterReverb = this.createImpulseReverb(this.ctx, 2.2, 2.0);

    // Master Compressor / Limiter
    const compressor = this.ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-14, this.ctx.currentTime);
    compressor.knee.setValueAtTime(10, this.ctx.currentTime);
    compressor.ratio.setValueAtTime(4, this.ctx.currentTime);
    compressor.attack.setValueAtTime(0.005, this.ctx.currentTime);
    compressor.release.setValueAtTime(0.15, this.ctx.currentTime);

    this.masterGain.connect(compressor);
    compressor.connect(this.ctx.destination);
  }

  // Algorithmic impulse response for concert hall / studio ambience
  private createImpulseReverb(ctx: BaseAudioContext, duration: number, decay: number): ConvolverNode {
    const rate = ctx.sampleRate;
    const length = Math.floor(rate * duration);
    const impulse = ctx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = i / length;
      const factor = Math.exp(-n * decay);
      left[i] = (Math.random() * 2 - 1) * factor;
      right[i] = (Math.random() * 2 - 1) * factor;
    }

    const convolver = ctx.createConvolver();
    convolver.buffer = impulse;
    return convolver;
  }

  public updateTrackMixer(trackId: string, volume: number, pan: number, muted: boolean, solo: boolean, hasAnySolo: boolean) {
    const gainNode = this.trackGains.get(trackId);
    const pannerNode = this.trackPanners.get(trackId);

    if (gainNode && this.ctx) {
      let finalGain = volume;
      if (muted) finalGain = 0;
      else if (hasAnySolo && !solo) finalGain = 0;

      gainNode.gain.setTargetAtTime(finalGain, this.ctx.currentTime, 0.03);
    }

    if (pannerNode && this.ctx) {
      pannerNode.pan.setTargetAtTime(Math.max(-1, Math.min(1, pan)), this.ctx.currentTime, 0.03);
    }
  }

  public play(score: Score, startFromBeat = 0) {
    this.init();
    if (!this.ctx) return;

    this.stop();
    this.currentScore = score;
    this.isPlaying = true;
    this.startBeat = startFromBeat;
    this.playbackStartTime = this.ctx.currentTime;

    const secondsPerBeat = 60 / score.bpm;
    const totalBeats = score.totalMeasures * score.timeSignature.beats;

    const hasAnySolo = score.tracks.some(t => t.solo);

    // Schedule all notes for all active tracks
    score.tracks.forEach(track => {
      // Create track routing
      let trackGain = this.trackGains.get(track.id);
      let trackPan = this.trackPanners.get(track.id);

      if (!trackGain || !trackPan) {
        trackGain = this.ctx!.createGain();
        trackPan = this.ctx!.createStereoPanner();
        trackPan.connect(trackGain);
        trackGain.connect(this.masterGain!);

        // Reverb send
        if (this.masterReverb) {
          const sendGain = this.ctx!.createGain();
          sendGain.gain.setValueAtTime(track.reverbSend, this.ctx!.currentTime);
          trackPan.connect(sendGain);
          sendGain.connect(this.masterReverb);
          this.masterReverb.connect(this.masterGain!);
        }

        this.trackGains.set(track.id, trackGain);
        this.trackPanners.set(track.id, trackPan);
      }

      let gain = track.volume;
      if (track.muted || (hasAnySolo && !track.solo)) gain = 0;
      trackGain.gain.setValueAtTime(gain, this.ctx!.currentTime);
      trackPan.pan.setValueAtTime(track.pan, this.ctx!.currentTime);

      // Schedule notes that start on or after startFromBeat
      track.notes.forEach(note => {
        if (note.startTime + note.duration <= startFromBeat) return;
        const noteStartOffsetBeats = Math.max(0, note.startTime - startFromBeat);
        const noteStartTime = this.playbackStartTime + (noteStartOffsetBeats * secondsPerBeat);
        const durationSec = Math.max(0.08, note.duration * secondsPerBeat);

        const stopHandle = this.synthesizeNote(this.ctx!, trackPan!, note, track.family, noteStartTime, durationSec, track.soundfontKey);
        if (stopHandle) {
          this.scheduledSources.push(stopHandle);
        }
      });
    });

    this.onPlaybackStateChange?.(true);
    this.startPlayheadLoop(score, secondsPerBeat, totalBeats);
  }

  private startPlayheadLoop(score: Score, secondsPerBeat: number, totalBeats: number) {
    const loop = () => {
      if (!this.isPlaying || !this.ctx) return;
      const elapsedSeconds = this.ctx.currentTime - this.playbackStartTime;
      const currentBeat = this.startBeat + (elapsedSeconds / secondsPerBeat);

      if (currentBeat >= totalBeats) {
        this.stop();
        return;
      }

      const currentMeasure = Math.floor(currentBeat / score.timeSignature.beats) + 1;

      // Find currently playing note IDs across tracks
      const playingNotes = new Set<string>();
      score.tracks.forEach(track => {
        track.notes.forEach(note => {
          if (currentBeat >= note.startTime && currentBeat < note.startTime + note.duration) {
            playingNotes.add(note.id);
          }
        });
      });

      this.onPlayheadUpdate?.(currentBeat, currentMeasure, playingNotes);
      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  public pause() {
    this.stop();
  }

  public stop() {
    this.isPlaying = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.scheduledSources.forEach(s => {
      try { s.stop(); } catch (_) { /* ignore */ }
    });
    this.scheduledSources = [];
    this.onPlaybackStateChange?.(false);
  }

  // Play a single note preview on user click/edit
  public previewNote(family: InstrumentFamily, pitch: string, durationSec = 0.8) {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const note: Note = {
      id: 'preview',
      pitch,
      midiNote: pitchToMidi(pitch),
      step: 'C',
      alter: 0,
      octave: 4,
      duration: 1,
      startTime: 0,
      velocity: 95
    };
    this.synthesizeNote(this.ctx, this.masterGain, note, family, this.ctx.currentTime, durationSec);
  }

  // Procedural Instrument Synthesizer Voice
  private synthesizeNote(
    ctx: BaseAudioContext,
    destination: AudioNode,
    note: Note,
    family: InstrumentFamily,
    startTime: number,
    duration: number,
    soundfontKey?: string
  ): { stop: () => void } | null {
    if (note.isRest) return null;

    // Try real acoustic instrument sample from SoundFont first
    if (this.useSoundFontSamples) {
      const midi = note.midiNote > 0 ? note.midiNote : pitchToMidi(note.pitch);
      const sampleHandle = soundFontEngine.playSample(
        ctx,
        destination,
        family,
        midi,
        startTime,
        duration,
        note.velocity || 90,
        soundfontKey
      );
      if (sampleHandle) {
        return sampleHandle;
      }
    }

    const vel = (note.velocity || 90) / 127;
    const freq = note.midiNote > 0 ? midiToFreq(note.midiNote) : midiToFreq(pitchToMidi(note.pitch));

    switch (family) {
      case 'keys': // Piano & Keyboard model: additive multi-harmonic + acoustic hammer strike
        return this.synthKeys(ctx, destination, freq, startTime, duration, vel);
      case 'strings': // Bowed strings model: 3 detuned sawtooths + vibrato + gentle attack
        return this.synthStrings(ctx, destination, freq, startTime, duration, vel);
      case 'woodwinds': // Woodwinds model: pure sine with breath noise and expressive vibrato
        return this.synthWoodwinds(ctx, destination, freq, startTime, duration, vel);
      case 'brass': // Brass model: dual sawtooth with sharp brass envelope filter sweep
        return this.synthBrass(ctx, destination, freq, startTime, duration, vel);
      case 'percussion': // Percussion model: Kick, Snare, Hihat, Timpani, Crash
        return this.synthPercussion(ctx, destination, note.pitch, startTime, vel);
      case 'choir': // Choir SATB vocal formant synthesis: "Aah" / "Ooh" vowels
        return this.synthChoir(ctx, destination, freq, startTime, duration, vel);
      default:
        return this.synthKeys(ctx, destination, freq, startTime, duration, vel);
    }
  }

  // 1. GRAND PIANO / KEYS SYNTH
  private synthKeys(
    ctx: BaseAudioContext,
    destination: AudioNode,
    freq: number,
    startTime: number,
    duration: number,
    velocity: number
  ) {
    const gainNode = ctx.createGain();
    gainNode.connect(destination);

    // Multi-harmonic additive synthesis
    const harmonics = [
      { ratio: 1.0, gain: 0.6 },
      { ratio: 2.0, gain: 0.25 },
      { ratio: 3.01, gain: 0.12 },
      { ratio: 4.02, gain: 0.05 },
    ];

    const oscs: OscillatorNode[] = [];
    harmonics.forEach(h => {
      const osc = ctx.createOscillator();
      const hGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq * h.ratio, startTime);
      hGain.gain.setValueAtTime(h.gain * velocity, startTime);
      osc.connect(hGain);
      hGain.connect(gainNode);
      oscs.push(osc);
    });

    // Acoustic hammer click
    const hammer = ctx.createOscillator();
    const hammerGain = ctx.createGain();
    hammer.type = 'sine';
    hammer.frequency.setValueAtTime(freq * 3.5, startTime);
    hammerGain.gain.setValueAtTime(0.2 * velocity, startTime);
    hammerGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.04);
    hammer.connect(hammerGain);
    hammerGain.connect(gainNode);
    oscs.push(hammer);

    // Piano Envelope: fast attack, logarithmic acoustic decay
    const attack = 0.008;
    const decayDuration = Math.min(duration, 3.5);
    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.linearRampToValueAtTime(0.85 * velocity, startTime + attack);
    gainNode.gain.exponentialRampToValueAtTime(0.4 * velocity, startTime + 0.2);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + decayDuration);

    oscs.forEach(o => {
      o.start(startTime);
      o.stop(startTime + decayDuration);
    });

    return {
      stop: () => {
        oscs.forEach(o => {
          try { o.stop(); } catch (_) { /* ignore */ }
        });
      }
    };
  }

  // 2. BOWED STRINGS SYNTH
  private synthStrings(
    ctx: BaseAudioContext,
    destination: AudioNode,
    freq: number,
    startTime: number,
    duration: number,
    velocity: number
  ) {
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.min(7000, freq * 4.5), startTime);
    filter.Q.setValueAtTime(1.5, startTime);

    gainNode.connect(filter);
    filter.connect(destination);

    // Warm unison detuned sawtooth pair
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const osc3 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc3.type = 'triangle';

    osc1.frequency.setValueAtTime(freq, startTime);
    osc2.frequency.setValueAtTime(freq * 1.004, startTime); // detune +7 cents
    osc3.frequency.setValueAtTime(freq * 0.996, startTime); // detune -7 cents

    // Bowing Vibrato LFO
    const vibrato = ctx.createOscillator();
    const vibratoGain = ctx.createGain();
    vibrato.frequency.setValueAtTime(5.0, startTime); // 5 Hz vibrato
    vibratoGain.gain.setValueAtTime(0, startTime);
    vibratoGain.gain.linearRampToValueAtTime(freq * 0.015, startTime + 0.25);
    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc1.frequency);
    vibratoGain.connect(osc2.frequency);

    // Bowing Attack and Release Envelope
    const attack = 0.08;
    const release = 0.15;
    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.linearRampToValueAtTime(0.65 * velocity, startTime + attack);
    gainNode.gain.setValueAtTime(0.65 * velocity, startTime + duration);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + release);

    [osc1, osc2, osc3, vibrato].forEach(o => {
      o.start(startTime);
      o.stop(startTime + duration + release);
    });

    return {
      stop: () => {
        [osc1, osc2, osc3, vibrato].forEach(o => {
          try { o.stop(); } catch (_) { /* ignore */ }
        });
      }
    };
  }

  // 3. WOODWINDS SYNTH (Flute/Clarinet)
  private synthWoodwinds(
    ctx: BaseAudioContext,
    destination: AudioNode,
    freq: number,
    startTime: number,
    duration: number,
    velocity: number
  ) {
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq * 1.5, startTime);
    filter.Q.setValueAtTime(2.0, startTime);

    gainNode.connect(destination);

    // Pure tone + subtle breath
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    // Second harmonic for woody warmth
    const osc2 = ctx.createOscillator();
    const osc2Gain = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, startTime);
    osc2Gain.gain.setValueAtTime(0.15, startTime);
    osc2.connect(osc2Gain);
    osc2Gain.connect(gainNode);

    // Subtle flautando vibrato
    const vibrato = ctx.createOscillator();
    const vibratoGain = ctx.createGain();
    vibrato.frequency.setValueAtTime(4.8, startTime);
    vibratoGain.gain.setValueAtTime(0, startTime);
    vibratoGain.gain.linearRampToValueAtTime(freq * 0.012, startTime + 0.2);
    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc.frequency);

    osc.connect(gainNode);

    const attack = 0.05;
    const release = 0.12;
    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.linearRampToValueAtTime(0.7 * velocity, startTime + attack);
    gainNode.gain.setValueAtTime(0.6 * velocity, startTime + duration);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + release);

    [osc, osc2, vibrato].forEach(o => {
      o.start(startTime);
      o.stop(startTime + duration + release);
    });

    return {
      stop: () => {
        [osc, osc2, vibrato].forEach(o => {
          try { o.stop(); } catch (_) { /* ignore */ }
        });
      }
    };
  }

  // 4. BRASS SYNTH (Trumpets/Horns)
  private synthBrass(
    ctx: BaseAudioContext,
    destination: AudioNode,
    freq: number,
    startTime: number,
    duration: number,
    velocity: number
  ) {
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.setValueAtTime(4.0, startTime);

    // Characteristic Brass Filter Envelope (cutoff opens up then settles)
    const baseCutoff = Math.min(8000, freq * 2);
    const peakCutoff = Math.min(10000, freq * 7.5);
    filter.frequency.setValueAtTime(baseCutoff, startTime);
    filter.frequency.linearRampToValueAtTime(peakCutoff, startTime + 0.06);
    filter.frequency.exponentialRampToValueAtTime(baseCutoff * 1.5, startTime + 0.25);

    gainNode.connect(filter);
    filter.connect(destination);

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, startTime);
    osc2.frequency.setValueAtTime(freq * 1.002, startTime);

    osc1.connect(gainNode);
    osc2.connect(gainNode);

    const attack = 0.035;
    const release = 0.12;
    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.linearRampToValueAtTime(0.75 * velocity, startTime + attack);
    gainNode.gain.setValueAtTime(0.65 * velocity, startTime + duration);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + release);

    [osc1, osc2].forEach(o => {
      o.start(startTime);
      o.stop(startTime + duration + release);
    });

    return {
      stop: () => {
        [osc1, osc2].forEach(o => {
          try { o.stop(); } catch (_) { /* ignore */ }
        });
      }
    };
  }

  // 5. PERCUSSION SYNTH (Drums & Timpani)
  private synthPercussion(
    ctx: BaseAudioContext,
    destination: AudioNode,
    pitch: string,
    startTime: number,
    velocity: number
  ) {
    const p = pitch.toLowerCase();

    if (p.includes('kick') || p === 'bumbo') {
      // Sub Kick: exponential pitch drop from 135Hz to 42Hz
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, startTime);
      osc.frequency.exponentialRampToValueAtTime(42, startTime + 0.09);

      gain.gain.setValueAtTime(1.0 * velocity, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(destination);
      osc.start(startTime);
      osc.stop(startTime + 0.35);

      return { stop: () => { try { osc.stop(); } catch (_) {} } };
    }

    if (p.includes('snare') || p === 'caixa') {
      // Snare: Tone + Noise burst
      const noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.25), ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.setValueAtTime(1000, startTime);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.8 * velocity, startTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(destination);

      // Body fundamental
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, startTime);
      osc.frequency.exponentialRampToValueAtTime(90, startTime + 0.08);
      oscGain.gain.setValueAtTime(0.7 * velocity, startTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);

      osc.connect(oscGain);
      oscGain.connect(destination);

      noise.start(startTime);
      osc.start(startTime);
      noise.stop(startTime + 0.22);
      osc.stop(startTime + 0.12);

      return {
        stop: () => {
          try { noise.stop(); osc.stop(); } catch (_) {}
        }
      };
    }

    if (p.includes('hihat') || p.includes('hat') || p === 'prato') {
      // Hi-Hat: High metallic noise
      const len = Math.floor(ctx.sampleRate * 0.12);
      const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buffer.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(8000, startTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.55 * velocity, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(destination);

      source.start(startTime);
      source.stop(startTime + 0.08);
      return { stop: () => { try { source.stop(); } catch (_) {} } };
    }

    if (p.includes('crash')) {
      // Crash Cymbal
      const len = Math.floor(ctx.sampleRate * 1.5);
      const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buffer.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(5500, startTime);
      filter.Q.setValueAtTime(0.8, startTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.7 * velocity, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.4);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(destination);

      source.start(startTime);
      source.stop(startTime + 1.4);
      return { stop: () => { try { source.stop(); } catch (_) {} } };
    }

    // Default: Orchestral Timpani
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    const timpaniFreq = 95; // G2
    osc.frequency.setValueAtTime(timpaniFreq * 1.3, startTime);
    osc.frequency.exponentialRampToValueAtTime(timpaniFreq, startTime + 0.06);

    gain.gain.setValueAtTime(0.9 * velocity, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8);

    osc.connect(gain);
    gain.connect(destination);
    osc.start(startTime);
    osc.stop(startTime + 0.8);
    return { stop: () => { try { osc.stop(); } catch (_) {} } };
  }

  // 6. CHOIR & VOCAL SYNTH (Formant Synthesis "Aah" / "Ooh")
  private synthChoir(
    ctx: BaseAudioContext,
    destination: AudioNode,
    freq: number,
    startTime: number,
    duration: number,
    velocity: number
  ) {
    const gainNode = ctx.createGain();

    // Human Vocal Tract Formants for "Aah": F1 ~ 800Hz, F2 ~ 1250Hz
    const f1 = ctx.createBiquadFilter();
    f1.type = 'bandpass';
    f1.frequency.setValueAtTime(800, startTime);
    f1.Q.setValueAtTime(5.0, startTime);

    const f2 = ctx.createBiquadFilter();
    f2.type = 'bandpass';
    f2.frequency.setValueAtTime(1250, startTime);
    f2.Q.setValueAtTime(4.5, startTime);

    const formantMix = ctx.createGain();
    formantMix.gain.setValueAtTime(1.5, startTime);
    f1.connect(formantMix);
    f2.connect(formantMix);
    formantMix.connect(gainNode);
    gainNode.connect(destination);

    // Warm vocal pulse oscillator with stereo chorus detune
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, startTime);
    osc2.frequency.setValueAtTime(freq * 1.003, startTime);

    // Vocal vibrato
    const vibrato = ctx.createOscillator();
    const vibratoGain = ctx.createGain();
    vibrato.frequency.setValueAtTime(5.2, startTime);
    vibratoGain.gain.setValueAtTime(0, startTime);
    vibratoGain.gain.linearRampToValueAtTime(freq * 0.015, startTime + 0.25);
    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc1.frequency);
    vibratoGain.connect(osc2.frequency);

    osc1.connect(f1);
    osc1.connect(f2);
    osc2.connect(f1);
    osc2.connect(f2);

    // Choir breathing swell envelope
    const attack = 0.12;
    const release = 0.25;
    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.linearRampToValueAtTime(0.7 * velocity, startTime + attack);
    gainNode.gain.setValueAtTime(0.65 * velocity, startTime + duration);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + release);

    [osc1, osc2, vibrato].forEach(o => {
      o.start(startTime);
      o.stop(startTime + duration + release);
    });

    return {
      stop: () => {
        [osc1, osc2, vibrato].forEach(o => {
          try { o.stop(); } catch (_) { /* ignore */ }
        });
      }
    };
  }

  // ==========================================
  // HIGH-QUALITY OFFLINE AUDIO EXPORT ENGINE
  // ==========================================
  public async renderScoreToAudioBuffer(
    score: Score,
    soloTrackId?: string,
    sampleRate = 44100
  ): Promise<AudioBuffer> {
    const secondsPerBeat = 60 / score.bpm;
    const totalDuration = (score.totalMeasures * score.timeSignature.beats * secondsPerBeat) + 2.5; // reverb tail
    const lengthSamples = Math.ceil(totalDuration * sampleRate);

    const offlineCtx = new OfflineAudioContext(2, lengthSamples, sampleRate);

    // Master bus
    const masterGain = offlineCtx.createGain();
    masterGain.gain.setValueAtTime(0.9, 0);

    // Master Reverb
    const reverb = this.createImpulseReverb(offlineCtx, 2.5, 2.0);
    reverb.connect(masterGain);

    // Master Limiter
    const comp = offlineCtx.createDynamicsCompressor();
    comp.threshold.setValueAtTime(-12, 0);
    comp.ratio.setValueAtTime(3.5, 0);
    comp.attack.setValueAtTime(0.005, 0);
    comp.release.setValueAtTime(0.15, 0);

    masterGain.connect(comp);
    comp.connect(offlineCtx.destination);

    const hasAnySolo = !!soloTrackId || score.tracks.some(t => t.solo);

    score.tracks.forEach(track => {
      // If we are exporting a solo stem, ignore other tracks
      if (soloTrackId && track.id !== soloTrackId) return;

      if (!soloTrackId) {
        if (track.muted) return;
        if (hasAnySolo && !track.solo) return;
      }

      const trackPan = offlineCtx.createStereoPanner();
      trackPan.pan.setValueAtTime(track.pan, 0);

      const trackGain = offlineCtx.createGain();
      trackGain.gain.setValueAtTime(track.volume, 0);

      trackPan.connect(trackGain);
      trackGain.connect(masterGain);

      // Reverb send
      if (track.reverbSend > 0) {
        const sendGain = offlineCtx.createGain();
        sendGain.gain.setValueAtTime(track.reverbSend, 0);
        trackPan.connect(sendGain);
        sendGain.connect(reverb);
      }

      // Schedule all notes
      track.notes.forEach(note => {
        const startTime = note.startTime * secondsPerBeat;
        const durationSec = Math.max(0.08, note.duration * secondsPerBeat);
        this.synthesizeNote(offlineCtx, trackPan, note, track.family, startTime, durationSec, track.soundfontKey);
      });
    });

    return await offlineCtx.startRendering();
  }

  // Convert rendered AudioBuffer to pristine uncompressed 16-bit stereo PCM WAV Blob
  public audioBufferToWav(buffer: AudioBuffer): Blob {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;

    const length = buffer.length;
    const dataSize = length * blockAlign;
    const bufferLength = 44 + dataSize;
    const arrayBuffer = new ArrayBuffer(bufferLength);
    const view = new DataView(arrayBuffer);

    // Write RIFF header
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    this.writeString(view, 8, 'WAVE');

    // fmt subchunk
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true); // ByteRate
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);

    // data subchunk
    this.writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // Interleave left and right channels to 16-bit PCM
    const left = buffer.getChannelData(0);
    const right = numChannels > 1 ? buffer.getChannelData(1) : left;

    let offset = 44;
    for (let i = 0; i < length; i++) {
      // Left channel sample
      let sLeft = Math.max(-1, Math.min(1, left[i]));
      let valLeft = sLeft < 0 ? sLeft * 0x8000 : sLeft * 0x7fff;
      view.setInt16(offset, valLeft, true);
      offset += 2;

      // Right channel sample
      let sRight = Math.max(-1, Math.min(1, right[i]));
      let valRight = sRight < 0 ? sRight * 0x8000 : sRight * 0x7fff;
      view.setInt16(offset, valRight, true);
      offset += 2;
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  private writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
}

// Global Singleton for easy cross-component access
export const globalAudioEngine = new AudioEngine();
