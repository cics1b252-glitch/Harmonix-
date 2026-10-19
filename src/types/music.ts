export type InstrumentFamily = 
  | 'strings'      // Cordas (Violinos, Cello, Contrabaixo, Violão)
  | 'keys'         // Teclas (Piano, Órgão, Cravo, Sintetizador)
  | 'percussion'   // Percussão (Bateria, Caixa, Bumbo, Tímpanos, Pratos)
  | 'woodwinds'    // Sopros / Madeiras (Flauta, Clarinete, Oboé, Saxofone)
  | 'brass'        // Metais (Trompete, Trombone, Trompa, Tuba)
  | 'choir';       // Coral / Vocais (Soprano, Contralto, Tenor, Baixo)

export type ClefType = 'treble' | 'bass' | 'percussion';

export interface Note {
  id: string;
  pitch: string;       // e.g., "C4", "G#3", "Bb5", or "kick", "snare", "hihat"
  midiNote: number;    // MIDI 0-127 (e.g. 60 = C4, 69 = A4)
  step: 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B' | 'P'; // 'P' for percussion
  alter: number;       // -1 = flat, 0 = natural, 1 = sharp
  octave: number;      // 0 to 8
  duration: number;    // in quarter beats: 4 = whole (semibreve), 2 = half (mínima), 1 = quarter (semínima), 0.5 = eighth (colcheia), 0.25 = sixteenth (semicolcheia)
  startTime: number;   // in beats from measure start (0, 1, 2, 2.5, etc.)
  velocity: number;    // 0-127
  isRest?: boolean;    // pause/rest symbol
  lyric?: string;      // vocal text for choir
  accent?: boolean;
  staccato?: boolean;
  tab?: {
    string: number;    // 1 to 6 for guitar (1=high E, 2=B, 3=G, 4=D, 5=A, 6=low E)
    fret: number;      // 0, 1, 2, 3...
  };
  chordSymbol?: string; // e.g. "A", "E/G#", "F#m", "D/F#", "E7sus4", "E7"
}

export interface Measure {
  number: number;
  timeSignature: {
    beats: number;       // e.g. 4
    beatType: number;    // e.g. 4
  };
  notes: Note[];
}

export interface Track {
  id: string;
  name: string;
  family: InstrumentFamily;
  subInstrument: string;  // e.g. "Violoncelo Solo", "Piano de Cauda Steinway", etc.
  soundfontKey?: string;  // FluidR3 soundfont instrument key
  hasTablature?: boolean; // Display guitar 6-string TAB
  clef: ClefType;
  color: string;
  iconName: string;
  volume: number;         // 0 to 1
  pan: number;            // -1 to 1
  reverbSend: number;     // 0 to 1
  muted: boolean;
  solo: boolean;
  notes: Note[];          // All notes across the piece with continuous startTime in beats
}

export interface StemAuditScore {
  family: InstrumentFamily;
  namePt: string;
  concordancePercent: number; // e.g. 84.5%
  detectedNotesCount: number;
  pitchAccuracyPercent: number;
  rhythmAlignmentPercent: number;
  status: 'approved' | 'calibrated' | 'review';
}

export interface ScoreAuditReport {
  overallConcordance: number; // 0 to 100% (target > 70%)
  targetThreshold: number;   // 70
  passedAudit: boolean;      // overallConcordance >= 70
  timestamp: string;
  sourceAudioDurationSec: number;
  spectralCorrelation: number; // 0 to 100%
  harmonicMatch: number;       // 0 to 100%
  rhythmAccuracy: number;      // 0 to 100%
  tempoMatchPercent: number;   // e.g. 98%
  stemAudits: Record<InstrumentFamily, StemAuditScore>;
  notesAuditedCount: number;
  auditNotes: string[];
  webAided?: boolean;
  webReferenceSource?: string;
}

export interface ScoreChord {
  beat: number;
  chord: string;
  diagram?: string;       // e.g. "x02220", "4x245x", "244222", "2x0232"
  fret?: number;          // base fret
}

export interface Score {
  id: string;
  title: string;
  composer: string;
  genre?: string;
  bpm: number;
  keySignature: string;   // e.g. "C Major", "G Major", "D Minor", etc.
  timeSignature: {
    beats: number;
    beatType: number;
  };
  totalMeasures: number;
  tracks: Track[];
  sourceType: 'audio_separated' | 'sheet_ocr' | 'midi_imported' | 'composed' | 'preset';
  sourceFileName?: string;
  createdAt: string;
  auditReport?: ScoreAuditReport;
  chords?: ScoreChord[];
  hasTablature?: boolean;
  hasChords?: boolean;
}

