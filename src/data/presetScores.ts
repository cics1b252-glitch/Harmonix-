import { Score } from '../types/music';
import { TEARS_IN_HEAVEN_SCORE } from './tearsInHeavenScore';

// Helper to quickly generate notes with musical pitches and rhythms
export const PRESET_SCORES: Score[] = [
  TEARS_IN_HEAVEN_SCORE,
  {
    id: 'symphony-g-major',
    title: 'Sinfonia dos Elementos (Orquestra Completa)',
    composer: 'Harmonix Chamber Studio',
    genre: 'Clássico / Orquestral',
    bpm: 112,
    keySignature: 'Sol Maior (G Major)',
    timeSignature: { beats: 4, beatType: 4 },
    totalMeasures: 8,
    createdAt: new Date().toISOString(),
    sourceType: 'preset',
    tracks: [
      {
        id: 'track-strings',
        name: 'Cordas Orquestrais',
        family: 'strings',
        subInstrument: 'Violinos I, II & Violoncelo',
        clef: 'treble',
        color: '#8b5cf6',
        iconName: 'music',
        volume: 0.85,
        pan: -0.3,
        reverbSend: 0.45,
        muted: false,
        solo: false,
        notes: [
          // M1
          { id: 's1', pitch: 'G4', midiNote: 67, step: 'G', alter: 0, octave: 4, duration: 1, startTime: 0, velocity: 85 },
          { id: 's2', pitch: 'B4', midiNote: 71, step: 'B', alter: 0, octave: 4, duration: 1, startTime: 1, velocity: 90 },
          { id: 's3', pitch: 'D5', midiNote: 74, step: 'D', alter: 0, octave: 5, duration: 1, startTime: 2, velocity: 95 },
          { id: 's4', pitch: 'G5', midiNote: 79, step: 'G', alter: 0, octave: 5, duration: 1, startTime: 3, velocity: 100 },
          // M2
          { id: 's5', pitch: 'F#5', midiNote: 78, step: 'F', alter: 1, octave: 5, duration: 1.5, startTime: 4, velocity: 92 },
          { id: 's6', pitch: 'E5', midiNote: 76, step: 'E', alter: 0, octave: 5, duration: 0.5, startTime: 5.5, velocity: 80 },
          { id: 's7', pitch: 'D5', midiNote: 74, step: 'D', alter: 0, octave: 5, duration: 2, startTime: 6, velocity: 88 },
          // M3
          { id: 's8', pitch: 'E5', midiNote: 76, step: 'E', alter: 0, octave: 5, duration: 1, startTime: 8, velocity: 85 },
          { id: 's9', pitch: 'C5', midiNote: 72, step: 'C', alter: 0, octave: 5, duration: 1, startTime: 9, velocity: 82 },
          { id: 's10', pitch: 'A4', midiNote: 69, step: 'A', alter: 0, octave: 4, duration: 1, startTime: 10, velocity: 85 },
          { id: 's11', pitch: 'F#4', midiNote: 66, step: 'F', alter: 1, octave: 4, duration: 1, startTime: 11, velocity: 80 },
          // M4
          { id: 's12', pitch: 'G4', midiNote: 67, step: 'G', alter: 0, octave: 4, duration: 3, startTime: 12, velocity: 95 },
          { id: 's13', pitch: 'B4', midiNote: 71, step: 'B', alter: 0, octave: 4, duration: 1, startTime: 15, velocity: 85 },
          // M5
          { id: 's14', pitch: 'A4', midiNote: 69, step: 'A', alter: 0, octave: 4, duration: 1, startTime: 16, velocity: 90 },
          { id: 's15', pitch: 'D5', midiNote: 74, step: 'D', alter: 0, octave: 5, duration: 1, startTime: 17, velocity: 92 },
          { id: 's16', pitch: 'C5', midiNote: 72, step: 'C', alter: 0, octave: 5, duration: 1, startTime: 18, velocity: 88 },
          { id: 's17', pitch: 'B4', midiNote: 71, step: 'B', alter: 0, octave: 4, duration: 1, startTime: 19, velocity: 84 },
          // M6
          { id: 's18', pitch: 'A4', midiNote: 69, step: 'A', alter: 0, octave: 4, duration: 2, startTime: 20, velocity: 90 },
          { id: 's19', pitch: 'D4', midiNote: 62, step: 'D', alter: 0, octave: 4, duration: 2, startTime: 22, velocity: 85 },
          // M7
          { id: 's20', pitch: 'B4', midiNote: 71, step: 'B', alter: 0, octave: 4, duration: 1, startTime: 24, velocity: 90 },
          { id: 's21', pitch: 'C5', midiNote: 72, step: 'C', alter: 0, octave: 5, duration: 1, startTime: 25, velocity: 92 },
          { id: 's22', pitch: 'D5', midiNote: 74, step: 'D', alter: 0, octave: 5, duration: 1, startTime: 26, velocity: 98 },
          { id: 's23', pitch: 'B4', midiNote: 71, step: 'B', alter: 0, octave: 4, duration: 1, startTime: 27, velocity: 90 },
          // M8
          { id: 's24', pitch: 'G4', midiNote: 67, step: 'G', alter: 0, octave: 4, duration: 4, startTime: 28, velocity: 100 },
        ],
      },
      {
        id: 'track-keys',
        name: 'Teclas & Piano de Cauda',
        family: 'keys',
        subInstrument: 'Piano Steinway Concert D',
        clef: 'treble',
        color: '#3b82f6',
        iconName: 'piano',
        volume: 0.9,
        pan: 0.2,
        reverbSend: 0.35,
        muted: false,
        solo: false,
        notes: [
          // M1: Arpeggio G - B - D - G
          { id: 'k1', pitch: 'G3', midiNote: 55, step: 'G', alter: 0, octave: 3, duration: 0.5, startTime: 0, velocity: 75 },
          { id: 'k2', pitch: 'B3', midiNote: 59, step: 'B', alter: 0, octave: 3, duration: 0.5, startTime: 0.5, velocity: 78 },
          { id: 'k3', pitch: 'D4', midiNote: 62, step: 'D', alter: 0, octave: 4, duration: 0.5, startTime: 1, velocity: 80 },
          { id: 'k4', pitch: 'G4', midiNote: 67, step: 'G', alter: 0, octave: 4, duration: 0.5, startTime: 1.5, velocity: 82 },
          { id: 'k5', pitch: 'B4', midiNote: 71, step: 'B', alter: 0, octave: 4, duration: 0.5, startTime: 2, velocity: 84 },
          { id: 'k6', pitch: 'D4', midiNote: 62, step: 'D', alter: 0, octave: 4, duration: 0.5, startTime: 2.5, velocity: 78 },
          { id: 'k7', pitch: 'B3', midiNote: 59, step: 'B', alter: 0, octave: 3, duration: 0.5, startTime: 3, velocity: 76 },
          { id: 'k8', pitch: 'D4', midiNote: 62, step: 'D', alter: 0, octave: 4, duration: 0.5, startTime: 3.5, velocity: 78 },
          // M2: D major chord arpeggios
          { id: 'k9', pitch: 'D3', midiNote: 50, step: 'D', alter: 0, octave: 3, duration: 1, startTime: 4, velocity: 80 },
          { id: 'k10', pitch: 'F#4', midiNote: 66, step: 'F', alter: 1, octave: 4, duration: 1, startTime: 5, velocity: 82 },
          { id: 'k11', pitch: 'A4', midiNote: 69, step: 'A', alter: 0, octave: 4, duration: 1, startTime: 6, velocity: 84 },
          { id: 'k12', pitch: 'D4', midiNote: 62, step: 'D', alter: 0, octave: 4, duration: 1, startTime: 7, velocity: 80 },
          // M3: C major chord
          { id: 'k13', pitch: 'C3', midiNote: 48, step: 'C', alter: 0, octave: 3, duration: 1, startTime: 8, velocity: 82 },
          { id: 'k14', pitch: 'E4', midiNote: 64, step: 'E', alter: 0, octave: 4, duration: 1, startTime: 9, velocity: 80 },
          { id: 'k15', pitch: 'G4', midiNote: 67, step: 'G', alter: 0, octave: 4, duration: 1, startTime: 10, velocity: 80 },
          { id: 'k16', pitch: 'C4', midiNote: 60, step: 'C', alter: 0, octave: 4, duration: 1, startTime: 11, velocity: 78 },
          // M4: G chord resolution
          { id: 'k17', pitch: 'G2', midiNote: 43, step: 'G', alter: 0, octave: 2, duration: 2, startTime: 12, velocity: 88 },
          { id: 'k18', pitch: 'B3', midiNote: 59, step: 'B', alter: 0, octave: 3, duration: 2, startTime: 14, velocity: 82 },
          // M5: Am arpeggio
          { id: 'k19', pitch: 'A2', midiNote: 45, step: 'A', alter: 0, octave: 2, duration: 1, startTime: 16, velocity: 80 },
          { id: 'k20', pitch: 'E3', midiNote: 52, step: 'E', alter: 0, octave: 3, duration: 1, startTime: 17, velocity: 82 },
          { id: 'k21', pitch: 'A3', midiNote: 57, step: 'A', alter: 0, octave: 3, duration: 1, startTime: 18, velocity: 84 },
          { id: 'k22', pitch: 'C4', midiNote: 60, step: 'C', alter: 0, octave: 4, duration: 1, startTime: 19, velocity: 82 },
          // M6: D7
          { id: 'k23', pitch: 'D3', midiNote: 50, step: 'D', alter: 0, octave: 3, duration: 2, startTime: 20, velocity: 85 },
          { id: 'k24', pitch: 'F#3', midiNote: 54, step: 'F', alter: 1, octave: 3, duration: 2, startTime: 22, velocity: 82 },
          // M7: Em - G
          { id: 'k25', pitch: 'E3', midiNote: 52, step: 'E', alter: 0, octave: 3, duration: 1, startTime: 24, velocity: 85 },
          { id: 'k26', pitch: 'G3', midiNote: 55, step: 'G', alter: 0, octave: 3, duration: 1, startTime: 25, velocity: 85 },
          { id: 'k27', pitch: 'B3', midiNote: 59, step: 'B', alter: 0, octave: 3, duration: 1, startTime: 26, velocity: 88 },
          { id: 'k28', pitch: 'D4', midiNote: 62, step: 'D', alter: 0, octave: 4, duration: 1, startTime: 27, velocity: 86 },
          // M8: Final Grand Cadence
          { id: 'k29', pitch: 'G2', midiNote: 43, step: 'G', alter: 0, octave: 2, duration: 4, startTime: 28, velocity: 95 },
        ],
      },
      {
        id: 'track-percussion',
        name: 'Percussão Orquestral',
        family: 'percussion',
        subInstrument: 'Tímpanos, Caixa & Bumbo',
        clef: 'percussion',
        color: '#f97316',
        iconName: 'disc',
        volume: 0.8,
        pan: 0.0,
        reverbSend: 0.5,
        muted: false,
        solo: false,
        notes: [
          // M1
          { id: 'p1', pitch: 'kick', midiNote: 36, step: 'P', alter: 0, octave: 1, duration: 1, startTime: 0, velocity: 95 },
          { id: 'p2', pitch: 'snare', midiNote: 38, step: 'P', alter: 0, octave: 1, duration: 1, startTime: 1, velocity: 80 },
          { id: 'p3', pitch: 'kick', midiNote: 36, step: 'P', alter: 0, octave: 1, duration: 1, startTime: 2, velocity: 90 },
          { id: 'p4', pitch: 'snare', midiNote: 38, step: 'P', alter: 0, octave: 1, duration: 1, startTime: 3, velocity: 95 },
          // M2
          { id: 'p5', pitch: 'kick', midiNote: 36, step: 'P', alter: 0, octave: 1, duration: 1, startTime: 4, velocity: 90 },
          { id: 'p6', pitch: 'hihat', midiNote: 42, step: 'P', alter: 0, octave: 1, duration: 0.5, startTime: 5, velocity: 75 },
          { id: 'p7', pitch: 'hihat', midiNote: 42, step: 'P', alter: 0, octave: 1, duration: 0.5, startTime: 5.5, velocity: 75 },
          { id: 'p8', pitch: 'kick', midiNote: 36, step: 'P', alter: 0, octave: 1, duration: 1, startTime: 6, velocity: 92 },
          { id: 'p9', pitch: 'snare', midiNote: 38, step: 'P', alter: 0, octave: 1, duration: 1, startTime: 7, velocity: 100 },
          // M3
          { id: 'p10', pitch: 'timpani', midiNote: 41, step: 'P', alter: 0, octave: 1, duration: 2, startTime: 8, velocity: 95 },
          { id: 'p11', pitch: 'snare', midiNote: 38, step: 'P', alter: 0, octave: 1, duration: 1, startTime: 10, velocity: 85 },
          { id: 'p12', pitch: 'crash', midiNote: 49, step: 'P', alter: 0, octave: 1, duration: 1, startTime: 11, velocity: 90 },
          // M4
          { id: 'p13', pitch: 'kick', midiNote: 36, step: 'P', alter: 0, octave: 1, duration: 2, startTime: 12, velocity: 100 },
          { id: 'p14', pitch: 'timpani', midiNote: 43, step: 'P', alter: 0, octave: 1, duration: 2, startTime: 14, velocity: 90 },
          // M5
          { id: 'p15', pitch: 'kick', midiNote: 36, step: 'P', alter: 0, octave: 1, duration: 1, startTime: 16, velocity: 90 },
          { id: 'p16', pitch: 'snare', midiNote: 38, step: 'P', alter: 0, octave: 1, duration: 1, startTime: 17, velocity: 85 },
          { id: 'p17', pitch: 'kick', midiNote: 36, step: 'P', alter: 0, octave: 1, duration: 1, startTime: 18, velocity: 92 },
          { id: 'p18', pitch: 'snare', midiNote: 38, step: 'P', alter: 0, octave: 1, duration: 1, startTime: 19, velocity: 90 },
          // M6
          { id: 'p19', pitch: 'timpani', midiNote: 50, step: 'P', alter: 0, octave: 1, duration: 2, startTime: 20, velocity: 95 },
          { id: 'p20', pitch: 'timpani', midiNote: 43, step: 'P', alter: 0, octave: 1, duration: 2, startTime: 22, velocity: 95 },
          // M7: Roll crescendo
          { id: 'p21', pitch: 'snare', midiNote: 38, step: 'P', alter: 0, octave: 1, duration: 0.5, startTime: 24, velocity: 70 },
          { id: 'p22', pitch: 'snare', midiNote: 38, step: 'P', alter: 0, octave: 1, duration: 0.5, startTime: 24.5, velocity: 80 },
          { id: 'p23', pitch: 'snare', midiNote: 38, step: 'P', alter: 0, octave: 1, duration: 0.5, startTime: 25, velocity: 90 },
          { id: 'p24', pitch: 'snare', midiNote: 38, step: 'P', alter: 0, octave: 1, duration: 0.5, startTime: 25.5, velocity: 100 },
          { id: 'p25', pitch: 'crash', midiNote: 49, step: 'P', alter: 0, octave: 1, duration: 2, startTime: 26, velocity: 105 },
          // M8: Final hit
          { id: 'p26', pitch: 'timpani', midiNote: 43, step: 'P', alter: 0, octave: 1, duration: 4, startTime: 28, velocity: 110 },
        ],
      },
      {
        id: 'track-woodwinds',
        name: 'Sopros de Madeira',
        family: 'woodwinds',
        subInstrument: 'Flauta Transversal & Oboé',
        clef: 'treble',
        color: '#10b981',
        iconName: 'wind',
        volume: 0.78,
        pan: -0.4,
        reverbSend: 0.4,
        muted: false,
        solo: false,
        notes: [
          // M1
          { id: 'w1', pitch: 'B5', midiNote: 83, step: 'B', alter: 0, octave: 5, duration: 2, startTime: 0, velocity: 80 },
          { id: 'w2', pitch: 'D6', midiNote: 86, step: 'D', alter: 0, octave: 6, duration: 2, startTime: 2, velocity: 85 },
          // M2
          { id: 'w3', pitch: 'A5', midiNote: 81, step: 'A', alter: 0, octave: 5, duration: 3, startTime: 4, velocity: 82 },
          { id: 'w4', pitch: 'G5', midiNote: 79, step: 'G', alter: 0, octave: 5, duration: 1, startTime: 7, velocity: 78 },
          // M3
          { id: 'w5', pitch: 'E5', midiNote: 76, step: 'E', alter: 0, octave: 5, duration: 2, startTime: 8, velocity: 80 },
          { id: 'w6', pitch: 'C6', midiNote: 84, step: 'C', alter: 0, octave: 6, duration: 2, startTime: 10, velocity: 84 },
          // M4
          { id: 'w7', pitch: 'B5', midiNote: 83, step: 'B', alter: 0, octave: 5, duration: 4, startTime: 12, velocity: 86 },
          // M5
          { id: 'w8', pitch: 'C6', midiNote: 84, step: 'C', alter: 0, octave: 6, duration: 2, startTime: 16, velocity: 82 },
          { id: 'w9', pitch: 'D6', midiNote: 86, step: 'D', alter: 0, octave: 6, duration: 2, startTime: 18, velocity: 85 },
          // M6
          { id: 'w10', pitch: 'F#5', midiNote: 78, step: 'F', alter: 1, octave: 5, duration: 4, startTime: 20, velocity: 80 },
          // M7
          { id: 'w11', pitch: 'G5', midiNote: 79, step: 'G', alter: 0, octave: 5, duration: 2, startTime: 24, velocity: 88 },
          { id: 'w12', pitch: 'B5', midiNote: 83, step: 'B', alter: 0, octave: 5, duration: 2, startTime: 26, velocity: 90 },
          // M8
          { id: 'w13', pitch: 'G6', midiNote: 91, step: 'G', alter: 0, octave: 6, duration: 4, startTime: 28, velocity: 92 },
        ],
      },
      {
        id: 'track-brass',
        name: 'Metais da Orquestra',
        family: 'brass',
        subInstrument: 'Trompetes & Trompas Francesas',
        clef: 'treble',
        color: '#eab308',
        iconName: 'bell',
        volume: 0.82,
        pan: 0.35,
        reverbSend: 0.5,
        muted: false,
        solo: false,
        notes: [
          // M1: Fanfare entrada
          { id: 'b1', pitch: 'G4', midiNote: 67, step: 'G', alter: 0, octave: 4, duration: 1.5, startTime: 0, velocity: 92 },
          { id: 'b2', pitch: 'D4', midiNote: 62, step: 'D', alter: 0, octave: 4, duration: 0.5, startTime: 1.5, velocity: 88 },
          { id: 'b3', pitch: 'G4', midiNote: 67, step: 'G', alter: 0, octave: 4, duration: 2, startTime: 2, velocity: 96 },
          // M2
          { id: 'b4', pitch: 'A4', midiNote: 69, step: 'A', alter: 0, octave: 4, duration: 2, startTime: 4, velocity: 90 },
          { id: 'b5', pitch: 'D4', midiNote: 62, step: 'D', alter: 0, octave: 4, duration: 2, startTime: 6, velocity: 88 },
          // M3
          { id: 'b6', pitch: 'E4', midiNote: 64, step: 'E', alter: 0, octave: 4, duration: 2, startTime: 8, velocity: 90 },
          { id: 'b7', pitch: 'F#4', midiNote: 66, step: 'F', alter: 1, octave: 4, duration: 2, startTime: 10, velocity: 92 },
          // M4: Poderoso uníssono
          { id: 'b8', pitch: 'G4', midiNote: 67, step: 'G', alter: 0, octave: 4, duration: 4, startTime: 12, velocity: 100 },
          // M5
          { id: 'b9', pitch: 'A4', midiNote: 69, step: 'A', alter: 0, octave: 4, duration: 2, startTime: 16, velocity: 90 },
          { id: 'b10', pitch: 'B4', midiNote: 71, step: 'B', alter: 0, octave: 4, duration: 2, startTime: 18, velocity: 94 },
          // M6: Acorde sustentado
          { id: 'b11', pitch: 'D5', midiNote: 74, step: 'D', alter: 0, octave: 5, duration: 4, startTime: 20, velocity: 96 },
          // M7: Triunfante
          { id: 'b12', pitch: 'D4', midiNote: 62, step: 'D', alter: 0, octave: 4, duration: 1, startTime: 24, velocity: 95 },
          { id: 'b13', pitch: 'G4', midiNote: 67, step: 'G', alter: 0, octave: 4, duration: 1, startTime: 25, velocity: 98 },
          { id: 'b14', pitch: 'B4', midiNote: 71, step: 'B', alter: 0, octave: 4, duration: 2, startTime: 26, velocity: 102 },
          // M8: Final Majestoso
          { id: 'b15', pitch: 'G4', midiNote: 67, step: 'G', alter: 0, octave: 4, duration: 4, startTime: 28, velocity: 105 },
        ],
      },
      {
        id: 'track-choir',
        name: 'Coral Misto (SATB)',
        family: 'choir',
        subInstrument: 'Vozes Soprano, Alto & Tenor',
        clef: 'treble',
        color: '#ec4899',
        iconName: 'users',
        volume: 0.88,
        pan: 0.0,
        reverbSend: 0.65,
        muted: false,
        solo: false,
        notes: [
          // M1
          { id: 'c1', pitch: 'B4', midiNote: 71, step: 'B', alter: 0, octave: 4, duration: 2, startTime: 0, velocity: 88, lyric: 'Glo-' },
          { id: 'c2', pitch: 'D5', midiNote: 74, step: 'D', alter: 0, octave: 5, duration: 2, startTime: 2, velocity: 90, lyric: '-ri-' },
          // M2
          { id: 'c3', pitch: 'C5', midiNote: 72, step: 'C', alter: 0, octave: 5, duration: 2, startTime: 4, velocity: 85, lyric: '-a' },
          { id: 'c4', pitch: 'B4', midiNote: 71, step: 'B', alter: 0, octave: 4, duration: 2, startTime: 6, velocity: 85, lyric: 'in' },
          // M3
          { id: 'c5', pitch: 'A4', midiNote: 69, step: 'A', alter: 0, octave: 4, duration: 2, startTime: 8, velocity: 84, lyric: 'ex-' },
          { id: 'c6', pitch: 'C5', midiNote: 72, step: 'C', alter: 0, octave: 5, duration: 2, startTime: 10, velocity: 86, lyric: '-cel-' },
          // M4
          { id: 'c7', pitch: 'B4', midiNote: 71, step: 'B', alter: 0, octave: 4, duration: 4, startTime: 12, velocity: 90, lyric: '-sis' },
          // M5
          { id: 'c8', pitch: 'D5', midiNote: 74, step: 'D', alter: 0, octave: 5, duration: 2, startTime: 16, velocity: 90, lyric: 'De-' },
          { id: 'c9', pitch: 'C5', midiNote: 72, step: 'C', alter: 0, octave: 5, duration: 2, startTime: 18, velocity: 88, lyric: '-o,' },
          // M6
          { id: 'c10', pitch: 'F#4', midiNote: 66, step: 'F', alter: 1, octave: 4, duration: 4, startTime: 20, velocity: 85, lyric: 'pa-' },
          // M7
          { id: 'c11', pitch: 'G4', midiNote: 67, step: 'G', alter: 0, octave: 4, duration: 2, startTime: 24, velocity: 92, lyric: '-cem' },
          { id: 'c12', pitch: 'B4', midiNote: 71, step: 'B', alter: 0, octave: 4, duration: 2, startTime: 26, velocity: 95, lyric: 'sem-' },
          // M8
          { id: 'c13', pitch: 'G4', midiNote: 67, step: 'G', alter: 0, octave: 4, duration: 4, startTime: 28, velocity: 100, lyric: '-per!' },
        ],
      },
    ],
  },
  {
    id: 'bossa-jazz-ensemble',
    title: 'Noite de Bossa & Jazz (Harmonia Aberta)',
    composer: 'Harmonix Acoustic Lab',
    genre: 'Bossa Nova / Jazz Acústico',
    bpm: 124,
    keySignature: 'F Maior (F Major)',
    timeSignature: { beats: 4, beatType: 4 },
    totalMeasures: 8,
    createdAt: new Date().toISOString(),
    sourceType: 'preset',
    tracks: [
      {
        id: 'bossa-keys',
        name: 'Teclas & Rhodes',
        family: 'keys',
        subInstrument: 'Piano Elétrico Vintage Rhodes',
        clef: 'treble',
        color: '#3b82f6',
        iconName: 'piano',
        volume: 0.9,
        pan: -0.2,
        reverbSend: 0.35,
        muted: false,
        solo: false,
        notes: [
          // Fmaj7 syncopations
          { id: 'bk1', pitch: 'F3', midiNote: 53, step: 'F', alter: 0, octave: 3, duration: 1.5, startTime: 0, velocity: 80 },
          { id: 'bk2', pitch: 'A3', midiNote: 57, step: 'A', alter: 0, octave: 3, duration: 1, startTime: 1.5, velocity: 75 },
          { id: 'bk3', pitch: 'C4', midiNote: 60, step: 'C', alter: 0, octave: 4, duration: 1.5, startTime: 2.5, velocity: 78 },
          // Gm7
          { id: 'bk4', pitch: 'G3', midiNote: 55, step: 'G', alter: 0, octave: 3, duration: 1.5, startTime: 4, velocity: 80 },
          { id: 'bk5', pitch: 'Bb3', midiNote: 58, step: 'B', alter: -1, octave: 3, duration: 1, startTime: 5.5, velocity: 76 },
          { id: 'bk6', pitch: 'D4', midiNote: 62, step: 'D', alter: 0, octave: 4, duration: 1.5, startTime: 6.5, velocity: 78 },
          // Am7
          { id: 'bk7', pitch: 'A3', midiNote: 57, step: 'A', alter: 0, octave: 3, duration: 1.5, startTime: 8, velocity: 82 },
          { id: 'bk8', pitch: 'C4', midiNote: 60, step: 'C', alter: 0, octave: 4, duration: 1, startTime: 9.5, velocity: 78 },
          { id: 'bk9', pitch: 'E4', midiNote: 64, step: 'E', alter: 0, octave: 4, duration: 1.5, startTime: 10.5, velocity: 80 },
          // D7(b9)
          { id: 'bk10', pitch: 'D3', midiNote: 50, step: 'D', alter: 0, octave: 3, duration: 2, startTime: 12, velocity: 84 },
          { id: 'bk11', pitch: 'F#3', midiNote: 54, step: 'F', alter: 1, octave: 3, duration: 2, startTime: 14, velocity: 80 },
          // Gm9
          { id: 'bk12', pitch: 'G3', midiNote: 55, step: 'G', alter: 0, octave: 3, duration: 1.5, startTime: 16, velocity: 80 },
          { id: 'bk13', pitch: 'A3', midiNote: 57, step: 'A', alter: 0, octave: 3, duration: 1, startTime: 17.5, velocity: 78 },
          { id: 'bk14', pitch: 'D4', midiNote: 62, step: 'D', alter: 0, octave: 4, duration: 1.5, startTime: 18.5, velocity: 80 },
          // C13
          { id: 'bk15', pitch: 'C3', midiNote: 48, step: 'C', alter: 0, octave: 3, duration: 2, startTime: 20, velocity: 85 },
          { id: 'bk16', pitch: 'E3', midiNote: 52, step: 'E', alter: 0, octave: 3, duration: 2, startTime: 22, velocity: 80 },
          // F6/9
          { id: 'bk17', pitch: 'F3', midiNote: 53, step: 'F', alter: 0, octave: 3, duration: 4, startTime: 24, velocity: 88 },
          { id: 'bk18', pitch: 'A3', midiNote: 57, step: 'A', alter: 0, octave: 3, duration: 4, startTime: 28, velocity: 85 },
        ],
      },
      {
        id: 'bossa-strings',
        name: 'Baixo Acústico & Cordas',
        family: 'strings',
        subInstrument: 'Contrabaixo Acústico de Jazz',
        clef: 'bass',
        color: '#8b5cf6',
        iconName: 'music',
        volume: 0.88,
        pan: -0.1,
        reverbSend: 0.25,
        muted: false,
        solo: false,
        notes: [
          // Bossa bassline walking F - C
          { id: 'bs1', pitch: 'F2', midiNote: 41, step: 'F', alter: 0, octave: 2, duration: 1.5, startTime: 0, velocity: 88 },
          { id: 'bs2', pitch: 'C3', midiNote: 48, step: 'C', alter: 0, octave: 3, duration: 1, startTime: 1.5, velocity: 82 },
          { id: 'bs3', pitch: 'F2', midiNote: 41, step: 'F', alter: 0, octave: 2, duration: 1.5, startTime: 2.5, velocity: 85 },
          // G - D
          { id: 'bs4', pitch: 'G2', midiNote: 43, step: 'G', alter: 0, octave: 2, duration: 1.5, startTime: 4, velocity: 88 },
          { id: 'bs5', pitch: 'D3', midiNote: 50, step: 'D', alter: 0, octave: 3, duration: 1, startTime: 5.5, velocity: 82 },
          { id: 'bs6', pitch: 'G2', midiNote: 43, step: 'G', alter: 0, octave: 2, duration: 1.5, startTime: 6.5, velocity: 85 },
          // A - E
          { id: 'bs7', pitch: 'A2', midiNote: 45, step: 'A', alter: 0, octave: 2, duration: 1.5, startTime: 8, velocity: 90 },
          { id: 'bs8', pitch: 'E3', midiNote: 52, step: 'E', alter: 0, octave: 3, duration: 1, startTime: 9.5, velocity: 82 },
          { id: 'bs9', pitch: 'A2', midiNote: 45, step: 'A', alter: 0, octave: 2, duration: 1.5, startTime: 10.5, velocity: 85 },
          // D - A
          { id: 'bs10', pitch: 'D2', midiNote: 38, step: 'D', alter: 0, octave: 2, duration: 2, startTime: 12, velocity: 90 },
          { id: 'bs11', pitch: 'A2', midiNote: 45, step: 'A', alter: 0, octave: 2, duration: 2, startTime: 14, velocity: 85 },
          // G - C
          { id: 'bs12', pitch: 'G2', midiNote: 43, step: 'G', alter: 0, octave: 2, duration: 2, startTime: 16, velocity: 88 },
          { id: 'bs13', pitch: 'C2', midiNote: 36, step: 'C', alter: 0, octave: 2, duration: 2, startTime: 18, velocity: 88 },
          // C7 cadence
          { id: 'bs14', pitch: 'C2', midiNote: 36, step: 'C', alter: 0, octave: 2, duration: 4, startTime: 20, velocity: 92 },
          // Final F
          { id: 'bs15', pitch: 'F2', midiNote: 41, step: 'F', alter: 0, octave: 2, duration: 4, startTime: 24, velocity: 95 },
          { id: 'bs16', pitch: 'F1', midiNote: 29, step: 'F', alter: 0, octave: 1, duration: 4, startTime: 28, velocity: 100 },
        ],
      },
      {
        id: 'bossa-woodwinds',
        name: 'Sopros (Flauta & Sax)',
        family: 'woodwinds',
        subInstrument: 'Flauta & Sax Tenor',
        clef: 'treble',
        color: '#10b981',
        iconName: 'wind',
        volume: 0.85,
        pan: 0.3,
        reverbSend: 0.45,
        muted: false,
        solo: false,
        notes: [
          { id: 'bw1', pitch: 'A4', midiNote: 69, step: 'A', alter: 0, octave: 4, duration: 1, startTime: 0, velocity: 85 },
          { id: 'bw2', pitch: 'C5', midiNote: 72, step: 'C', alter: 0, octave: 5, duration: 1.5, startTime: 1, velocity: 90 },
          { id: 'bw3', pitch: 'D5', midiNote: 74, step: 'D', alter: 0, octave: 5, duration: 1.5, startTime: 2.5, velocity: 88 },
          { id: 'bw4', pitch: 'Bb4', midiNote: 70, step: 'B', alter: -1, octave: 4, duration: 2, startTime: 4, velocity: 84 },
          { id: 'bw5', pitch: 'G4', midiNote: 67, step: 'G', alter: 0, octave: 4, duration: 2, startTime: 6, velocity: 82 },
          { id: 'bw6', pitch: 'C5', midiNote: 72, step: 'C', alter: 0, octave: 5, duration: 1, startTime: 8, velocity: 88 },
          { id: 'bw7', pitch: 'E5', midiNote: 76, step: 'E', alter: 0, octave: 5, duration: 2, startTime: 9, velocity: 92 },
          { id: 'bw8', pitch: 'D5', midiNote: 74, step: 'D', alter: 0, octave: 5, duration: 1, startTime: 11, velocity: 86 },
          { id: 'bw9', pitch: 'F5', midiNote: 77, step: 'F', alter: 0, octave: 5, duration: 4, startTime: 12, velocity: 90 },
          { id: 'bw10', pitch: 'D5', midiNote: 74, step: 'D', alter: 0, octave: 5, duration: 2, startTime: 16, velocity: 84 },
          { id: 'bw11', pitch: 'Bb4', midiNote: 70, step: 'B', alter: -1, octave: 4, duration: 2, startTime: 18, velocity: 82 },
          { id: 'bw12', pitch: 'G4', midiNote: 67, step: 'G', alter: 0, octave: 4, duration: 4, startTime: 20, velocity: 85 },
          { id: 'bw13', pitch: 'A4', midiNote: 69, step: 'A', alter: 0, octave: 4, duration: 4, startTime: 24, velocity: 90 },
          { id: 'bw14', pitch: 'F5', midiNote: 77, step: 'F', alter: 0, octave: 5, duration: 4, startTime: 28, velocity: 92 },
        ],
      },
      {
        id: 'bossa-brass',
        name: 'Metais Muted',
        family: 'brass',
        subInstrument: 'Trompete com Surdina Harmon',
        clef: 'treble',
        color: '#eab308',
        iconName: 'bell',
        volume: 0.75,
        pan: 0.4,
        reverbSend: 0.4,
        muted: false,
        solo: false,
        notes: [
          { id: 'bb1', pitch: 'C5', midiNote: 72, step: 'C', alter: 0, octave: 5, duration: 2, startTime: 2, velocity: 80 },
          { id: 'bb2', pitch: 'D5', midiNote: 74, step: 'D', alter: 0, octave: 5, duration: 2, startTime: 6, velocity: 82 },
          { id: 'bb3', pitch: 'E5', midiNote: 76, step: 'E', alter: 0, octave: 5, duration: 2, startTime: 10, velocity: 84 },
          { id: 'bb4', pitch: 'F#4', midiNote: 66, step: 'F', alter: 1, octave: 4, duration: 2, startTime: 14, velocity: 80 },
          { id: 'bb5', pitch: 'G4', midiNote: 67, step: 'G', alter: 0, octave: 4, duration: 2, startTime: 18, velocity: 82 },
          { id: 'bb6', pitch: 'C5', midiNote: 72, step: 'C', alter: 0, octave: 5, duration: 2, startTime: 22, velocity: 85 },
          { id: 'bb7', pitch: 'A4', midiNote: 69, step: 'A', alter: 0, octave: 4, duration: 4, startTime: 26, velocity: 88 },
        ],
      },
      {
        id: 'bossa-percussion',
        name: 'Bateria Bossa Nova',
        family: 'percussion',
        subInstrument: 'Vassourinhas & Cross-Stick',
        clef: 'percussion',
        color: '#f97316',
        iconName: 'disc',
        volume: 0.78,
        pan: 0.0,
        reverbSend: 0.35,
        muted: false,
        solo: false,
        notes: [
          // Classic Bossa cross-stick rhythm: 1, 1+, 2+, 3, 4
          { id: 'bp1', pitch: 'snare', midiNote: 38, step: 'P', alter: 0, octave: 1, duration: 0.5, startTime: 0, velocity: 75 },
          { id: 'bp2', pitch: 'hihat', midiNote: 42, step: 'P', alter: 0, octave: 1, duration: 0.5, startTime: 0.5, velocity: 65 },
          { id: 'bp3', pitch: 'snare', midiNote: 38, step: 'P', alter: 0, octave: 1, duration: 0.5, startTime: 1.5, velocity: 80 },
          { id: 'bp4', pitch: 'kick', midiNote: 36, step: 'P', alter: 0, octave: 1, duration: 1, startTime: 2, velocity: 75 },
          { id: 'bp5', pitch: 'snare', midiNote: 38, step: 'P', alter: 0, octave: 1, duration: 0.5, startTime: 2.5, velocity: 80 },
          { id: 'bp6', pitch: 'snare', midiNote: 38, step: 'P', alter: 0, octave: 1, duration: 0.5, startTime: 3.5, velocity: 75 },
          // M2
          { id: 'bp7', pitch: 'kick', midiNote: 36, step: 'P', alter: 0, octave: 1, duration: 1, startTime: 4, velocity: 78 },
          { id: 'bp8', pitch: 'snare', midiNote: 38, step: 'P', alter: 0, octave: 1, duration: 0.5, startTime: 5, velocity: 82 },
          { id: 'bp9', pitch: 'hihat', midiNote: 42, step: 'P', alter: 0, octave: 1, duration: 0.5, startTime: 5.5, velocity: 70 },
          { id: 'bp10', pitch: 'snare', midiNote: 38, step: 'P', alter: 0, octave: 1, duration: 1, startTime: 6.5, velocity: 80 },
          // M3-M8 repetitive groove
          { id: 'bp11', pitch: 'kick', midiNote: 36, step: 'P', alter: 0, octave: 1, duration: 1, startTime: 8, velocity: 78 },
          { id: 'bp12', pitch: 'snare', midiNote: 38, step: 'P', alter: 0, octave: 1, duration: 1, startTime: 10, velocity: 80 },
          { id: 'bp13', pitch: 'kick', midiNote: 36, step: 'P', alter: 0, octave: 1, duration: 1, startTime: 12, velocity: 78 },
          { id: 'bp14', pitch: 'snare', midiNote: 38, step: 'P', alter: 0, octave: 1, duration: 1, startTime: 14, velocity: 80 },
          { id: 'bp15', pitch: 'kick', midiNote: 36, step: 'P', alter: 0, octave: 1, duration: 1, startTime: 16, velocity: 78 },
          { id: 'bp16', pitch: 'snare', midiNote: 38, step: 'P', alter: 0, octave: 1, duration: 1, startTime: 18, velocity: 80 },
          { id: 'bp17', pitch: 'kick', midiNote: 36, step: 'P', alter: 0, octave: 1, duration: 1, startTime: 20, velocity: 78 },
          { id: 'bp18', pitch: 'snare', midiNote: 38, step: 'P', alter: 0, octave: 1, duration: 1, startTime: 22, velocity: 80 },
          { id: 'bp19', pitch: 'crash', midiNote: 49, step: 'P', alter: 0, octave: 1, duration: 4, startTime: 24, velocity: 85 },
        ],
      },
      {
        id: 'bossa-choir',
        name: 'Vocal Harmonies (Scat)',
        family: 'choir',
        subInstrument: 'Vocal Jazz "Doo-Bah"',
        clef: 'treble',
        color: '#ec4899',
        iconName: 'users',
        volume: 0.82,
        pan: 0.15,
        reverbSend: 0.5,
        muted: false,
        solo: false,
        notes: [
          { id: 'bc1', pitch: 'C5', midiNote: 72, step: 'C', alter: 0, octave: 5, duration: 2, startTime: 0, velocity: 80, lyric: 'Doo-' },
          { id: 'bc2', pitch: 'A4', midiNote: 69, step: 'A', alter: 0, octave: 4, duration: 2, startTime: 2, velocity: 82, lyric: '-bah' },
          { id: 'bc3', pitch: 'D5', midiNote: 74, step: 'D', alter: 0, octave: 5, duration: 2, startTime: 4, velocity: 80, lyric: 'doo-' },
          { id: 'bc4', pitch: 'Bb4', midiNote: 70, step: 'B', alter: -1, octave: 4, duration: 2, startTime: 6, velocity: 82, lyric: '-bah' },
          { id: 'bc5', pitch: 'E5', midiNote: 76, step: 'E', alter: 0, octave: 5, duration: 2, startTime: 8, velocity: 84, lyric: 'yeah-' },
          { id: 'bc6', pitch: 'C5', midiNote: 72, step: 'C', alter: 0, octave: 5, duration: 2, startTime: 10, velocity: 80, lyric: '-ah' },
          { id: 'bc7', pitch: 'F5', midiNote: 77, step: 'F', alter: 0, octave: 5, duration: 4, startTime: 12, velocity: 88, lyric: 'bossa!' },
          { id: 'bc8', pitch: 'A4', midiNote: 69, step: 'A', alter: 0, octave: 4, duration: 4, startTime: 24, velocity: 85, lyric: 'ooh...' },
        ],
      },
    ],
  },
];