export interface InstrumentFamilyMetadata {
  family: InstrumentFamily;
  namePt: string;
  nameEn: string;
  color: string;
  accentColor: string;
  bgLight: string;
  borderLight: string;
  description: string;
  instrumentsPt: string[];
  defaultClef: ClefType;
}

export const INSTRUMENT_FAMILIES: Record<InstrumentFamily, InstrumentFamilyMetadata> = {
  strings: {
    family: 'strings',
    namePt: 'Cordas',
    nameEn: 'Strings',
    color: '#8b5cf6', // Violet
    accentColor: '#a78bfa',
    bgLight: 'rgba(139, 92, 246, 0.12)',
    borderLight: 'rgba(139, 92, 246, 0.3)',
    description: 'Violinos, Violas, Violoncelos, Contrabaixos e Violões acústicos',
    instrumentsPt: ['Violino I', 'Violino II', 'Violoncelo', 'Contrabaixo Acústico'],
    defaultClef: 'treble',
  },
  keys: {
    family: 'keys',
    namePt: 'Teclas',
    nameEn: 'Keys & Piano',
    color: '#3b82f6', // Blue
    accentColor: '#60a5fa',
    bgLight: 'rgba(59, 130, 246, 0.12)',
    borderLight: 'rgba(59, 130, 246, 0.3)',
    description: 'Piano de Cauda, Teclado Elétrico, Cravo e Órgão de Tubos',
    instrumentsPt: ['Piano de Cauda', 'Piano Elétrico', 'Órgão Hammond', 'Cravo'],
    defaultClef: 'treble',
  },
  percussion: {
    family: 'percussion',
    namePt: 'Percussão',
    nameEn: 'Drums & Percussion',
    color: '#f97316', // Orange
    accentColor: '#fb923c',
    bgLight: 'rgba(249, 115, 22, 0.12)',
    borderLight: 'rgba(249, 115, 22, 0.3)',
    description: 'Bateria, Caixa, Bumbo, Tímpanos, Pratos e Shakers',
    instrumentsPt: ['Bateria Completa', 'Caixa Orquestral', 'Tímpanos', 'Pratos & Bumbo'],
    defaultClef: 'percussion',
  },
  woodwinds: {
    family: 'woodwinds',
    namePt: 'Sopros (Madeiras)',
    nameEn: 'Woodwinds',
    color: '#10b981', // Emerald
    accentColor: '#34d399',
    bgLight: 'rgba(16, 185, 129, 0.12)',
    borderLight: 'rgba(16, 185, 129, 0.3)',
    description: 'Flauta Transversal, Clarinete, Oboé, Fagote e Saxofone',
    instrumentsPt: ['Flauta', 'Clarinete em Bb', 'Oboé', 'Saxofone Alto'],
    defaultClef: 'treble',
  },
  brass: {
    family: 'brass',
    namePt: 'Metais',
    nameEn: 'Brass',
    color: '#eab308', // Amber / Gold
    accentColor: '#facc15',
    bgLight: 'rgba(234, 179, 8, 0.12)',
    borderLight: 'rgba(234, 179, 8, 0.3)',
    description: 'Trompete, Trombone, Trompa Francesa, Flugelhorn e Tuba',
    instrumentsPt: ['Trompete em C', 'Trombone Tenor', 'Trompa Francesa', 'Tuba'],
    defaultClef: 'treble',
  },
  choir: {
    family: 'choir',
    namePt: 'Coral & Vozes',
    nameEn: 'Choir & Vocals',
    color: '#ec4899', // Pink
    accentColor: '#f472b6',
    bgLight: 'rgba(236, 72, 153, 0.12)',
    borderLight: 'rgba(236, 72, 153, 0.3)',
    description: 'Coral SATB (Soprano, Contralto, Tenor, Baixo) e Harmonias Vocais',
    instrumentsPt: ['Soprano & Contralto', 'Tenor & Baixo', 'Coral Misto "Aah/Ooh"'],
    defaultClef: 'treble',
  },
};

export interface AudioAnalysisProgress {
  stage: 'idle' | 'uploading' | 'decoding' | 'analyzing_frequency' | 'ai_separating' | 'generating_score' | 'complete' | 'error';
  message: string;
  progressPercent: number;
  detectedTempos?: number;
  detectedKey?: string;
}
